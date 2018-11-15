import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Category } from '../shared/category.model';

import { switchMap } from 'rxjs/operators';
import toastr from 'toastr';
import { CategoryService } from '../shared/category.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit, AfterContentChecked {

  currentAction: string;
  categoryForm: FormGroup;
  pageTitle: string;
  serverErrorMenssages: string[] = null;
  submittingForm = false;
  category: Category = new Category();

  constructor(
    private categoryserve: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.setCurrentyAction();
    this.buildCategoryFrom();
    this.loadCategory();
  }

  public submitForm() {
    this.submittingForm = true;
    if (this.currentAction == 'new') {
      this.createCategory();
    } else {
      this.updateCategory();
    }
  }

  // PRIVATE METHODOS
  private setCurrentyAction() {
    if (this.route.snapshot.url[0].path == 'new') {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  private buildCategoryFrom() {
    this.categoryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null]
    });
  }

  private loadCategory(): any {
    if (this.currentAction === 'edit') {
      this.route.paramMap.pipe(
        switchMap(params => this.categoryserve.getById(+params.get('id')))
      ).subscribe(
        (category) => {
          this.category = category;
          this.categoryForm.patchValue(category); // bind losder category data to categoryForm
        },
        (error) => alert('Ocorreu um erro no servidor, tente mais tarde')
      );
    }
  }

  private setPageTitle(): any {
    if (this.currentAction === 'new') {
      this.pageTitle = 'Cadastro de Nova categoria';
    } else {
      const categoryName = this.category.name || '';
      this.pageTitle = 'Editando categoria: ' + categoryName;
    }
  }

  private createCategory() {
    const category: Category = Object.assign(new Category(), this.categoryForm.value);
    this.categoryserve.create(category)
      .subscribe( category => this.actionsForSucess(category),
        error => this.actionsFormError(error)
      );
  }
  private updateCategory() {
    const category: Category = Object.assign(new Category(), this.categoryForm.value);
    this.categoryserve.update(category)
      .subscribe(category => this.actionsForSucess(category),
        error => this.actionsFormError(error)
      );
  }

  // Redicet/reload component page
  private actionsForSucess(category: Category) {
    toastr.success('Solicitação processada com sucesso');

    this.router.navigateByUrl('categories', { skipLocationChange: true })
      .then(
        () => this.router.navigate(['categories', category.id, 'edit'])
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
