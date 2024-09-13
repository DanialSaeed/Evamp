import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, CommunicationService, PermissionService, UtilsService } from 'src/app/services';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { getMedicalInfoFieldMsg } from '../../../../shared/field-validation-messages';
import { MatDialog } from '@angular/material/dialog';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { config } from 'src/config';
import { ParentFormComponent } from 'src/app/shared/parent-form.component';

@Component({
	selector: 'app-medical-information',
	templateUrl: './medical-information.component.html',
	styleUrls: ['/src/app/views/shared-style.scss']
})
export class MedicalInformationComponent extends ParentFormComponent implements OnInit
{
	footerProps: any;
	@Input() childId: any;
	childMedicalInformation: FormGroup;
	childDoctorDetail: FormGroup;
	emptyForm1: any;
	emptyForm2: any;
	editPermit: any;


	constructor(protected router: Router,
		protected _route: ActivatedRoute,
		protected alertService: AlertService,
		protected apiService: ApiService,
		protected formbuilder: FormBuilder,
		protected dialog: MatDialog,
		protected util: UtilsService,
		protected permissionsService: PermissionService,
		protected communicationService: CommunicationService)
	{

		super(router, _route, alertService, apiService, formbuilder, dialog, communicationService,permissionsService);

		this.Form.addControl('childDoctorDetail', new FormControl(null));
		this.Form.addControl('childMedicalInformation', new FormControl(null));

		this.childDoctorDetail = this.formbuilder.group({});
		this.childDoctorDetail.addControl('childId', new FormControl(null));
		this.childDoctorDetail.addControl('doctorName', new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(36), this.util.trimWhitespaceValidator]));
		this.childDoctorDetail.addControl('workTelephoneNumber', new FormControl(null, [Validators.required, Validators.min(0),Validators.minLength(8), Validators.maxLength(11), Validators.pattern("^-?[0-9]\\d*(\\.\\d{1,2})?$"), this.util.trimWhitespaceValidator]));
		this.childDoctorDetail.addControl('surgeryName', new FormControl(null, [Validators.minLength(2), Validators.maxLength(36), this.util.trimWhitespaceValidator]));
		this.childDoctorDetail.addControl('address', new FormControl(null));
		this.childDoctorDetail.addControl('healthVisitorName', new FormControl(null, [Validators.minLength(2), Validators.maxLength(36), this.util.trimWhitespaceValidator]));
		this.childDoctorDetail.addControl('postalCode', new FormControl(null));
		this.childDoctorDetail.addControl('streetNumber', new FormControl(null));
		this.childDoctorDetail.addControl('city', new FormControl(null));
		this.childDoctorDetail.addControl('latitude', new FormControl(null));
		this.childDoctorDetail.addControl('longitude', new FormControl(null));
		this.childDoctorDetail.addControl('addressLabel', new FormControl(null));
		this.childDoctorDetail.addControl('streetAddress', new FormControl(null));
		this.childDoctorDetail.addControl('country', new FormControl(null));


		this.childMedicalInformation = this.formbuilder.group({});

		this.childMedicalInformation.addControl('prescribedMedicationToken', new FormControl(true));
		this.childMedicalInformation.addControl('prescribedMedicationTokenDescription', new FormControl(null,this.util.trimWhitespaceValidator));
		this.childMedicalInformation.addControl('doesChildHaveAnySpecialDietOrHealthProblemOrAllergies', new FormControl(false, [Validators.required]));
		this.childMedicalInformation.addControl('doesChildHaveAnySpecialDietOrHealthProblemOrAllergiesDescription', new FormControl(null,this.util.trimWhitespaceValidator));
		this.childMedicalInformation.addControl('areThereAnyProfessionalsInvolvedWithTheChild', new FormControl(false, [Validators.required]));
		this.childMedicalInformation.addControl('areThereAnyProfessionalsInvolvedWithTheChildDescription', new FormControl(null,this.util.trimWhitespaceValidator));
		this.childMedicalInformation.addControl('isTheChildBeingTreatedAtAHospital', new FormControl(false, [Validators.required]));
		this.childMedicalInformation.addControl('isTheChildBeingTreatedAtAHospitalDescription', new FormControl(null,this.util.trimWhitespaceValidator));
		this.childMedicalInformation.addControl('areChildImmunitiesUpToDate', new FormControl(false, [Validators.required]));
		this.childMedicalInformation.addControl('areChildImmunitiesUpToDateDescription', new FormControl(null,this.util.trimWhitespaceValidator));
		this.childMedicalInformation.addControl('doesTheChildHaveEarlyYearActionOrSupport', new FormControl(false, [Validators.required]));
		this.childMedicalInformation.addControl('doesTheChildHaveEarlyYearActionOrSupportDescription', new FormControl(null,this.util.trimWhitespaceValidator));
		this.childMedicalInformation.addControl('doesTheChildHaveAnyDistinguishingMarks', new FormControl(false, [Validators.required]));
		this.childMedicalInformation.addControl('doesTheChildHaveAnyDistinguishingMarksDescription', new FormControl(null,this.util.trimWhitespaceValidator));
		this.childMedicalInformation.addControl('wasTheChildBornPrematurely', new FormControl(false, [Validators.required]));
		this.childMedicalInformation.addControl('wasTheChildBornPrematurelyDescription', new FormControl(null,this.util.trimWhitespaceValidator));
		this.childMedicalInformation.addControl('doParentsHaveAnyConcernsOverTheChildDevelopment', new FormControl(false, [Validators.required]));
		this.childMedicalInformation.addControl('doParentsHaveAnyConcernsOverTheChildDevelopmentDescription', new FormControl(null,this.util.trimWhitespaceValidator));
		this.isMultiple = true;

		this.emptyForm1 = this.childMedicalInformation.value;
		this.emptyForm2 = this.childDoctorDetail.value;

		this.editPermit = this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Children').update;
	}

	listenForMedicalForms() {
		
		this.childMedicalInformation.valueChanges.subscribe((val)=> {
			if (JSON.stringify(this.emptyForm1) != JSON.stringify(this.childMedicalInformation.value)) 
			{
			   this.communicationService.unSavedForm.next(true);
			}
		});

		this.childDoctorDetail.valueChanges.subscribe((val)=> {
			if (JSON.stringify(this.emptyForm2) != JSON.stringify(this.childDoctorDetail.value)) 
			{
			   this.communicationService.unSavedForm.next(true);
			}
		});
	}

	checkFormUrls()
	{
		if (this.type === 'view')
		{
			this.childDoctorDetail.disable();
			this.childMedicalInformation.disable();
		}

	}

	ngOnInit(): void
	{
		if (this.parentId != -1)
		{
			this.childDoctorDetail.controls['childId'].setValue(this.parentId);
		}

		this.sub = this._route.params.subscribe(params =>
		{
			this.id = params['id'];
			if (this.id == 'add')
			{
				if (this.parentId != -1)
				{
					this.formApi = config.base_url_slug + "add/child/medical-information";
					this.detailApi = config.base_url_slug + 'view/child/' + this.parentId;
					this.getDetail();

					if (this.childId != -1)
					{
						this.formApi = config.base_url_slug + 'update/child/' + this.parentId + '/medical-information';
					}
					else
					{
						this.formApi = config.base_url_slug + "add/child/medical-information";
					}
				}
				else
				{
					this.formApi = config.base_url_slug + "add/child/medical-information";
				}
				// this.listenForMedicalForms();
			}
			else
			{
				this.childDoctorDetail.controls['childId'].setValue(this.parentId);

				if (this.childId != -1)
				{
					this.formApi = config.base_url_slug + 'update/child/' + this.id + '/medical-information';
					this.detailApi = config.base_url_slug + 'view/child/' + this.id;
					this.getDetail();
				}
				else
				{
					this.formApi = config.base_url_slug + "add/child/medical-information";
				}

				// this.formApi = config.base_url_slug + 'update/child/' + this.id + '/medical-information';
				// this.detailApi = config.base_url_slug + 'view/child/' + this.id;
				// this.getDetail();
			}
		});
		super.ngOnInit();
		this.listenForMedicalForms();
		this.communicationService.unSavedForm.next(false);


	}

	beforeSubmit()
	{
		console.log(this.childDoctorDetail);
		
		if (this.checkValidations() == true)
		{
			this.isMultiple = true
			// this.Form.controls['childDoctorDetail'].setValue(JSON.stringify(this.childDoctorDetail.value));
			// this.Form.controls['childMedicalInformation'].setValue(JSON.stringify(this.childMedicalInformation.value));
			this.Form.controls['childDoctorDetail'].setValue(this.childDoctorDetail.value);
			this.Form.controls['childMedicalInformation'].setValue(this.childMedicalInformation.value);
		}
		else
		{
			this.Form.setErrors({ 'invalid': true });
		}
	}

	removeAddress() {
		this.childDoctorDetail.get('address').setValue(null);
		this.childDoctorDetail.get('postalCode').setValue(null);
		this.childDoctorDetail.get('streetNumber').setValue(null);
		this.childDoctorDetail.get('city').setValue(null);
		this.childDoctorDetail.get('latitude').setValue(null);
		this.childDoctorDetail.get('longitude').setValue(null);	
		this.childDoctorDetail.get('addressLabel').setValue(null);
		this.childDoctorDetail.get('streetAddress').setValue(null);
		this.childDoctorDetail.get('country').setValue(null);
	}

	getErrorMessage(field: any, form?): any
	{
		if (form) {
			return form.get(field) && form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getMedicalInfoFieldMsg[field];
		}
		return this.Form.get(field) && this.Form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getMedicalInfoFieldMsg[field];
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
				this.childDoctorDetail.disable();
				this.childMedicalInformation.disable();
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
				this.childDoctorDetail.enable();
				this.childMedicalInformation.enable();
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

	afterDetail(): void
	{
		this.isUpdate = true;
		if (this.formDetail.childDoctorDetail != null)
		{
			this.childDoctorDetail.patchValue(this.formDetail['childDoctorDetail'])
			this.childDoctorDetail.get('addressLabel').setValue(this.childDoctorDetail.get('address').value);
		}
		if (this.formDetail.childDoctorDetail != null)
		{
			this.childMedicalInformation.patchValue(this.formDetail['childMedicalInformation'])
		}
		this.Form.patchValue(this.formDetail);

		this.emptyForm = this.Form.value;
		this.emptyForm1 = this.childMedicalInformation.value;
		this.emptyForm2 = this.childDoctorDetail.value;

		this.communicationService.unSavedForm.next(false);
		console.log(this.Form);
	}

	checkValidations()
	{
		if (this.childDoctorDetail.invalid || this.childMedicalInformation.invalid)
		{
			//  console.log("its invalid ===>",this.childDoctorDetail)
			this.childDoctorDetail.markAllAsTouched()
			this.childMedicalInformation.markAllAsTouched()
			return false;
		}
		return true;
	}

	afterSuccessfullyAdd(): void
	{
		this.emitFormData.emit({
			type: 'child',
			value: 100,
			key: 'medicalInfoId'
		});

		let data = {
			'number': 4,
			'url': 'emergency',
			'prevForm': 'childDoctorDetail',
			'currentForm': 'childEmergencyDetails',
			'isForm': false,
		}
		this.communicationService.setChild(data)

	}

	startsWith(str, word)
	{
		// console.log("i got ",str,word)
		if (str?.value != null)
		{
			return str.value.lastIndexOf(word, 0) === 0;

		}
	}

	beforeClear()
	{
		var childId = this.childDoctorDetail.get('childId').value
		this.childDoctorDetail.reset();
		this.childMedicalInformation.reset();
		this.childDoctorDetail.get('childId').setValue(childId);

	}

	goToEdit() {
		// this.router.navigateByUrl(`/main/enrolment/${this.id}/edit`);
		this.type = 'edit';
		this.checkType();
	}

	goBack() {
		this.type = 'view';
        this.checkType();
	}
	// checkValidations()
	// {
	//   if (this.childDoctorDetail.invalid)
	//   {

	//     this.childDoctorDetail.markAllAsTouched()
	//     return false;
	//   }
	//   if (this.childMedicalInformation.invalid)
	//   {
	//     return false;
	//   }
	//   return true;
	// }
}
