import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlertService, ApiService } from 'src/app/services';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { getSpecieFieldMsg } from '../../../../shared/field-validation-messages';
import { SelectBranchDialogComponent } from 'src/app/core/select-branch-dialog/select-branch-dialog.component';
import { config } from 'src/config';
@Component({
  selector: 'app-allocation-form',
  templateUrl: './allocation-form.component.html',
  styleUrls: ['/src/app/views/shared-style.scss','./allocation-form.component.scss']
})
export class AllocationFormComponent extends GlobalFormComponent implements OnInit
{
  footerProps: any;
  emailIcon: String = "assets/images/plus.svg"
  constructor(protected router: Router,
    protected _route: ActivatedRoute,
    protected alertService: AlertService,
    protected apiService: ApiService,
    protected formbuilder: FormBuilder,
    protected dialog: MatDialog)
  {

    super(router, _route, alertService, apiService, formbuilder,dialog);
    this.Form.addControl('staffRole', new FormControl(null));
    this.Form.addControl('memberName', new FormControl(null));
  }

  ngOnInit(): void
  {
    this.sub = this._route.params.subscribe(params =>
    {
      this.id = params['id'];
      if (params.type == "edit")
      {
        this.Form.controls['id'].disable()
      }
      if (this.id == 'add') 
      {
        this.formApi = config.base_url_slug +"add/specie";
      }
      else
      {
        this.formApi = config.base_url_slug +'update/specie/' + this.id;
        this.detailApi = config.base_url_slug +'find/specie/' + this.id;
        this.getDetail();
      }
    });
    super.ngOnInit();

    // this.footerProps = {
    //   'buttonLabel': "Save Info",
    //   'hasSubButton': false,
    // };

  }

  getErrorMessage(field: any): any
  {
    return getSpecieFieldMsg[field];
  }
 
  afterDetail(): void
  {
    // if (this.inventoryType == 'consumable')
    // {
    this.Form.patchValue(this.formDetail);
    // }
    // else if (this.inventoryType == 'fixed')
    // {
    // 	this.customForm.patchValue(this.formDetail);
    // }
  }
  selectBranch(event)
  {  
    let dialogRef = this.dialog.open(SelectBranchDialogComponent, {
        autoFocus: false,
        maxHeight: '90vh',
        width: '40%',
        data: {
            event: event
        }

    });
}
  
}
