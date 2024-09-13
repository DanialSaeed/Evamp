import { GlobalListComponent } from '../../../../../shared/global-list';
import { Component, EventEmitter, Input, OnInit, Output,} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
// import { ApiService, AlertService, CommunicationService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService, AlertService, CommunicationService } from '../../../../../services';
import { config } from 'src/config';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { getSpecieFieldMsg } from 'src/app/shared/field-validation-messages';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import * as moment from 'moment';
import * as momentTz from 'moment-timezone';

@Component({
  selector: 'app-process-invoice',
  templateUrl: './process-invoice.component.html',
  styleUrls: ['/src/app/views/shared-style.scss', './process-invoice.component.scss']
})
export class ProcessInvoiceComponent extends GlobalFormComponent implements OnInit {

  footerProps: any;
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
  timeZone = momentTz().tz(moment.tz.guess()).format('Z');
	timeVar: any;
	isAllSessionsEnabled = true;
	branchId = localStorage.getItem('branchId');

	@Input() childIds: any;
	@Output() emitSelectedItems: EventEmitter<any> = new EventEmitter<any>();
	@Output() emitSelectionDone: EventEmitter<any> = new EventEmitter<any>();

	constructor(protected router: Router,
		protected _route: ActivatedRoute,
		protected alertService: AlertService,
		protected apiService: ApiService,
		protected formbuilder: FormBuilder,
		protected dialog: MatDialog,)
	{
		super(router, _route, alertService, apiService, formbuilder, dialog);

		this.Form = this.formbuilder.group({
			'invoiceDate': new FormControl(null, [Validators.required]),
			'dueDate': new FormControl(null, [Validators.required]),
			'dateFrom': new FormControl(null),
			'dateTo': new FormControl(null),
			'invoicePeriod': new FormControl('monthly', [Validators.required]),
			'branchId': new FormControl(null, [Validators.required]),
			// 'childIds': new FormControl(null),
            'timeZone': new FormControl(this.timeZone),
			'month': new FormControl(null)
		});

    // this.Form.addControl('streetNumber', new FormControl(null, [Validators.required]));
		// this.Form.addControl('city', new FormControl(null, [Validators.required]));
		// this.Form.addControl('latitude', new FormControl(null));
		// this.Form.addControl('longitude', new FormControl(null));

		this.minDate = new Date();

		this.Form.get('invoicePeriod').valueChanges.subscribe(value => {
			if (value == 'custom') {
			  this.Form.get('dateFrom').setValidators(Validators.required);
			  this.Form.get('dateTo').setValidators(Validators.required);
			} else {
			  this.Form.get('dateFrom').clearValidators();
			  this.Form.get('dateTo').clearValidators();
			}
			this.Form.get('dateFrom').updateValueAndValidity();
			this.Form.get('dateTo').updateValueAndValidity();
		  });
	}

	ngOnInit(): void
	{
		super.ngOnInit();
		this.formApi =  config.base_url_slug + 'generate/invoice';
		this.Form.get('branchId').setValue(this.branchId);
		// this.Form.get('childIds').setValue(this.childIds);
		// this.sub = this._route.params.subscribe(params =>
		// {
		// 	this.id = params['id'];
		// 	if (this.id == 'new')
		// 	{
		// 		this.formApi = config.base_url_slug +"add/childs/credit";
		// 	}
		// 	else
		// 	{
		// 		this.formApi = config.base_url_slug +"update/child/credit/" + this.id;
		// 		this.detailApi = config.base_url_slug +'find/childs/credits/' + this.id;
		// 		this.getDetail();
		// 	}
		// });

		this.footerProps =
		{
			'buttonLabel': "Next",
			'hasSubButton': true,
			'type': 'output'
		};

		console.log('this.type', this.type);
    console.log(this.childIds);
	}

	getErrorMessage(field: any): any
	{
		return getSpecieFieldMsg[field];
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
	}

	clearForm()
	{
		this.Form.reset();
	}

	afterSuccessfullyAdd()
	{
    // Get download link and download file
    // this.downloadPdf();
	localStorage.setItem('invoiceTab', '1');
	}

  // Overiding datechange from Global Form

  dateChangeStatic(Form, controlName, event: MatDatepickerInputEvent<Date>)
  {
	  if (!event.value) {
        Form.get(controlName).setValue(null);
		return;
	  }

      const formattedDate = moment(new Date(event.value)).format(config.serverDateFormat);
      Form.get(controlName).setValue(formattedDate);

      let start = moment(Form.get('invoiceDate').value);
      if (controlName == 'invoiceDate') {
        let daysAdded = moment(start).add(8, 'days').format('YYYY-MM-DD');
        Form.get('dueDate').setValue(daysAdded);
      }
  }

  downloadPdf() {
    let url = this.responseData;
    let link = document.createElement('a');
    link.href = url;
    link.download = url.substr(url.lastIndexOf('/') + 1);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  confirmInvoiceGenerate() {
	let heading = 'Confirmation';
	let message = 'Draft invoice for this period already exists. if you proceed existing draft(s) will be removed';
	let rightButton = 'Generate';
	let leftButton = 'Cancel';

	this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then((result) =>
	  {
		if (result)
		{
		//   this.dialogRef.close({ status: 'close', type: this.type });
		this.onSubmit();
		
		}
	  });
  }

  checkForInvoiceValidation() {
	  let url = config.base_url_slug + 'child/invoice/validation';
	  this.apiService.post(url,this.Form.value).then((res)=> {

		if (res.code == 200) {
			this.onSubmit();
		} else if (res.code == 208) {
			this.confirmInvoiceGenerate()
		} else {
			this.alertService.alertError('ERROR', 'Something Went Wrong, Try Again');
		}
		
	  })
  }

	beforeSubmit()
	{
		// this.Form.get('childIds').setValue(this.childIds);
		// this.isAllSessionsEnabled = true;
		if (this.checkValidations() == true)
		{}
		else
		{
			this.Form.setErrors({ 'invalid': true });
		}

		let invalid = this.findInvalidControls(this.Form);
    console.log(this.Form);
		console.log('findInvalidControls', invalid);
		return;
	}

	onDateSelected()
	{
	  if (this.Form.valid) {
		this.emitSelectionDone.emit(this.Form.value);
	  } else {
		this.alertService.alertInfo('Leaving?', 'Please fill required fields');
	  }
	}
}
