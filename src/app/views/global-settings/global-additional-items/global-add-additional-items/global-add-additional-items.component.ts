import { Component, Input, OnInit, } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, CommunicationService, PermissionService, UtilsService } from 'src/app/services';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import * as moment from 'moment';
import { config } from 'src/config';
import { getParentFieldMsg, globalSettingFieldMsg } from 'src/app/shared/field-validation-messages';

@Component({
  selector: 'app-global-add-additional-items',
  templateUrl: './global-add-additional-items.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class GlobalAddAdditionalItemsComponent extends GlobalFormComponent implements OnInit
{
  Form: FormGroup;
  calendar: String = "assets/images/sdn/ic_event_24px.svg"

  footerProps: any;
  childs: any;
  rateError = false;
  editPermit: any;

  additionalItems = [
    { value: "additional_item", label: 'Additional Item/Service' },
    { value: "meal", label: 'Meal' },
  ];

  constructor(protected router: Router,
    protected _route: ActivatedRoute,
    protected alertService: AlertService,
    protected apiService: ApiService,
    protected formbuilder: FormBuilder,
    protected dialog: MatDialog,
    protected util: UtilsService,
    protected communicationService: CommunicationService,
    protected permissionsService: PermissionService)
  {

    super(router, _route, alertService, apiService, formbuilder, dialog);
    this.Form.addControl('category', new FormControl('', [Validators.required]));
    this.Form.addControl('name', new FormControl('', [Validators.required, this.util.trimWhitespaceValidator]));
    this.Form.addControl('amount', new FormControl('', [Validators.required]));
    this.Form.addControl('branchId', new FormControl('', [Validators.required]));
    this.Form.addControl('matRate', new FormControl('', [Validators.required, Validators.max(999999)]));
    super.ngOnInit();
    this.editPermit = true

  }
  ngOnInit()
  {
    this.title = "Additional Items"
    this.Form.get('branchId').setValue(localStorage.getItem('branchId'));
    this.sub = this._route.params.subscribe(params =>
    {
      this.id = params['id'];
      if (params.type == "view")
      {
        this.disableInput = true;
      }

      if (this.id == 'add')
      {
        this.formApi = config.base_url_slug + "add/global/additionalItem";
      }
      else
      {
        this.formApi = config.base_url_slug + 'update/global/additionalItem/' + this.id;
      }
    })
    this.footerProps.buttonLabel = "Save";
    if (this.id != 'add')
    {
      this.getAdditionalItems();
    }
  }
  getAdditionalItems()
  {
    let branchId = localStorage.getItem('branchId');
    this.apiService.get(config.base_url_slug + 'view/global/additionalItem?branchId=' + branchId).then(res =>
    {
      let data = res.data.listing;
      data.forEach(element =>
      {
        if (element.id == this.id)
        {
          this.Form.patchValue(element);
          this.Form.get('matRate').setValue(element.amount)
        }
      });
    })
  }

  beforeSubmit()
  {
    this.isMultiple = true;
  }

  onBlurEvent(event)
  {
    if (event.target.value < 0)
    {
      this.Form.get('amount').setValue(null);
      this.Form.get('matRate').setValue(null);
      return;
    }

    if (event.target.value.includes('.'))
    {
      event.target.value = parseFloat(parseFloat(event.target.value).toFixed(2));
      this.Form.get('amount').setValue(event.target.value);
    } else
    {
      this.Form.get('amount').setValue(event.target.value);
    }
  }

  getErrorMessage(field: any, form?): any
	{
		if (form) {
			return form.get(field) && form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : globalSettingFieldMsg[field];
		}
		return this.Form.get(field) && this.Form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : globalSettingFieldMsg[field];
	}
  
  checkType()
  {
    if (this.type != "")
    {
      if (this.type === 'view')
      {
        this.title = "View " + this.title;
        this.footerProps = {
          'hasButton': false,
          'type': 'view'
        };
        this.onlyImage = true;
        this.Form.disable();
        this.disableInput = true
      }
      else if (this.type === 'edit')
      {
        this.footerProps = {
          'buttonLabel': "Update Info",
          'hasbackButton': true,
          'backButtonLabel': 'Cancel',
          'hasButton': true,
          'hasSubButton': false,

        };
        this.Form.enable();
        this.disableInput = false;
        this.onlyImage = false;
        this.title = "Update " + this.title;
      }
      else
      {
        this.footerProps = {
          'buttonLabel': "Save Info",
          'hasbackButton': true,
          'backButtonLabel': 'Cancel',
          'hasButton': true,
          'hasSubButton': false,
        };
        this.onlyImage = false;
        this.title = "Add New " + this.title;
      }
    }
  }
  checkFormUrls(): void
  {
    if (this.type == "view")
    {
    }
  }

  afterSuccessfullyAdd()
  {
    this.router.navigateByUrl('main/settings/additional-items')
  }

  goBack()
  {
    this.router.navigateByUrl('main/settings/additional-items')
  }

}
