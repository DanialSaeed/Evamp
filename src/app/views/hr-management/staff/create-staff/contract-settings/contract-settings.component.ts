import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, AutocompleteFiltersService, CommunicationService, PermissionService } from 'src/app/services';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { getContractFieldMsg } from 'src/app/shared/field-validation-messages';
import * as moment from 'moment';
import { config } from 'src/config';
import { addDays } from 'date-fns';
import { ParentFormComponent } from 'src/app/shared/parent-form.component';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { map, startWith } from 'rxjs/operators';
@Component({
	selector: 'app-contract-settings',
	templateUrl: './contract-settings.component.html',
	styleUrls: ['/src/app/views/shared-style.scss', './contract-settings.component.scss']
})
export class ContractSettingsComponent extends ParentFormComponent implements OnInit
{
	calendar: String = "assets/images/sdn/ic_event_24px.svg";
	ageGroupId: any;
	payCycles: any;
	area: any;
	disableDate = true;
	staffContractDetail: FormGroup;
	staffProbationPeriodDetail: FormGroup;

	formAddApi: any;
	formUpdateApi: any;
	formDetailApi: any;
	isAlpha = str => /^[a-zA-Z]*$/.test(str);
	specialCharformat = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,<>\/?~]/;
	emptyForm1: any;
	emptyForm2: any;
	editPermit: any;
	disableForZeroHour = false;
	bankStaffCheck = false;
	disableBranchForZeroHour = false;
	filteredBranches: any[];

	jobTitles: any[] = [
		{value: "nurseryManager", label: "Nursery Manager" },
		{value: "roomLeader", label: "Room Leader" },                  
		{value: "director", label: "Director" },                       
		{value: "senior" , label: "Senior"},
		{value: "cook" , label: "Cook" },
		{value: "cleaner", label: "Cleaner"},
		{value: "maintenanceWorker", label: "Maintenance Worker" },
		{value: "careTaker", label: "Care Taker"},
		{value: "seniorManager", label: "Senior Manager"},
		{value: "trainingManager", label: "Training Manager" },
		{value: "deputyManager", label: "Deputy Manager" },
		{value: "adminAssistant" ,label: "Admin Assistant"},
		{value: "accountsAssistant" ,label: "Account Assistant"},
		{value: "iTSupportTechnician" ,label: "IT Support Technician"},
		{value: "preSchoolManager" ,label: "Pre School Manager"},
		{value: "preSchoolDeputyManager" ,label: "Pre School Deputy Manager"},
		{value: "nurseryAssistantUnqualified" ,label: "Nursery Assistant Unqualified"},
		{value: "nurseryAssistantLevel2"  ,label: "Nursery Assistant Level 2"},
		{value: "nurseryPractitionerLevel3+" ,label: "Nursery Practitioner Level 3+"},
		{value: "nurseryPractitionerLevel6"  ,label: "Nursery Practitioner Level 6"},
	]
	filteredJobTitles: any[];


	constructor(protected router: Router,
		protected _route: ActivatedRoute,
		protected alertService: AlertService,
		protected apiService: ApiService,
		protected formbuilder: FormBuilder,
		protected dialog: MatDialog,
		protected filterService: AutocompleteFiltersService,
		protected permissionService: PermissionService,
		protected communicationService: CommunicationService
	)
	{

		super(router, _route, alertService, apiService, formbuilder, dialog, communicationService,permissionService);

		this.formAddApi = config.base_url_slug + "add/staff-member/contract";
		this.formUpdateApi = config.base_url_slug + 'update/staff-member/' + this.id + '/contract';
		this.formDetailApi = config.base_url_slug + 'view/staff-member/' + this.parentId;

		this.staffContractDetail = this.formbuilder.group({
			jobTitle: new FormControl(null, [Validators.required]),
			staffId: new FormControl(null, [Validators.required]),
			branchId: new FormControl(localStorage.getItem('branchId'), [Validators.required]),
			paymentMode: new FormControl(null, [Validators.required]),
			employmentStartDate: new FormControl(null),
			employmentEndDate: new FormControl(null),
			matemploymentStartDate: new FormControl([Validators.required]),
			matemploymentEndDate: new FormControl(null),
			contractType: new FormControl(null, [Validators.required]),
			contractHours: new FormControl(null, [Validators.required, Validators.min(1)]),
			contractWeeks: new FormControl(null, [Validators.required, Validators.min(1), Validators.pattern('[0-9]+[0-9]*')]),
			contractRate: new FormControl(null, [Validators.required, Validators.min(1)]),
			payCycleId: new FormControl(null, [Validators.required]),
			isBankStaff: new FormControl(false),
		});

		this.staffProbationPeriodDetail = this.formbuilder.group({
			startDate: new FormControl(null),
			endDate: new FormControl(null),
			matStartDate: new FormControl(null, [Validators.required]),
			matEndDate: new FormControl(null, [Validators.required]),
			duration: new FormControl(null, [Validators.required])
		});

		this.Form.addControl('staffContractDetail', new FormControl(null, [Validators.required]));
		this.Form.addControl('staffProbationPeriodDetail', new FormControl(null, [Validators.required]));

		this.Form.addControl('branchLabel', new FormControl(''));
		this.Form.addControl('jobTitleLabel', new FormControl(''));

        this.emptyForm1 = this.staffContractDetail.value;
		this.emptyForm2 = this.staffProbationPeriodDetail.value;
		this.editPermit = this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Enrollment').update;
	}

	ngOnInit(): void
	{
		this.getPayCycle();

		this.staffContractDetail.get('staffId').setValue(this.parentId);

		this.sub = this._route.params.subscribe(params =>
		{
			this.id = params['id'];
			if (this.id == 'add')
			{
				if (this.parentId != -1)
				{
					this.detailApi = config.base_url_slug + 'view/staff-member/' + this.parentId;

					if (this.childId != -1)
					{
						this.formApi = config.base_url_slug + 'update/staff-member/' + this.parentId + '/contract';
						this.detailApi = config.base_url_slug + 'view/staff-member/' + this.parentId;
						this.getDetail();
					}
					else
					{
						this.formApi = config.base_url_slug + "add/staff-member/contract";
					}
				}
				else
				{
					this.formApi = config.base_url_slug + "add/staff-member";
				}
				this.listenForChildForms();
				this.getBranches();
			}
			else
			{
				if (this.childId != -1){
					this.formApi = config.base_url_slug + 'update/staff-member/' + this.id + '/contract';
					this.detailApi = config.base_url_slug + 'view/staff-member/' + this.id;
					this.getDetail();
				} else {
					this.formApi = config.base_url_slug + "add/staff-member/contract";
					this.getBranches();
				}
	
			}
		});

		this.filteredBranches = [...this.branches];
		this.filteredJobTitles = [...this.jobTitles];

		// Populate autcomplete data for branches
			let branches = this.Form.get('branchLabel').valueChanges.pipe(
				startWith(''),
				map(value => this.filterService._filterBranches(value, this.branches))
			);
			branches.subscribe((d)=> this.filteredBranches =  d);
		// End

		// Populate autcomplete data for jobTitle
			let jobTitle = this.Form.get('jobTitleLabel').valueChanges.pipe(
				startWith(''),
				map(value => this.filterService._filterBranches(value, this.jobTitles))
			);
		    jobTitle.subscribe((d)=> this.filteredJobTitles =  d);
	    // End

		this.staffContractDetail.controls['contractType'].valueChanges.subscribe(value=>{
			if (this.staffContractDetail.controls['contractType'].dirty) {
			if(value == 'fullTime'){
				this.staffContractDetail.get('contractWeeks').setValue(52)
			}
			else if(value == 'termTime'){
				this.staffContractDetail.get('contractWeeks').setValue(38)
			}
		}
		})

		super.ngOnInit();
	}

	checkFormUrls()
	{
		if (this.type === 'view')
		{
			this.staffContractDetail.disable();
			this.staffProbationPeriodDetail.disable();
		}
	}

	onCheckBox(event) {
		this.disableBranchForZeroHour = event.checked;
		if (event.checked) {
			let headOffice = this.branches.find(x => x.isHeadOffice);
			this.staffContractDetail.get('branchId').setValue(headOffice.value);
			this.Form.get('branchLabel').setValue(headOffice.label);
		}
		this.emitFormData.emit({type: 'hideShiftPattern', value: event.checked});	  
	}

	listenForChildForms() {
		
		this.staffContractDetail.valueChanges.subscribe((val)=> {
			if (JSON.stringify(this.emptyForm1) != JSON.stringify(this.staffContractDetail.value)) 
			{
			   this.communicationService.unSavedForm.next(true);
			}
		});

		this.staffProbationPeriodDetail.valueChanges.subscribe((val)=> {
			if (JSON.stringify(this.emptyForm2) != JSON.stringify(this.staffProbationPeriodDetail.value)) 
			{
			   this.communicationService.unSavedForm.next(true);
			}
		});

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
				this.staffContractDetail.disable();
				this.staffProbationPeriodDetail.disable();
				this.disableInput = true
			}
			else if (this.type === 'edit')
			{
				this.footerProps = {
					'buttonLabel': "Save",
					'hasbackButton': true,
					'backButtonLabel': 'Cancel',
					'hasButton': true,
					'hasSubButton': false,
				};

				this.Form.enable();
				this.staffContractDetail.enable();
				this.staffProbationPeriodDetail.enable();
				this.disableInput = false;
				this.onlyImage = false;
				this.title = "Update " + this.title;
				if (this.staffContractDetail.get('contractType').value == 'zeroHour') {  
					this.zeroHourSettings(true);
				}
				this.communicationService.unSavedForm.next(false);
			}
			else
			{
				this.footerProps = {
					'buttonLabel': "Next",
					'hasbackButton': true,
					'backButtonLabel': 'Cancel',
					'hasButton': true,
					'hasSubButton': false,
				};
				this.onlyImage = false;
				this.title = "Add New " + this.title;
			}
			this.footerProps['backColor'] = '#C1BBB9';
		}
	}

	getErrorMessage(field: any): any
	{
		return getContractFieldMsg[field];
	}

	afterDetail(): void
	{
		this.isUpdate = true;
		if (this.formDetail.staffContractDetail.employmentStartDate)
		{
			var start = new Date(this.formDetail?.staffContractDetail.employmentStartDate);
			this.formDetail.staffContractDetail.matemploymentStartDate = start
			this.formDetail.staffContractDetail.employmentStartDate = start
		}

		if (this.formDetail.staffContractDetail.employmentEndDate)
		{
			this.formDetail.staffContractDetail.matemploymentEndDate = new Date(this.formDetail?.staffContractDetail.employmentEndDate);
			this.formDetail.staffContractDetail.employmentEndDate = new Date(this.formDetail?.staffContractDetail.employmentEndDate);
		}

		this.formDetail.staffProbationPeriodDetail.duration = this.formDetail.staffProbationPeriodDetail.duration?.toString();

		this.formDetail.staffProbationPeriodDetail.startDate = new Date(this.formDetail.staffProbationPeriodDetail.startDate);
		this.formDetail.staffProbationPeriodDetail.endDate = new Date(this.formDetail.staffProbationPeriodDetail.endDate);
		this.formDetail.staffProbationPeriodDetail.matStartDate = new Date(this.formDetail.staffProbationPeriodDetail.startDate);
		this.formDetail.staffProbationPeriodDetail.matEndDate = new Date(this.formDetail.staffProbationPeriodDetail.endDate);

		if (this.formDetail.staffProbationPeriodDetail.duration != 3 && this.formDetail.staffProbationPeriodDetail.duration != 6 && this.formDetail.staffProbationPeriodDetail.duration != 12)
		{
			this.formDetail.staffProbationPeriodDetail.duration = 'custom'
			this.disableDate = false;
		}

		this.staffContractDetail.patchValue(this.formDetail['staffContractDetail']);
		this.staffProbationPeriodDetail.patchValue(this.formDetail['staffProbationPeriodDetail']);


		this.staffContractDetail.get('paymentMode').setValue(this.formDetail.staffContractDetail.paymentMode);
		this.staffContractDetail.get('branchId').setValue(this.formDetail.staffContractDetail.branchId);
		

		this.Form.controls['staffContractDetail'].setValue(this.staffContractDetail.value);
		this.Form.controls['staffProbationPeriodDetail'].setValue(this.staffProbationPeriodDetail.value);

		// Setting jobTitle manually for autocomplete
		let jobTitleObj = this.jobTitles.find(x => x.value == this.formDetail.staffContractDetail.jobTitle);
		this.Form.get('jobTitleLabel').setValue(jobTitleObj ? jobTitleObj.label : null);
		// End

		this.staffContractDetail.get('isBankStaff').setValue(this.formDetail.isBankStaff);
		if (this.staffContractDetail.get('contractType').value == 'zeroHour') {  
			this.zeroHourSettings(true);
		}

		this.communicationService.unSavedForm.next(false);

		this.getBranches();
		
	}

	afterBranchResponse() {
	   // Setting branch manually for autocomplete
	   if (this.id != 'add' && this.childId != -1) {
		let branchObj = this.branches.find(x => x.value == this.formDetail.staffContractDetail.branchId);
		this.Form.get('branchLabel').setValue(branchObj ? branchObj.label : null);
	   }
	   // End
	   this.communicationService.unSavedForm.next(false);
	}

	beforeSubmit()
	{

		let scd = this.findInvalidControls(this.staffContractDetail);
		let spp = this.findInvalidControls(this.staffProbationPeriodDetail);
		console.log(scd, spp);
		if (this.checkValidations() == true)
		{
			this.showSuccess = false;
			this.isMultiple = false

			if (this.staffProbationPeriodDetail.get('duration').value == "custom")
			{
				this.staffProbationPeriodDetail.get('duration').setValue(moment(this.staffProbationPeriodDetail.get('matEndDate')?.value).diff(moment(this.staffProbationPeriodDetail.get('matStartDate')?.value), 'months'));
			}

			this.replaceDate(this.staffContractDetail, 'employmentStartDate', 'matemploymentStartDate');
			this.replaceDate(this.staffContractDetail, 'employmentEndDate', 'matemploymentEndDate');
			this.replaceDate(this.staffProbationPeriodDetail, 'startDate', 'matStartDate');
			this.replaceDate(this.staffProbationPeriodDetail, 'endDate', 'matEndDate');


            // this.staffContractDetail.get('branchId').setValue();
			this.Form.controls['staffContractDetail'].setValue(this.staffContractDetail.value);
			this.Form.controls['staffProbationPeriodDetail'].setValue(this.staffProbationPeriodDetail.value);
			this.bankStaffCheck = this.staffContractDetail.get('isBankStaff').value;
		}
		else
		{
			this.Form.setErrors({ 'invalid': true });
		}
		console.log(this.staffContractDetail);
		console.log(this.staffProbationPeriodDetail);
		
	}

	checkValidations()
	{
		if (this.staffContractDetail.invalid)
		{
			this.staffContractDetail.markAllAsTouched()
			return false;
		}
		if (this.staffProbationPeriodDetail.invalid)
		{
			this.staffProbationPeriodDetail.markAllAsTouched()
			return false;
		}
		return true;
	}

	durationChange(value)
	{
		let startDate = this.staffContractDetail.get('matemploymentStartDate').value; 
		if (moment(startDate).format('dddd') == 'Saturday' || moment(startDate).format('dddd') == 'Sunday') {
			this.staffContractDetail.get('matemploymentStartDate').setValue(null);
			this.staffContractDetail.get('employmentStartDate').setValue(null);
			this.alertService.alertInfo('Warning', 'Selection not allowed on Saturday and Sunday');
			return;
		}

		if (value == "custom")
		{
			this.disableDate = false;
		}
		else
		{
			this.staffProbationPeriodDetail.get('matStartDate').setValue(this.staffContractDetail.get('matemploymentStartDate').value)
			var d = new Date(this.staffProbationPeriodDetail.get('matStartDate').value);
			this.staffProbationPeriodDetail.get('matEndDate').setValue(moment(d).add(value, 'M').toDate());

			this.disableDate = true;
		}
	}

	afterSuccessfullyAdd(): void
	{
        this.updateBankStaff();
		this.emitFormData.emit({
			type: 'child',
			value: this.responseData.staffContractDetails.id,
			key: 'staffContractDetailId'
		});

		let data = {
			'number': 3,
			'url': 'shift-pattern',
			'prevForm': 'staffContractDetail',
			'currentForm': 'staffShiftPatternDetails',
			'isForm': true,
		}
		this.communicationService.setStaff(data);
	}

	beforeClear()
	{
		var staffId = this.staffContractDetail.get('staffId').value
		this.staffContractDetail.reset();
		this.staffProbationPeriodDetail.reset();
		this.staffContractDetail.get('staffId').setValue(staffId);
	}

	getPayCycle(newUrl?: any): any
	{
		let data = [];
		let url = config.base_url_slug + 'view/pay-cycles';
		if (newUrl)
		{
			url = url + newUrl;
		}
		this.apiService.get(url).then(res =>
		{
			if (res.code == 200)
			{
				res.data.forEach((element, index) =>
				{
					let dict = {
						value: element.id,
						label: element.label,
					}
					data.push(dict);
				});
				this.payCycles = data;
			}
			else
			{
				this.payCycles = [];
			}
		});
	}

	onBlurEvent(event, controlName)
	{
		if (this.isAlpha(event.target.value)) {
			this.staffContractDetail.get(controlName).setValue(null);
			return;
		}

		if (this.specialCharformat.test(event.target.value)) {
			this.staffContractDetail.get(controlName).setValue(null);
			return;
		}

		if (event.target.value !== "")
		{
			event.target.value = parseFloat(event.target.value).toFixed(2);
			this.staffContractDetail.get(controlName).setValue(event.target.value);
		}
	}

	//Overriding Method

	setDateFormat(form: FormGroup, realField, event: MatDatepickerInputEvent<Date>)
    {

		let startDate = this.staffContractDetail.get('matemploymentEndDate').value; 
		if (moment(startDate).format('dddd') == 'Saturday' || moment(startDate).format('dddd') == 'Sunday') {
			this.staffContractDetail.get('matemploymentEndDate').setValue(null);
			form.get('employmentEndDate').setValue(null);
			this.alertService.alertInfo('Warning', 'Selection not allowed on Saturday and Sunday');
			return;
		}

		if (realField == 'employmentEndDate' && form.get('matemploymentEndDate').value == null) {
			form.get('employmentEndDate').setValue(null);
		} else {
			form.get(realField).setValue(moment(new Date(event.value)).format(config.serverDateFormat));
		}
    }

	// Overriding Method

	replaceDate(form: FormGroup, realField, tempField)
    {
		if (form.get(tempField).value != null) {
			let date = form.get(tempField).value;
			form.get(realField).setValue(moment(new Date(date)).format(config.serverDateFormat));
		}
    }

	setConditionsOnZeroHour() {

		if (this.staffContractDetail.get('contractType').value == 'zeroHour') {
           
			this.zeroHourSettings();
			
		} else {
			this.staffContractDetail.get('paymentMode').setValue(null);
			this.staffContractDetail.get('branchId').setValue(null)
			this.Form.get('branchLabel').setValue(null)
			this.staffContractDetail.get('isBankStaff').setValue(null)
			this.staffContractDetail.get('contractHours').setValidators([Validators.required, Validators.min(1)]);
			this.staffContractDetail.get('contractWeeks').setValidators( [Validators.required, Validators.min(1), Validators.pattern('[0-9]+[0-9]*')]);
			this.disableForZeroHour = false;
			this.disableBranchForZeroHour = false;
			this.bankStaffCheck = false;
			this.onCheckBox({checked: false});
		}
    }

	updateBankStaff() {
		let url = config.base_url_slug + 'update/staff-member/bankStaff/' + this.parentId;

		this.apiService.patch(url, {isBankStaff: this.bankStaffCheck}, this.hasFile).then(response => {
			if (response.code == 201 || response.code == 200) {
               this.bankStaffCheck = false;
			}
		});
	}

	zeroHourSettings(isEdit = false) {
		let headOffice = this.branches.find(x => x.isHeadOffice);
		this.disableForZeroHour = true;
		console.log(this.staffContractDetail.value);
		if(isEdit) {
			this.staffContractDetail.get('isBankStaff').setValue(this.formDetail.isBankStaff);
			this.disableBranchForZeroHour = this.formDetail.isBankStaff;
			// this.staffContractDetail.get('paymentMode').disable();
			this.emitFormData.emit({type: 'hideShiftPattern', value: this.formDetail.isBankStaff});
		} else {
			this.staffContractDetail.get('isBankStaff').setValue(true);
			this.disableBranchForZeroHour = true;
			this.emitFormData.emit({type: 'hideShiftPattern', value: true});

			if (headOffice) {
				this.staffContractDetail.get('branchId').setValue(headOffice.value);
				this.Form.get('branchLabel').setValue(headOffice.label);
				this.disableForZeroHour = true;
			}
		}
	  


		this.staffContractDetail.get('paymentMode').setValue('hourly');

		// if (headOffice) {
		// 	this.staffContractDetail.get('branchId').setValue(headOffice.value);
		// 	this.disableForZeroHour = true;
		// }
		console.log(this.staffContractDetail.value);
		this.staffContractDetail.get('contractHours').clearValidators();
		this.staffContractDetail.get('contractWeeks').clearValidators();
		this.staffContractDetail.get('contractHours').updateValueAndValidity();
		this.staffContractDetail.get('contractWeeks').updateValueAndValidity();
	}

	setBranchId() {
		let branch = this.branches.find(x => x.label == this.Form.get('branchLabel').value);
		this.staffContractDetail.get('branchId').setValue(branch ? branch.value : null);
	}

	setJobTitle() {
		let jobTitle = this.jobTitles.find(x => x.label == this.Form.get('jobTitleLabel').value);
		this.staffContractDetail.get('jobTitle').setValue(jobTitle ? jobTitle.value : null);
	}

	goToEdit() {
		// this.router.navigateByUrl(`/main/staff/${this.id}/edit`);
		this.type = 'edit';
		this.checkType();
	}
}
