import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, AutocompleteFiltersService, CommunicationService, PermissionService, UtilsService } from 'src/app/services';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { AddressComponent } from 'src/app/core/address/address.component';
import { getStaffPersonalDetailMsg } from 'src/app/shared/field-validation-messages';
import { config } from 'src/config';
import { ParentFormComponent } from 'src/app/shared/parent-form.component';
import { map, startWith } from 'rxjs/operators';
@Component({
	selector: 'app-personal-details',
	templateUrl: './personal-details.component.html',
	styleUrls: ['/src/app/views/shared-style.scss']
})
export class PersonalDetailsComponent extends ParentFormComponent implements OnInit
{
	// @Output() sendStaffId = new EventEmitter<any>();
	@Input() staffId: any;
	ageGroupId: any;
	area: any;
	isSameEmail = false;
	staffBankDetail: FormGroup;
	staffEmergencyDetails1: FormGroup;
	staffEmergencyDetails2: FormGroup;
	label = "Upload Photo "
	location: String = "assets/images/sdn/location.svg"
	calendar: String = "assets/images/sdn/ic_event_24px.svg"
	emptyFormBank: any;
	editPermit: any;

	filteredNationalities: any[] = [];
	filteredReligions: any[];
	filteredEthinicOrigins: any[];
	filteredLanguages: any[];
	filteredRelations = [];
	relations = [
		{label: 'Father', value: 'father'},
		{label: 'Mother', value: 'mother'},
		{label: 'Grandfather', value: 'grandFather'},
		{label: 'Grandmother', value: 'grandMother'},
		{label: 'Sibling', value: 'sibling'},
		{label: 'Uncle', value: 'uncle'},
		{label: 'Aunt', value: 'aunt'},
		{label: 'Cousin', value: 'cousin'},
		{label: 'Husband', value: 'husband'},
		{label: 'Wife', value: 'wife'},
	]

