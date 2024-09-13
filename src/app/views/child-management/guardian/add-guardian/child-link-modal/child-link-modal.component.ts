import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { map, startWith } from 'rxjs/operators';
import { AlertService, ApiService, AutocompleteFiltersService, CommunicationService, PermissionService } from 'src/app/services';
import { getParentFieldMsg } from 'src/app/shared/field-validation-messages';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { config } from 'src/config';

@Component({
  selector: 'app-child-link-modal',
  templateUrl: './child-link-modal.component.html',
  styleUrls: ['./child-link-modal.component.scss']
})
export class ChildLinkModalComponent extends GlobalFormComponent implements OnInit
{
  type: any;
  title = "";
  guardianId: any;
  formType: any;
  relationType: any;
  child: any;
  buttonLabel: any = "Save Info";
  isRelationTypeOther:boolean =false;
  relations: any[];
  unlinkChildrens: any[] = [];
  filteredUnlinkedChildrens: any[] = [];

  constructor(protected router: Router,
    protected _route: ActivatedRoute,
    protected alertService: AlertService,
    protected apiService: ApiService,
    protected formbuilder: FormBuilder,
    protected dialog: MatDialog,
    protected filterService: AutocompleteFiltersService,
    protected communicationService: CommunicationService,
    protected permissionsService: PermissionService,
    protected dialogRef: MatDialogRef<ChildLinkModalComponent>,)
  {

    super(router, _route, alertService, apiService, formbuilder, dialog, permissionsService);
    this.Form.addControl('childId', new FormControl(null, [Validators.required]));
    this.Form.addControl('childLabel', new FormControl(null, [Validators.required]));
    this.Form.addControl('guardianId', new FormControl(null, Validators.required));
    this.Form.addControl('guardianRelationId', new FormControl(null, [Validators.required]));
    this.Form.addControl('name', new FormControl(null));

    this.filteredUnlinkedChildrens = [...this.unlinkChildrens];
    // Populate autcomplete data for nationality
		let children = this.Form.get('childLabel').valueChanges.pipe(
			startWith(''),
			map(value => this.filterService._filterUnlinkedChildrens(value, this.unlinkChildrens))
		);
    children.subscribe((d) => this.filteredUnlinkedChildrens = d);
		// End
  }

  ngOnInit(): void
  {
    if(this.relationType=='other' || this.relationType=='Other')
    {
        this.Form.get('guardianRelationId').setValue('other');
        this.Form.get('guardianRelationId').disable();
    }
    this.Form.get('guardianId').setValue(this.parentId);

    if (this.formType == 'add')
    {
      this.formApi = config.base_url_slug + "add/link-child";
    }
    else
    {
      this.buttonLabel = "Update Info";
      this.type = 'edit'
      this.Form.patchValue(this.child);
      this.formApi = config.base_url_slug + 'update/linked-child/' + this.child.id;
      this.detailApi = config.base_url_slug + 'view/link-child/' + this.child.guardianId;

    }
    super.ngOnInit();
    if(this.type != 'edit')
    {
      this.getChildrens(this.parentId);
    }
    this.getRelation();
  }
  getRelation()
  {
    this.apiService.get(config.base_url_slug + 'view/guardianRelation').then(res =>
    {
      if (res)
      {
        this.relations = res.data.listing;
        if (this.relationType == "other" || this.relationType == "Other")
        {
          let relation = this.relations.find(t => t.relationType === "Other")
          this.Form.get('guardianRelationId').setValue(relation.id);
          this.isRelationTypeOther = true;
        }
          if (this.relationType != "other" && this.relationType != "Other")
          {
              for (let index = 0; index < this.relations.length; index++)
              {
                  if (this.relations[index]?.relationType == 'Other')
                  {
                      this.relations.splice(index, 1)
                  }
              }
          }
      }
    })
  }
  getChildrens(guardianId: any)
  {    
    this.apiService.get(config.base_url_slug + 'view/unlink-childs/' + guardianId).then(res =>
    {
      this.unlinkChildrens = res.data.listing;
      this.filteredUnlinkedChildrens = [...this.unlinkChildrens];
    })
  }

  setChildId() {
    let child = this.unlinkChildrens.find(x => x.data.name == this.Form.get('childLabel').value);
    this.Form.get('childId').setValue(child.childId);
  }

  checkFormUrls()
  {
  }

  getErrorMessage(field: any): any
  {
    return getParentFieldMsg[field];
  }

  afterDetail(): void
  {
    this.Form.patchValue(this.formDetail);
  }

  onSubmit()
  {
    this.beforeSubmit();
    let url = '';
    let type = '';
    if (this.Form.invalid)
    {
      this.alertService.alertError('WARNING', 'Please fill the required data.');
      return;
    }
    this.Form.get('guardianRelationId').enable();

    if (this.formType == 'add')
    {
      url = config.base_url_slug + "add/link-child";
      type = 'post';
    }
    else
    {
      url = config.base_url_slug + 'update/linked-child/' + this.child.id;
      type = 'patch';
    }

    this.apiService[type](this.formApi, this.Form.value).then((res) =>
    {
      if(this.relationType=='other')
      {
          this.Form.get('guardianRelationId').setValue('other');
          this.Form.get('guardianRelationId').disable();
      }
      console.log(res);
      if (res.code == 200 || res.code == 201)
      {
        this.alertService.alertSuccess('SUCCESS', res.message).then(result =>
        {
          window.history.back();
        });
      }
      if (res.code ==202 || res.code == 404)
      {
        this.alertService.alertInfo('WARNING', res.message);
      }
    })
      .catch(err => console.log(err));
  }

  beforeSubmit()
  {
    this.isMultiple = true;
  }

  beforeClear()
  {

  }
  onCancel()
  {
    this.dialogRef.close({ status: 'close' });
  }
  afterSuccessfullyAdd(): void
  {
    this.dialogRef.close({ status: 'close' });
    this.router.navigateByUrl('main/guardian');
  }

}
