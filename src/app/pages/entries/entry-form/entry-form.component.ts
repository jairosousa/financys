import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Entry } from '../shared/entry.model';

import { switchMap } from 'rxjs/operators';
import toastr from 'toastr';
import { EntryService } from '../shared/entry.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent implements OnInit, AfterContentChecked {

  currentAction: string;
  form: FormGroup;
  pageTitle: string;
  serverErrorMenssages: string[] = null;
  submittingForm = false;
  entry: Entry = new Entry();

  constructor(
    private entryServe: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.setCurrentyAction();
    this.buildEntryFrom();
    this.loadEntry();
  }

  public submitForm() {
    this.submittingForm = true;
    if (this.currentAction === 'new') {
      this.createEntry();
    } else {
      this.updateEntry();
    }
  }

  // PRIVATE METHODOS
  private setCurrentyAction() {
    if (this.route.snapshot.url[0].path === 'new') {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  private buildEntryFrom() {
    this.form = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null],
      type: [null, [Validators.required]],
      amount: [null, [Validators.required]],
      date: [null, [Validators.required]],
      paid: [null, [Validators.required]],
      categoryId: [null, [Validators.required]],
    });
  }

  private loadEntry(): any {
    if (this.currentAction === 'edit') {
      this.route.paramMap.pipe(
        switchMap(params => this.entryServe.getById(+params.get('id')))
      ).subscribe(
        (entry) => {
          this.entry = entry;
          this.form.patchValue(entry); // bind losder entry data to form
        },
        (error) => alert('Ocorreu um erro no servidor, tente mais tarde')
      );
    }
  }

  private setPageTitle(): any {
    if (this.currentAction === 'new') {
      this.pageTitle = 'Cadastro de Novo Lançamento';
    } else {
      const entryName = this.entry.name || '';
      this.pageTitle = 'Editando Lançamento: ' + entryName;
    }
  }

  private createEntry() {
    const entry: Entry = Object.assign(new Entry(), this.form.value);
    this.entryServe.create(entry)
      .subscribe( entry => this.actionsForSucess(entry),
        error => this.actionsFormError(error)
      );
  }
  private updateEntry() {
    const entry: Entry = Object.assign(new Entry(), this.form.value);
    this.entryServe.update(entry)
      .subscribe(entry => this.actionsForSucess(entry),
        error => this.actionsFormError(error)
      );
  }

  // Redicet/reload component page
  private actionsForSucess(entry: Entry) {
    toastr.success('Solicitação processada com sucesso');

    this.router.navigateByUrl('entries', { skipLocationChange: true })
      .then(
        () => this.router.navigate(['entries', entry.id, 'edit'])
      );
  }

  private actionsFormError(error) {
    toastr.error('Ocorreu um erro ao processar a sua solicitação');
    this.submittingForm = false;
    if (error.status === 422) {
      this.serverErrorMenssages = JSON.parse(error._body).errors;
    } else {
      this.serverErrorMenssages = ['Falha na Comunicação com o servidor. Por favor tente mais tarde.'];
    }
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }


}
