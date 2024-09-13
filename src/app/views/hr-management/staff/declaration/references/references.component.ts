import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService } from 'src/app/services';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { MatDialog } from '@angular/material/dialog';
import { config } from 'src/config';
// import { getSpecieFieldMsg } from '../../../shared/field-validation-messages';
@Component({
  selector: 'app-references',
  templateUrl: './references.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class ReferencesComponent extends GlobalFormComponent implements OnInit
{
  footerProps: any;

 constructor(protected router: Router,
		protected _route: ActivatedRoute,
		protected alertService: AlertService,
		protected apiService: ApiService,
		protected formbuilder: FormBuilder,
		protected dialog: MatDialog)
  {

    super(router, _route, alertService, apiService, formbuilder,dialog);
    this.Form.addControl('name', new FormControl(null));
    this.Form.addControl('reg', new FormControl(null));
    this.Form.addControl('phone', new FormControl(null));
    this.Form.addControl('open', new FormControl(null));
    this.Form.addControl('close', new FormControl(null));
    this.Form.addControl('post', new FormControl(null));
    this.Form.addControl('address', new FormControl(null));
    this.Form.addControl('city', new FormControl(null));
    // this.Form.addControl('nameEn', new FormControl(null, [Validators.required, Validators.minLength(4), Validators.maxLength(16)]));
    // this.Form.addControl('nameUr', new FormControl(null, [Validators.required, Validators.minLength(4), Validators.maxLength(16)]));
    // this.Form.addControl('alternativeNameEn', new FormControl(null, [Validators.minLength(4), Validators.maxLength(16)]));
    // this.Form.addControl('alternativeNameUr', new FormControl(null, [Validators.minLength(4), Validators.maxLength(16)]));
    // this.Form.addControl('seedCountPerKg', new FormControl(null, [Validators.required, Validators.max(1000000), Validators.min(1)]));
    // this.Form.addControl('benchmarkSuccessRatio', new FormControl('', [Validators.required, Validators.max(100), Validators.min(0)]));
    // // this.Form.addControl('dueDate', new FormControl(null, ));
    // this.Form.addControl('startDate', new FormControl(null, [Validators.required]));
    // this.Form.addControl('dueDate', new FormControl(null, [Validators.required]));


    this.title = "Issue";
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
      // 'subButtonLabel': "Add Another History"
    };

  }

  // getErrorMessage(field: any): any
  // {
  //   return getSpecieFieldMsg[field];
  // }

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
