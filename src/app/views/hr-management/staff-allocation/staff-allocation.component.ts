import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService } from 'src/app/services';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { config } from 'src/config';
import { getSpecieFieldMsg } from '../../../shared/field-validation-messages';
@Component({
  selector: 'app-staff-allocation',
  templateUrl: './staff-allocation.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class StaffAllocationComponent extends GlobalFormComponent implements OnInit
{
  footerProps: any;

  constructor(protected router: Router,
    protected _route: ActivatedRoute,
    protected alertService: AlertService,
    protected apiService: ApiService,
    protected formbuilder: FormBuilder,
    protected dialog: MatDialog,
    )
  {

    super(router, _route, alertService, apiService, formbuilder,dialog);
    this.Form.addControl('date', new FormControl(null));
    this.Form.addControl('room', new FormControl(null)); 
    this.Form.addControl('option', new FormControl(null));
    this.Form.addControl('total', new FormControl(null));
    this.Form.addControl('occupied', new FormControl(null));
    this.Form.addControl('startDate', new FormControl(null, [Validators.required]));
    this.Form.addControl('endDate', new FormControl(null, [Validators.required]));
    this.hasFile = true;
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

    this.footerProps = {
      'buttonLabel': "Save Info",
      'hasSubButton': false,
    };

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
}
