import { OnInit, AfterContentChecked, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { BaseResourceModel } from '../../models/base-resource.model';
import { BaseResourceService } from '../../services/base-resource.service';

import { switchMap } from 'rxjs/operators';
import toastr from 'toastr';


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
        this.buildResourceForm();
        this.loadResource();
    }

    ngAfterContentChecked(): void {
        this.setPageTitle();
    }

    public submitForm() {
        this.submittingForm = true;
        if (this.currentAction === 'new') {
            this.createResource();
        } else {
            this.updateResource();
        }
    }

    // PROTECTED METHODOS
    protected setCurrentyAction() {
        if (this.route.snapshot.url[0].path === 'new') {
            this.currentAction = 'new';
        } else {
            this.currentAction = 'edit';
        }
    }

    protected loadResource(): any {
        if (this.currentAction === 'edit') {
            this.route.paramMap.pipe(
                switchMap(params => this.resourceService.getById(+params.get('id')))
            ).subscribe(
                (resource) => {
                    this.resource = resource;
                    this.resourceForm.patchValue(resource); // bind losder resource data to categoryForm
                },
                (error) => alert('Ocorreu um erro no servidor, tente mais tarde')
            );
        }
    }

    protected setPageTitle(): any {
        if (this.currentAction === 'new') {
            this.pageTitle = this.createPageTitle();
        } else {
            this.pageTitle = this.editionPageTitle();
        }
    }

    protected createPageTitle(): string {
        return 'Novo';
    }

    protected editionPageTitle(): string {
        return 'Edição';
    }

    protected createResource() {
        const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);
        this.resourceService.create(resource)
            .subscribe(
                // tslint:disable-next-line:no-shadowed-variable
                resource => this.actionsForSucess(resource),
                error => this.actionsFormError(error)
            );
    }
    protected updateResource() {
        const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);
        this.resourceService.update(resource)
            .subscribe(
                // tslint:disable-next-line:no-shadowed-variable
                resource => this.actionsForSucess(resource),
                error => this.actionsFormError(error)
            );
    }
    // Redicet/reload component page
    protected actionsForSucess(resource: T) {
        toastr.success('Solicitação processada com sucesso');

        const baseComponentPath = this.route.snapshot.parent.url[0].path;

        this.router.navigateByUrl(baseComponentPath, { skipLocationChange: true })
            .then(
                () => this.router.navigate([baseComponentPath, resource.id, 'edit'])
            );
    }

    protected actionsFormError(error) {
        toastr.error('Ocorreu um erro ao processar a sua solicitação');
        this.submittingForm = false;
        if (error.status === 422) {
            this.serverErrorMenssages = JSON.parse(error._body).errors;
        } else {
            this.serverErrorMenssages = ['Falha na Comunicação com o servidor. Por favor tente mais tarde.'];
        }
    }

    protected abstract buildResourceForm(): void;
}