	constructor(protected router: Router,
		protected _route: ActivatedRoute,
		protected alertService: AlertService,
		protected apiService: ApiService,
		protected formbuilder: FormBuilder,
		protected dialog: MatDialog,
		protected util: UtilsService,
		protected permissionService: PermissionService,
		protected filterService: AutocompleteFiltersService,
		protected communicationService: CommunicationService)
	{

		super(router, _route, alertService, apiService, formbuilder, dialog, communicationService,permissionService);
		this.staffBankDetail = this.formbuilder.group({});
		this.staffBankDetail.addControl('bankSocietyName', new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(36), this.util.trimWhitespaceValidator]));
		this.staffBankDetail.addControl('accountName', new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(36), Validators.pattern('[a-zA-Z]+[a-zA-Z ]*'), this.util.trimWhitespaceValidator]));
		this.staffBankDetail.addControl('accountNumber', new FormControl(null, [Validators.required, Validators.minLength(4), Validators.maxLength(18), Validators.pattern('[a-zA-Z0-9]+$'),this.util.trimWhitespaceValidator]));
		this.staffBankDetail.addControl('sortCode', new FormControl(null, [Validators.required]));

		this.Form.addControl('branchId', new FormControl(null, [Validators.required]));
		this.Form.addControl('firstName', new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(36), this.util.trimWhitespaceValidator]));
		this.Form.addControl('lastName', new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(36), this.util.trimWhitespaceValidator]));
		this.Form.addControl('mobileNumber', new FormControl(null, [Validators.required, Validators.min(0),Validators.minLength(10), Validators.maxLength(16), Validators.pattern("^-?[0-9]\\d*(\\.\\d{1,2})?$"), this.util.trimWhitespaceValidator]));
		this.Form.addControl('email', new FormControl(null, [Validators.required, Validators.email, this.util.trimWhitespaceValidator]));
		this.Form.addControl('personalEmail', new FormControl("", [Validators.email, this.util.trimWhitespaceValidator]));
		this.Form.addControl('address', new FormControl(null, [Validators.required]));
		this.Form.addControl('dateOfBirth', new FormControl(null, [Validators.required]));
		this.Form.addControl('matDateOfBirth', new FormControl(null, [Validators.required, Validators.pattern('')]));
		this.Form.addControl('nationalityId', new FormControl(null, [Validators.required]));
		this.Form.addControl('gender', new FormControl(null, [Validators.required]));
		this.Form.addControl('religionId', new FormControl(0));
		this.Form.addControl('ethnicOriginId', new FormControl(0));
		this.Form.addControl('firstLanguageId', new FormControl(0));
		this.Form.addControl('dietaryRequirement', new FormControl(""));
		this.Form.addControl('carRegistrationNumber', new FormControl("", [Validators.minLength(4), Validators.maxLength(18), Validators.pattern('[a-zA-Z -]+[0-9]+[a-zA-Z ]*')]));
		this.Form.addControl('telephoneNumber', new FormControl(null, [Validators.min(0),Validators.minLength(8), Validators.maxLength(11), Validators.pattern("^-?[0-9]\\d*(\\.\\d{1,2})?$"), this.util.trimWhitespaceValidator]));
		this.Form.addControl('nationalInsuranceNumber', new FormControl(null, [Validators.required, Validators.pattern('^[a-zA-Z]{2}[0-9]{6}[a-zA-Z]{1}$'), this.util.trimWhitespaceValidator]));
		this.Form.addControl('staffBankDetail', new FormControl(null, [Validators.required]));
		this.Form.addControl('sexualOrientation', new FormControl('normal', [Validators.required]));
		this.Form.addControl('city', new FormControl(null, [Validators.required]));
		this.Form.addControl('postalCode', new FormControl(null, [Validators.required]));
		this.Form.addControl('streetNumber', new FormControl('', [Validators.required]));
		this.Form.addControl('latitude', new FormControl(null));
		this.Form.addControl('longitude', new FormControl(null));
		this.Form.addControl('image', new FormControl(null));
		this.Form.addControl('addressLabel', new FormControl(''));
		this.Form.addControl('streetAddress', new FormControl(''));
		this.Form.addControl('country', new FormControl(''));
		
		this.Form.addControl('nationalityLabel', new FormControl(''));
		this.Form.addControl('religionLabel', new FormControl(''));
		this.Form.addControl('ethinicOriginLabel', new FormControl(''));
		this.Form.addControl('languageLabel', new FormControl(''));

		this.hasFile = true;
		this.staffEmergencyDetails1 = this.formbuilder.group({
			"id": new FormControl(null),
			"name": new FormControl(null, [Validators.minLength(2), Validators.maxLength(36),this.util.trimWhitespaceValidator]),
			"mobileNumber": new FormControl(null, [Validators.required, Validators.min(0),Validators.minLength(8), Validators.maxLength(11), Validators.pattern("^-?[0-9]\\d*(\\.\\d{1,2})?$"),this.util.trimWhitespaceValidator]),
			"relationToEmployee": new FormControl(null, [Validators.required]),
			"relationLabel": new FormControl('', [this.util.trimWhitespaceValidator]),
			"filteredRelations": new FormControl([]),

		});
		this.staffEmergencyDetails2 = this.formbuilder.group({
			"id": new FormControl(null),
			"name": new FormControl(null, [Validators.minLength(2), Validators.maxLength(36), this.util.trimWhitespaceValidator]),
			"mobileNumber": new FormControl(null, [Validators.min(0),Validators.minLength(8), Validators.maxLength(11), Validators.pattern("^-?[0-9]\\d*(\\.\\d{1,2})?$"), this.util.trimWhitespaceValidator]),
			"relationToEmployee": new FormControl(null),
			"relationLabel": new FormControl('', [this.util.trimWhitespaceValidator]),
			"filteredRelations": new FormControl([]),

		});
		this.Form.addControl('staffEmergencyDetails', new FormArray([
			this.staffEmergencyDetails1, this.staffEmergencyDetails2
		]));

		this.Form.controls['staffEmergencyDetails']['controls'].forEach((element, index) =>{
            // Populate autcomplete data for language
            let language = element.controls.relationLabel.valueChanges.pipe(
                startWith(''),
                map(value => this.filterService._filterRelationships(value, [...this.relations]))
            );
            element.controls.filteredRelations.setValue(this.filteredRelations)
            language.subscribe((d)=> element.controls.filteredRelations.setValue(d));
            // End
        })

		this.emptyFormBank = this.staffBankDetail.value;
		this.isParentForm = true;
		this.editPermit = this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Enrollment').update;
	}

	ngOnInit(): void
{
		// this.Form.controls['area'].disable();
		this.sub = this._route.params.subscribe(params =>
		{
			this.id = params['id'];
			if (this.id == 'add')
			{
				if (this.parentId != -1)
				{
					this.detailApi = config.base_url_slug + 'view/staff-member/' + this.parentId;

					if (this.isParentForm)
					{
						this.formApi = config.base_url_slug + 'update/staff-member/' + this.parentId;
						this.detailApi = config.base_url_slug + 'view/staff-member/' + this.parentId;
						this.getDetail();
					}
					else
					{
						this.formApi = config.base_url_slug + "add/staff-member";
					}
				}
				else
				{
					this.formApi = config.base_url_slug + "add/staff-member";
				}
				this.listenForChildForms();
			}
			else
			{
				// this.sendStaffId.emit(this.id);
				this.formApi = config.base_url_slug + 'update/staff-member/' + this.id;
				this.detailApi = config.base_url_slug + 'view/staff-member/' + this.id;
				this.getDetail();
			}
		});

		super.ngOnInit();

		this.filteredNationalities = [...this.nationalities];
		this.filteredReligions = [...this.religions];
		this.filteredEthinicOrigins = [...this.ethnicOrigins];
		this.filteredLanguages = [...this.firstLanguages];

		// Populate autcomplete data for nationality
			let nationality = this.Form.get('nationalityLabel').valueChanges.pipe(
				startWith(''),
				map(value => this.filterService._filterNationality(value, this.nationalities))
			);
			nationality.subscribe((d)=> this.filteredNationalities =  d);
		// End

		// Populate autcomplete data for religion
			let religion = this.Form.get('religionLabel').valueChanges.pipe(
				startWith(''),
				map(value => this.filterService._filterReligion(value, this.religions))
			);
			religion.subscribe((d)=> this.filteredReligions =  d);
	    // End

		// Populate autcomplete data for ethnic Origin
			let ethinic = this.Form.get('ethinicOriginLabel').valueChanges.pipe(
				startWith(''),
				map(value => this.filterService._filterEthinicOrigin(value, this.ethnicOrigins))
			);
			ethinic.subscribe((d)=> this.filteredEthinicOrigins =  d);
	    // End

		// Populate autcomplete data for language
			let language = this.Form.get('languageLabel').valueChanges.pipe(
				startWith(''),
				map(value => this.filterService._filterLanguage(value, this.firstLanguages))
			);
			language.subscribe((d)=> this.filteredLanguages =  d);
		// End
	}

	// private _filter(value: any): any[] {
	// 	console.log(value);
	// 	let filterValue = '';
	// 	console.log(this.Form.get('nationalityLabel').value);
	// 	if (typeof(value) == 'string') {
	// 	  filterValue = value.toLowerCase();
	// 	} else {
	// 	  filterValue = '';
	// 	}
	
	// 	// this.setChildData();
	// 	  return this.nationalities.filter(option => option.nationality.toLowerCase().includes(filterValue));
	
	//   }

	//   private _filterReligion(value: any): any[] {
	// 	console.log(value);
	// 	let filterValue = '';
	// 	console.log(this.Form.get('religionLabel').value);
	// 	if (typeof(value) == 'string') {
	// 	  filterValue = value.toLowerCase();
	// 	} else {
	// 	  filterValue = '';
	// 	}
	
	// 	// this.setChildData();
	// 	  return this.religions.filter(option => option.religion.toLowerCase().includes(filterValue));
	
	//   }


	checkFormUrls()
	{
		if (this.type === 'view')
		{
			this.staffBankDetail.disable();
		}
	}

	get staffEmergencyDetails(): FormArray
	{
		return this.Form.get('staffEmergencyDetails') as FormArray;
	}

	openDialog()
	{
		let dialogRef = this.dialog.open(AddressComponent, {
			autoFocus: false,
			maxHeight: '90vh',
			width: '50%'
		});

		dialogRef.componentInstance.data = this.Form.value;

		dialogRef.afterClosed().subscribe(result =>
		{
			this.Form.patchValue(result);
		})
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
					'buttonLabel': "Save",
					'hasbackButton': true,
					'backButtonLabel': 'Cancel',
					'hasButton': true,
					'hasSubButton': false,

				};
				this.Form.enable();
				this.disableInput = false;
				this.onlyImage = false;
				this.title = "Update " + this.title;
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

	checkFormChanges()
	{

	}

	setNationalityId() {
		let nationality = this.nationalities.find(x => x.nationality == this.Form.get('nationalityLabel').value);
		this.Form.get('nationalityId').setValue(nationality ? nationality.id : null);
	}

	setReligionId() {
		let religion = this.religions.find(x => x.religion == this.Form.get('religionLabel').value);
		this.Form.get('religionId').setValue(religion ? religion.id : null);
	}

	setEthinicOriginId() {
		let ethinic = this.ethnicOrigins.find(x => x.origin == this.Form.get('ethinicOriginLabel').value);
		this.Form.get('ethnicOriginId').setValue(ethinic ? ethinic.id : null);
	}

	setLanguageId() {
		let language = this.firstLanguages.find(x => x.language == this.Form.get('languageLabel').value);
		this.Form.get('firstLanguageId').setValue(language ? language.id : null);
	}

	listenForChildForms() {
		
		this.staffBankDetail.valueChanges.subscribe((val)=> {
			if (JSON.stringify(this.emptyFormBank) != JSON.stringify(this.staffBankDetail.value)) 
			{
			   this.communicationService.unSavedForm.next(true);
			}
		});

	}

	getErrorMessage(field: any, form?): any
	{
		if (form) {
			return form.get(field) && form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getStaffPersonalDetailMsg[field];
		}
		return this.Form.get(field) && this.Form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getStaffPersonalDetailMsg[field];
	}

	afterDetail(): void
	{
		this.isUpdate = true;
		if (this.formDetail.staffBankDetail != null)
		{
			this.staffBankDetail.patchValue(this.formDetail['staffBankDetail'])
		}
		this.Form.patchValue(this.formDetail);

		this.Form.get('addressLabel').setValue(this.formDetail.address);

		this.Form.controls['image'].setValue(this.formDetail['profilePicturePath'])
		if (this.formDetail.dateOfBirth)
		{
			this.Form.get('matDateOfBirth').setValue(new Date(this.formDetail.dateOfBirth));
		}
		
		if (this.formDetail.isBankStaff){
			this.emitFormData.emit({type: 'hideShiftPattern', value: true});
		}

		// Setting nationality manually for autocomplete
		let nationalityObj = this.nationalities.find(x => x.id == this.formDetail.nationalityId);
		this.Form.get('nationalityLabel').setValue(nationalityObj ? nationalityObj.nationality : null);
		// End

		// Setting religion manually for autocomplete
		let religionObj = this.religions.find(x => x.id == this.formDetail.religionId);
		this.Form.get('religionLabel').setValue(religionObj ? religionObj.religion : null);
		// End

		// Setting ethinic origin manually for autocomplete
		let ethinicObj = this.ethnicOrigins.find(x => x.id == this.formDetail.ethnicOriginId);
		this.Form.get('ethinicOriginLabel').setValue(ethinicObj ? ethinicObj.origin : null);
		// End

		// Setting language manually for autocomplete
		let languageObj = this.firstLanguages.find(x => x.id == this.formDetail.firstLanguageId);
		this.Form.get('languageLabel').setValue(languageObj ? languageObj.language: null);
		// End

		this.Form.controls['staffEmergencyDetails']['controls'].forEach((element,index) => {
		   // Setting language manually for autocomplete
			let languageObj = this.relations.find(x => x.value == element.get('relationToEmployee').value);
			this.Form.controls['staffEmergencyDetails']['controls'][index]['controls'].relationLabel.setValue(languageObj ? languageObj.label: null);
		   // End
		});


		this.communicationService.unSavedForm.next(false);
	}

	beforeSubmit()
	{
		if (this.checkValidations() == true)
		{
			this.isMultiple = true;
			this.showSuccess = false;
			this.Form.controls['sexualOrientation'].setValue('normal')
			this.Form.controls['branchId'].setValue(localStorage.getItem('branchId'));

			this.Form.controls['staffBankDetail'].setValue(JSON.stringify(this.staffBankDetail.value));
			if (this.staffEmergencyDetails1.controls['mobileNumber'].value === this.staffEmergencyDetails2.controls['mobileNumber'].value)
			{

				this.Form.controls['staffEmergencyDetails'].setErrors({ 'incorrect': true });
			}
			else
			{
				// remove this else while safai
			}
		}
		else
		{
			this.Form.setErrors({ 'invalid': true });
		}

		//check for same email
		if (this.Form.get('email').value || this.Form.get('personalEmail').value) {
			this.isSameEmail = this.Form.get('email').value == this.Form.get('personalEmail').value ? true : false;
		}
	}

	checkValidations()
	{
		if (this.staffBankDetail.invalid)
		{
			this.staffBankDetail.markAllAsTouched()
			return false;
		}
		return true;
	}

	afterSuccessfullyAdd(): void
	{
		this.emitFormData.emit({
			type: 'parent',
			value: this.responseData.id,
			key: 'parent'
		});

		let data = {
			'number': 2,
			'url': 'contract',
			'prevForm': 'id',
			'currentForm': 'staffContractDetail',
			'isForm': true,
		}
		this.communicationService.setStaff(data);
	}

	beforeClear()
	{
		this.Form.controls['dateOfBirth'].setValue(null);
		this.Form.controls['matDateOfBirth'].setValue(null);
		this.staffBankDetail.controls['bankSocietyName'].setValue(null);
		this.staffBankDetail.controls['accountName'].setValue(null);
		this.staffBankDetail.controls['accountNumber'].setValue(null);
		this.staffBankDetail.controls['sortCode'].setValue(null);
	}

	removeAddress() {
		this.Form.get('address').setValue(null);
		this.Form.get('postalCode').setValue(null);
		this.Form.get('streetNumber').setValue(null);
		this.Form.get('streetAddress').setValue(null);
		this.Form.get('city').setValue(null);
		this.Form.get('latitude').setValue(null);
		this.Form.get('longitude').setValue(null);	
		this.Form.get('addressLabel').setValue(null);
		this.Form.get('country').setValue(null);
	}

	setRelationValue(form) {
		let relation = this.relations.find(x => x.label == form.get('relationLabel').value);
		form.get('relationToEmployee').setValue(relation ? relation.value : null);
	}

	onSubmit(): void
	{
		this.beforeSubmit();
		if (this.isSameEmail)
		{
			this.alertService.alertError('WARNING', 'Work and Personal email cannot be same');
			return;
		}
		if (this.Form.invalid)
		{
			this.alertService.alertError('WARNING', 'Please fill the required data.');
			return;
		}
		if (this.type == "view")
		{
		}
		else
		{
			let formData = this.Form.value;
			if (this.formValueChanged)
			{
				formData = this.otherForm;
			}
			formData.staffEmergencyDetails = JSON.stringify(formData.staffEmergencyDetails);

			if (this.type == 'edit')
			{
				this.onSubmitCall(formData, "patch");
			}
			else
			{
				if (this.isParentForm)
				{
					if (this.parentId != -1)
					{
						this.onSubmitCall(formData, "patch");
					} else
					{
						this.onSubmitCall(formData, "post");
					}
				} else
				{
					if (this.parentId != -1)
					{
						if (this.childId != -1)
						{
							this.onSubmitCall(formData, "patch");
						}
						else
						{
							this.onSubmitCall(formData, "post");
						}
					}
					else
					{
						this.onSubmitCall(formData, "post");
					}
				}
			}
		}
	}

	goToEdit() {
		// this.router.navigateByUrl(`/main/staff/${this.id}/edit`);
		this.type = 'edit';
		this.checkType();
	}
}
