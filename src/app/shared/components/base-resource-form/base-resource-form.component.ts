import { OnInit, AfterContentChecked, Injector } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { switchMap } from 'rxjs/operators';
import toastr from 'toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseResourceModel } from '../../models/base-resource.model';
import { BaseResourceService } from '../../services/base-resource.service';


export abstract class BseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {

    currentAction: string;
    resourceForm: FormGroup;
    pageTitle: string;
    serverErrorMenssages: string[] = null;
    submittingForm = false;

    protected route: ActivatedRoute;
    protected router: Router;
    protected formBuilder: FormBuilder;

    constructor(
        protected injector: Injector,
        public resource: T,
        protected resourceService: BaseResourceService<T>,
        protected jsonDataToResourceFn: (jsonData) => T
    ) {
        this.route = this.injector.get(ActivatedRoute);
        this.router = this.injector.get(Router);
        this.formBuilder = this.injector.get(FormBuilder);
     }

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
            .subscribe(category => this.actionsForSucess(category),
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
