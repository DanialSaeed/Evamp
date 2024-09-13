import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, CommunicationService, PermissionService, UtilsService } from 'src/app/services';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { MatDialog } from '@angular/material/dialog';
import { getBranchFieldMsg } from '../../../shared/field-validation-messages';
import { config } from 'src/config';
import * as moment from 'moment';

@Component({
	selector: 'app-branch-form',
	templateUrl: './branch-form.component.html',
	styleUrls: ['/src/app/views/shared-style.scss']
})
export class BranchFormComponent extends GlobalFormComponent implements OnInit
{
	location: String = "assets/images/sdn/location.svg"
	clock: String = "assets/images/sdn/clock.svg"
	openingTime: any;
	closingTime: any;
	disableInput = false;
	title = "";
	type: any;
	matOpeningTime2 = 1626204573;
	timePicker
	disabled = false;
	showSpinners = false;
	stepHour = 1;
	stepMinute = 1;
	stepSecond = 1;
	showSeconds = false;
	timeVar: any;
	editPermit: any;
	isAlpha = str => /^[a-zA-Z]*$/.test(str);
	isAlphaNumeric = str => /^[1-9a-z]+$/.test(str);
	specialCharformat = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,<>\/?~]/;

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

		super(router, _route, alertService, apiService, formbuilder, dialog, permissionsService);
		this.Form.addControl('name', new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(36), this.util.trimWhitespaceValidator]));
		this.Form.addControl('registrationNumber', new FormControl(null, [Validators.required, Validators.minLength(4), Validators.maxLength(16), Validators.pattern('^[0-9.-]+$'), this.util.trimWhitespaceValidator]));
		this.Form.addControl('contactNumber', new FormControl(null, [Validators.required, Validators.min(0),Validators.minLength(10), Validators.maxLength(16), Validators.pattern("^-?[0-9]\\d*(\\.\\d{1,2})?$"), this.util.trimWhitespaceValidator]));
		this.Form.addControl('trackingCode', new FormControl(null, [Validators.required, Validators.minLength(1),Validators.maxLength(6), this.util.trimWhitespaceValidator]));
		this.Form.addControl('openingTime', new FormControl(this.openingTime, [Validators.required]));
		this.Form.addControl('closingTime', new FormControl(this.closingTime, [Validators.required]));
		this.Form.addControl('matOpeningTime', new FormControl(this.openingTime, [Validators.required]));
		this.Form.addControl('matClosingTime', new FormControl(this.closingTime, [Validators.required]));
		this.Form.addControl('postalCode', new FormControl(null, [Validators.required]));
		this.Form.addControl('address', new FormControl(null, [Validators.required]));
		this.Form.addControl('streetNumber', new FormControl(null, [Validators.required]));
		this.Form.addControl('city', new FormControl(null, [Validators.required]));
		this.Form.addControl('latitude', new FormControl(null));
		this.Form.addControl('longitude', new FormControl(null));
		this.Form.addControl('addressLabel', new FormControl(''));
		this.Form.addControl('streetAddress', new FormControl(''));
		this.Form.addControl('country', new FormControl(''));
		this.Form.addControl('operationalHours', new FormControl(0, [Validators.max(9999), Validators.min(0)]));
		this.Form.addControl('isHeadOffice', new FormControl(false));
		this.Form.addControl('operationalPeriod', new FormControl('all_year',[Validators.required]));

		this.editPermit = permissionsService.getPermissionsBySubModuleName('Branch Overview', 'Branch').update
	}

	ngOnInit(): void
	{
		this.title = "Branch"
		this.sub = this._route.params.subscribe(params =>
		{
			this.id = params['id'];
			if (params.type == "view")
			{
				//   this.Form.controls['id'].disable()
				this.disableInput = true;
			}

			if (this.id == 'add')
			{
				this.formApi = config.base_url_slug +"add/branch";
			}
			else
			{
				this.formApi = config.base_url_slug +'update/branch/' + this.id;
				this.detailApi = config.base_url_slug +'view/branch/' + this.id;
				this.getDetail();
			}
		});
		super.ngOnInit();
       
	}

	checkFormUrls()
	{
		this.title = "Branch"
	}

	getErrorMessage(field: any, form?): any
	{
		if (form) {
			return form.get(field) && form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getBranchFieldMsg[field];
		}
		return this.Form.get(field) && this.Form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getBranchFieldMsg[field];
	}

	changeRoute()
	{
		var url = '/main/branch/' + this.id + '/edit';
		this.router.navigateByUrl(url);
	}

	removeAddress() {
		this.Form.get('address').setValue(null);
		this.Form.get('addressLabel').setValue(null);
		this.Form.get('postalCode').setValue(null);
		this.Form.get('streetNumber').setValue(null);
		this.Form.get('city').setValue(null);
		this.Form.get('latitude').setValue(null);
		this.Form.get('longitude').setValue(null);	
		this.Form.get('streetAddress').setValue(null);
		this.Form.get('country').setValue(null);
	}

	afterDetail(): void
	{
		this.formDetail.matOpeningTime = this.formDetail.openingTime ? (this.formDetail.openingTime * 1000) + (new Date(this.formDetail.openingTime * 1000).getTimezoneOffset()*60000) : null;
		this.formDetail.matClosingTime = this.formDetail.closingTime ? (this.formDetail.closingTime * 1000) + (new Date(this.formDetail.closingTime * 1000).getTimezoneOffset()*60000) : null;

		this.Form.patchValue(this.formDetail);
		this.Form.get('addressLabel').setValue(this.formDetail.address);
		// this.Form.controls['matOpeningTime'].setValue(moment(new Date(this.formDetail['openingTime'])).format("hh:mm A"))
		// this.Form.controls['matClosingTime'].setValue(moment(new Date(this.formDetail['closingTime'])).format("hh:mm A"))
	}



	beforeSubmit()
	{
		this.isMultiple = true;
	}

	beforeClear()
	{
		this.openingTime = null;
		this.closingTime = null;
	}

	checkType()
    {
        if (this.type != "")
        {
            if (this.type === 'view')
            {
                // this.title = "View " + this.title;
				this.title = "View Branch"
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
                // this.footerProps = {
                //     'buttonLabel': "Update Info",
                //     'hasButton': true,
                //     'hasSubButton': false,
                //     'hasClearButton': true,
                //     'clearButtonLabel': 'Clear',

                // };
				this.footerProps = {
					'buttonLabel': "Save",
					'hasbackButton': true,
					'backButtonLabel': 'Cancel',
					'hasButton': true,
					'hasSubButton': false,

				};
                this.Form.enable();
                this.disableInput = false;
                this.onlyImage = false;
                this.title = "Update Branch";
            }
            else
            {
                this.footerProps = {
                    'buttonLabel': "Save Info",
                    'hasButton': true,
                    'hasSubButton': false,
                    'hasClearButton': true,
                    'clearButtonLabel': 'Clear',
                };
                this.onlyImage = false;
                // this.title = "Add New " + this.title;
				this.title = "Add New Branch";
            }
        }
    }

	onDelete()
	{
		var url = config.base_url_slug +"remove/branch/" + this.id;
		let heading = 'Delete Item?';
		let message = 'Are you sure you want to delete ?';
		let rightButton = 'Delete';
		let leftButton = 'Cancel';
		this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then(result =>
		{
			if (result)
			{
				this.apiService.delete(url).then(result =>
				{
					if (result.code == 200)
					{
						// this.getList();
						localStorage.removeItem('branchId');
						localStorage.removeItem('branchName');
						var data = {
							'title': ""
						}
						this.communicationService.setBranch(data);
						this.router.navigateByUrl('main/dashboard');
						this.alertService.alertSuccess(result.status, result.message);
					}
					else
					{
						this.alertService.alertError(result.status, result.message);
					}
				});
			}
		})
	}

	onBlurEvent(event)
  {
	if (event.target.value.includes('.')) {
		event.target.value = parseFloat(parseFloat(event.target.value).toFixed(2));
		this.Form.get('operationalHours').setValue(event.target.value);
	}
  }

	afterSuccessfullyAdd(): void
	{
		if (this.type == "edit")
		{
			localStorage.setItem('branchName', this.responseData?.name);
			localStorage.setItem('operationalPeriod', this.responseData?.operationalPeriod);
			var data = {
				'title': this.responseData?.name
			}
			this.communicationService.setBranch(data);
		}
		this.router.navigateByUrl('main/dashboard');
	}

	onSetTime(event, controlName): void
	{
		this.timeVar = event.timeInMili;
		console.log(event);
		
		// this.Form.get(event.controlName).setValue(event.timeInMili);
		let offset = new Date().getTimezoneOffset();
		console.log(offset);
		
		// let stAdjusted = (event.timeInMili * 1000) - (new Date().getTimezoneOffset()*60000);
		// console.log(stAdjusted);

		const date = new Date(event.timeInMili * 1000); // Multiply by 1000 to convert seconds to milliseconds

		// Subtract the offset in minutes
		date.setMinutes(date.getMinutes() - offset);
		// Convert the adjusted Date object back to an epoch timestamp
		const adjustedEpochTimestamp = date.getTime() / 1000; // Divide by 1000 to convert milliseconds to seconds

		this.Form.get(controlName).setValue(event.timeInMili);
		this.Form.get(event.controlName).setValue(adjustedEpochTimestamp);

        // let etAdjusted = (element.endTime*1000 + et1.getTimezoneOffset()*60000);
		
	}
    goBack()
    {
        this.type = 'view';
            this.checkType();
       this.afterDetail() 
    }
    changeOperationalPeriod(e){
        let val=this.Form.get('operationalPeriod').value
        let heading = 'Confirmation?';
        let message = 'Are you sure you want to change the operational period for your branch?';
        let rightButton = 'Yes';
        let leftButton = 'No';
        this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then(result =>
        {
            if (!result)
            {
              val=='term_time' ? this.Form.get('operationalPeriod').setValue('all_year'):this.Form.get('operationalPeriod').setValue('term_time')
            }
        })
    }
}
