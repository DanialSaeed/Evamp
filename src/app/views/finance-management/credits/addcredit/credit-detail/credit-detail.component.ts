import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray } from '@angular/forms';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { addDays, isThisISOWeek } from 'date-fns';
import * as moment from 'moment';
import { AlertService, ApiService, PermissionService, UtilsService } from 'src/app/services';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { config } from 'src/config';
import { getCreditsFieldMsg } from '../../../../../shared/field-validation-messages';
@Component({
  selector: 'app-credit-detail',
  templateUrl: './credit-detail.component.html',
  styleUrls: ['/src/app/views/shared-style.scss', './credit-detail.component.scss']
})
export class CreditDetailComponent extends GlobalFormComponent implements OnInit
{
  footerProps: any;
  csvButton: any
  sessions: any = [];
  calendar: String = "assets/images/sdn/ic_event_24px.svg"
  childName: String;
  creditDetails: FormGroup;
  selectedRoom: any = {};
  monday: FormGroup;
  tuesday: FormGroup;
  wednesday: FormGroup;
  thursday: FormGroup;
  friday: FormGroup;

  timeVar: any;
  isAllSessionsEnabled = true;
  startDate: any;
  endDate: any;
  @Input() childIds: any;
  @Output() emitSelectedItems: EventEmitter<any> = new EventEmitter<any>();
  csvEndpoint = '';

  constructor(protected router: Router,
    protected _route: ActivatedRoute,
    protected alertService: AlertService,
    protected apiService: ApiService,
    protected formbuilder: FormBuilder,
    protected dialog: MatDialog,
    protected util: UtilsService,
    protected permissionsService: PermissionService)
  {
    super(router, _route, alertService, apiService, formbuilder, dialog, permissionsService);

    this.Form = this.formbuilder.group({
      'id': new FormControl(null, []),
      'start': new FormControl(null, [Validators.required]),
      'end': new FormControl(null, [Validators.required]),
      'startDate': new FormControl(null, [Validators.required]),
      'endDate': new FormControl(null, [Validators.required]),
      'memo': new FormControl(null,[this.util.trimWhitespaceValidator]),
      'amount': new FormControl(null, [Validators.required]),
      'matAmount': new FormControl(null),
      'childIds': new FormControl(null),
      'childId': new FormControl(null),
      'branchId': new FormControl(localStorage.getItem('branchId')),
      'isGenerateCsv': new FormControl(false)
    });

    this.minDate = new Date();
    this.editPermit = this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Credit').update
  }

  ngOnInit(): void
  {
    super.ngOnInit();
    this.sub = this._route.params.subscribe(params =>
    {
      this.id = params['id'];
      if (this.id == 'new')
      {
        this.formApi = config.base_url_slug + "add/childs/credit";
        this.csvEndpoint = config.base_url_slug + 'export/childs/credits-csv';
      }
      else
      {
        this.formApi = config.base_url_slug + "update/child/credit/" + this.id;
        this.detailApi = config.base_url_slug + 'find/childs/credits/' + this.id;
        this.csvEndpoint = config.base_url_slug + "update/child/credit/" + this.id;
        this.getDetail();
      }
    });

    this.footerProps =
    {
      'buttonLabel': "Approved",
      'hasSubButton': true,
      'type': 'output'
    };
    this.csvButton = {
      buttonLabel: "Save as CSV",
      color: "#E2AF2A",
      buttonRoute: "",
      type: "output",
      visibility: true
    },

      console.log('this.type', this.type);
      console.log(this.Form);

  }

  getErrorMessage(field: any, form?): any
	{
		if (form) {
			return form.get(field) && form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getCreditsFieldMsg[field];
		}
		return this.Form.get(field) && this.Form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getCreditsFieldMsg[field];
	}

  checkValidations()
  {
    if (this.Form.invalid)
    {
      return false;
    }
    return true;
  }

  afterDetail(): void
  {
    this.Form.patchValue(this.formDetail);
    console.log(this.formDetail);
    this.Form.get('start').setValue(this.formDetail.startDate);
    this.Form.get('end').setValue(this.formDetail.endDate);

    if (this.formDetail.amount)
    {
      this.Form.get('matAmount').setValue(this.formDetail.amount);
    }
  }

  clearForm()
  {
    this.Form.reset();
    this.Form.get('branchId').setValue(localStorage.getItem('branchId'));
    this.Form.get('isGenerateCsv').setValue(false);
    console.log(this.Form);
  }

  afterSuccessfullyAdd()
  {
  }

  beforeSubmit()
  {
    this.setDate();
    this.Form.get('childIds').setValue(this.childIds);
    this.isAllSessionsEnabled = true;
    if (this.checkValidations() == true) {

    } else {
      this.Form.setErrors({ 'invalid': true });
    }

    let invalid = this.findInvalidControls(this.Form);
    console.log('findInvalidControls', invalid);

  }
  onBlurEvent(event)
  {
    if (event.target.value < 1 || event.target.value == "" || event.target.value > 99999.99)
    {
      this.Form.controls['amount'].setErrors({ 'incorrect': true });
      this.Form.controls['matAmount'].setErrors(null);
      this.alertService.alertError('Warning', 'The amount length must be five digits');
    }
    else
    {
      this.Form.controls['amount'].setErrors(null);
      this.Form.controls['matAmount'].setErrors(null);
      this.Form.controls['amount'].patchValue(parseFloat(event.target.value).toFixed(2))
    }
  }


  onSaveCSV()
  {
    this.beforeSubmit();

    if (this.Form.invalid)
    {
      this.alertService.alertError('WARNING', 'Please fill the required data.');
      return;
    }

    let type = '';

    if (this.csvEndpoint.includes('update')) {
      this.Form.get('isGenerateCsv').setValue(true);
      type = 'patch'
    } else {
      type = 'post'
    }

    this.apiService[type](this.csvEndpoint, this.Form.value).then((res)=> {
      console.log(res);
      if (res.code == 200 || res.code == 201 || res.code == 202) {
        window.history.back();
        this.downloadCSV(res.data);
        // this.router.navigate(['main/finance/allInvoice']);
        this.alertService.alertSuccess('SUCCESS', 'CSV Downloaded');
      }
    })
    .catch(err => console.log(err));

  }

  onSubmit() {
    this.beforeSubmit();

    if (this.Form.invalid)
    {
      this.alertService.alertError('WARNING', 'Please fill the required data.');
      return;
    }

    let heading = 'Confirmation';
    let message = 'Are you sure you want to add this credit - £'+ this.Form.get('amount').value;
    let rightButton = 'Yes';
    let leftButton = 'No';
    this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then(result => {
      console.log(result);
      if (!result) {
        return;
      } else {
        let url = '';
        let type = '';
        if (this.id == 'new')
        {
          url = config.base_url_slug + "add/childs/credit";
          type = 'post';
        }
        else
        {
          url = config.base_url_slug + "update/child/credit/" + this.id;
          type = 'patch';
        }

        this.apiService[type](url, this.Form.value).then((res)=> {
          console.log(res);
          if (res.code == 200 || res.code == 201 || res.code == 202) {
            // this.router.navigate(['main/finance/allInvoice']);
            this.alertService.alertSuccess('SUCCESS', res.message).then(result => {
                window.history.back();
              });
          }
        })
        .catch(err => console.log(err));
      }
    });


  }

  downloadCSV(url) {
    let link = document.createElement('a');
    link.href = url;
    link.download = url.substr(url.lastIndexOf('/') + 1);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  valueChange() {

  }

  setDate() {
    if (this.Form.get('start').value != null) {
      this.startDate = moment(new Date(this.Form.get('start').value)).format(config.serverDateFormat);
      this.endDate = moment(new Date(this.Form.get('end').value)).format(config.serverDateFormat);
      this.Form.get('startDate').setValue(this.startDate);
      this.Form.get('endDate').setValue(this.endDate);
      console.log(this.startDate, this.endDate);
    }
  }

  onClosed(): void {
    if (this.Form.get('startDate').value == null || this.Form.get('endDate').value == null) {
        this.onClear();
    }
  }

  onClear() {
    this.Form.get('startDate').setValue(null);
    this.Form.get('endDate').setValue(null);
  }

  onCancel() {
    this.type = 'view';
    this.checkType();
  }

  getField(field: any, form?: any): any
  {
    return this.Form.get(field).invalid;
  }
}
