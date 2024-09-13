import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, AutocompleteFiltersService, CommunicationService, PermissionService, UtilsService } from 'src/app/services';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { getBasicInfoFieldMsg } from 'src/app/shared/field-validation-messages';
import * as moment from 'moment';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { config } from 'src/config';
import { ParentFormComponent } from 'src/app/shared/parent-form.component';
import * as $ from 'jquery';
import { map, startWith } from 'rxjs/operators';
@Component({
	selector: 'app-basic-information',
	templateUrl: './basic-information.component.html',
	styleUrls: ['/src/app/views/shared-style.scss', './basic-information.component.scss']
})
export class BasicInformationComponent extends ParentFormComponent implements OnInit, OnDestroy {
	@Output() sendchildId = new EventEmitter<any>();
	currentDate = new Date();
	calendar: String = "assets/images/sdn/ic_event_24px.svg"
	ageGroupId: any;
	area: any;
	childPreviousNursery: FormGroup;
	label = "Upload Photo "
	dateOfBirth: any;
	registrationDate: any;
	hide = true;
	emptyForm: any;
	isUpdate = false;

	editPermit: any;
	showSiblingDiscount = false;
	showStaffDiscount = false;

	filteredNationalities: any[] = [];
	filteredReligions: any[];
	filteredEthinicOrigins: any[];
	filteredLanguages: any[];
	registrationMinDate = new Date()

	constructor(protected router: Router,
		protected _route: ActivatedRoute,
		protected alertService: AlertService,
		protected apiService: ApiService,
		protected formbuilder: FormBuilder,
		protected dialog: MatDialog,
		protected filterService: AutocompleteFiltersService,
		protected permissionService: PermissionService,
		protected utilService: UtilsService,
		protected communicationService: CommunicationService) {
		super(router, _route, alertService, apiService, formbuilder, dialog, communicationService, permissionService);
		this.Form.addControl('branchId', new FormControl(null, [Validators.required]));
		this.Form.addControl('firstName', new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(36), this.utilService.trimWhitespaceValidator]));
		this.Form.addControl('lastName', new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(36), this.utilService.trimWhitespaceValidator]));
		this.Form.addControl('gender', new FormControl(null, [Validators.required]));
		this.Form.addControl('knownAs', new FormControl(null, [Validators.minLength(2), Validators.maxLength(36), this.utilService.trimWhitespaceValidator]));
		this.Form.addControl('dateOfBirth', new FormControl(null, [Validators.required]));
		this.Form.addControl('matDateOfBirth', new FormControl(null, [Validators.required]));
		this.Form.addControl('registrationDate', new FormControl(null, [Validators.required]));
		this.Form.addControl('matRegistrationDate', new FormControl(null, [Validators.required]));
		this.Form.addControl('nationalityId', new FormControl(null, [Validators.required]));
		this.Form.addControl('ethnicOriginId', new FormControl(0));
		this.Form.addControl('firstLanguageId', new FormControl(0));
		this.Form.addControl('religionId', new FormControl(0));
		this.Form.addControl('religiousFestivals', new FormControl(null, this.utilService.trimWhitespaceValidator));
		this.Form.addControl('birthCertificateNumber', new FormControl("", [Validators.minLength(4), Validators.maxLength(18), Validators.pattern('[0-9]*[a-zA-Z]*[0-9]+[a-zA-Z ]*'), this.utilService.trimWhitespaceValidator]));
		this.Form.addControl('passportNumber', new FormControl("", [Validators.minLength(4), Validators.maxLength(18), this.utilService.trimWhitespaceValidator]));
		this.Form.addControl('hasChildAttendedNurseryBefore', new FormControl(false, [Validators.required]));
		this.Form.addControl('childPreviousNursery', new FormControl(null, [Validators.required]));
		// this.Form.addControl('isStaffChild', new FormControl(false));
		this.Form.addControl('discount', new FormControl());
		this.Form.addControl('matDiscount', new FormControl());
		this.Form.addControl('secretCode', new FormControl(null, [this.utilService.trimWhitespaceValidator]));

		// this.Form.addControl('siblingDiscount', new FormControl((10).toFixed(2)));
		this.Form.addControl('matSiblingDiscount', new FormControl((10).toFixed(2)));
		this.Form.addControl('isSiblingDiscountEnabled', new FormControl(false));
		this.Form.addControl('isStaffDiscountEnabled', new FormControl(false));

		this.Form.addControl('isChildEligibleForDiscount', new FormControl(false));
		this.Form.addControl('childDiscountType', new FormControl(null));

		this.Form.addControl('nationalityLabel', new FormControl(''));
		this.Form.addControl('religionLabel', new FormControl(''));
		this.Form.addControl('ethinicOriginLabel', new FormControl(''));
		this.Form.addControl('languageLabel', new FormControl(''));

		this.childPreviousNursery = this.formbuilder.group({
			'nurseryName': new FormControl(null, [this.utilService.trimWhitespaceValidator]),
			'startDate': new FormControl(null,
			),
			'endDate': new FormControl(null,
			),
			'matStartDate': new FormControl(null,
			),
			'matEndDate': new FormControl(null,
			),
		});
		// this.Form.addControl('childSiblingAtThisNursery', new FormControl(null, [Validators.required]));
		// this.Form.addControl('whenHasChildSiblingAtThisNursery', new FormControl(null,
		// 	RxwebValidators.required({ conditionalExpression: (x, y) => y.childSiblingAtThisNursery == true })
		// ));
		this.Form.addControl('image', new FormControl(null));
		this.hasFile = true;
		this.isParentForm = true;
		this.emptyForm = this.Form.value;
		this.editPermit = this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Enrollment').update;

		// check for back click browser

		// this.checkForBack();

		let fiveYearBack = new Date();
		fiveYearBack.setFullYear(fiveYearBack.getFullYear() - 5);
		this.registrationMinDate = fiveYearBack;
	}

	ngOnInit(): void {
		$('input').attr('autocomplete', 'cc-name');
		this.currentDate.setDate(this.currentDate.getDate() - 1);
		this.Form.get('hasChildAttendedNurseryBefore').valueChanges.subscribe(val => {
			if (val) {
				this.childPreviousNursery['controls']['nurseryName'].setValidators(
					[Validators.required, Validators.minLength(2), Validators.maxLength(36), Validators.pattern('[a-zA-Z]+[a-zA-Z ]*'), this.utilService.trimWhitespaceValidator]
				)
				this.childPreviousNursery['controls']['startDate'].setValidators(
					[Validators.required]
				)
				this.childPreviousNursery['controls']['matStartDate'].setValidators(
					[Validators.required]
				)
				this.childPreviousNursery['controls']['endDate'].setValidators(
					[Validators.required]
				)
				this.childPreviousNursery['controls']['matEndDate'].setValidators(
					[Validators.required]
				)
			}
			else {
				this.childPreviousNursery.reset();
				this.childPreviousNursery.setErrors(null);
				this.childPreviousNursery['controls']['nurseryName'].clearValidators();
				this.childPreviousNursery['controls']['nurseryName'].setErrors(null);
				this.childPreviousNursery['controls']['startDate'].setErrors(null);
				this.childPreviousNursery['controls']['matStartDate'].setErrors(null);
				this.childPreviousNursery['controls']['endDate'].setErrors(null);
				this.childPreviousNursery['controls']['matEndDate'].setErrors(null);
			}
		});
		this.sub = this._route.params.subscribe(params => {
			this.id = params['id'];
			if (this.id == 'add') {
				this.formApi = config.base_url_slug + "add/child";

				if (this.parentId != -1) {
					this.detailApi = config.base_url_slug + 'view/child/' + this.parentId;

					if (this.isParentForm) {
						this.formApi = config.base_url_slug + 'update/child/' + this.parentId;
						this.detailApi = config.base_url_slug + 'view/child/' + this.parentId;
						this.getDetail();
					}
					else {
						this.formApi = config.base_url_slug + "add/child";
					}
				}
				else {
					this.formApi = config.base_url_slug + "add/child";
				}
			}
			else {
				this.sendchildId.emit(this.id);
				this.formApi = config.base_url_slug + 'update/child/' + this.id;
				this.detailApi = config.base_url_slug + 'view/child/' + this.id;

				// localStorage.setItem('child-id', this.id)
				this.getDetail();
			}
		});
		// this.Form.get('isStaffChild').valueChanges.subscribe(val =>
		// {
		// 	this.Form.get('isStaffDiscountEnabled').setValue(val);

		// 	if (val == true)
		// 	{
		// 		if (this.Form.get('isStaffDiscountEnabled').value) {
		// 			this.showStaffDiscount = true;
		// 		}

		// 		this.Form.controls['discount'].setValidators([Validators.required]);
		// 		this.Form.controls['matDiscount'].setValidators([Validators.required]);
		// 		this.Form.controls['discount'].setErrors({ 'incorrect': true });
		// 		this.Form.controls['matDiscount'].setErrors({ 'incorrect': true });

		// 		if(!this.Form.get('discount').value) {
		// 			this.Form.controls['discount'].setValue('25.00');
		// 			this.Form.controls['matDiscount'].setValue('25.00');
		// 		}

		// 	} else
		// 	{
		// 		this.Form.controls['discount'].setValidators(null);
		// 		this.Form.controls['matDiscount'].setValidators(null);
		// 		this.Form.controls['discount'].setErrors(null);
		// 		this.Form.controls['matDiscount'].setErrors(null);
		// 		this.Form.controls['discount'].setValue(null);
		// 		this.Form.controls['matDiscount'].setValue(null);
		// 	}
		// });

		// this.Form.get('isSiblingDiscountEnabled').valueChanges.subscribe(val =>
		// 	{

		// 		if (val == true)
		// 		{
		// 			this.Form.controls['siblingDiscount'].setValidators([Validators.required]);
		// 			this.Form.controls['matSiblingDiscount'].setValidators([Validators.required]);
		// 		} else
		// 		{
		// 			this.Form.controls['siblingDiscount'].setValidators(null);
		// 			this.Form.controls['matSiblingDiscount'].setValidators(null);
		// 			this.Form.controls['siblingDiscount'].setErrors(null);
		// 			this.Form.controls['matSiblingDiscount'].setErrors(null);
		// 			this.Form.controls['siblingDiscount'].setValue(null);
		// 			this.Form.controls['matSiblingDiscount'].setValue(null);
		// 		}
		// 	});
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
		nationality.subscribe((d) => this.filteredNationalities = d);
		// End

		// Populate autcomplete data for religion
		let religion = this.Form.get('religionLabel').valueChanges.pipe(
			startWith(''),
			map(value => this.filterService._filterReligion(value, this.religions))
		);
		religion.subscribe((d) => this.filteredReligions = d);
		// End

		// Populate autcomplete data for ethnic Origin
		let ethinic = this.Form.get('ethinicOriginLabel').valueChanges.pipe(
			startWith(''),
			map(value => this.filterService._filterEthinicOrigin(value, this.ethnicOrigins))
		);
		ethinic.subscribe((d) => this.filteredEthinicOrigins = d);
		// End

		// Populate autcomplete data for language
		let language = this.Form.get('languageLabel').valueChanges.pipe(
			startWith(''),
			map(value => this.filterService._filterLanguage(value, this.firstLanguages))
		);
		language.subscribe((d) => this.filteredLanguages = d);
		// End

	}

	checkForBack() {
		window.addEventListener('popstate', function (event) {
			// The popstate event is fired each time when the current history entry changes.

			var r = confirm("You pressed a Back button! Are you sure?!");

			if (r == true) {
				// Call Back button programmatically as per user confirmation.
				history.back();
				// Uncomment below line to redirect to the previous page instead.
				// window.location = document.referrer // Note: IE11 is not supporting this.
			} else {
				// Stay on the current page.
				history.pushState(null, null, window.location.pathname);
			}

			history.pushState(null, null, window.location.pathname);

		}, false);
	}

	getErrorMessage(field: any, form?): any {
		if (form) {
			return form.get(field) && form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getBasicInfoFieldMsg[field];
		}
		return this.Form.get(field) && this.Form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getBasicInfoFieldMsg[field];
	}

	onBlurEvent(event, controlName, matControlName) {
		console.log(event);
		if (event.target.value !== "") {
			event.target.value = parseFloat(event.target.value).toFixed(2)
		}
		if (event.target.value > 100.00 || event.target.value <= 0.00 || event.target.value == "") {
			this.Form.controls[controlName].setValue(null);
			this.Form.controls[matControlName].setValue(null);
			this.Form.controls[controlName].setErrors({ 'incorrect': true });
			this.Form.controls[matControlName].setErrors({ 'incorrect': true });
		}
		else {
			this.Form.controls[controlName].setErrors(null);
			this.Form.controls[matControlName].setErrors(null);
			this.Form.controls[controlName].patchValue(parseFloat(event.target.value))
		}
	}
	checkType() {
		if (this.type != "") {
			if (this.type === 'view') {
				this.title = "View " + this.title;
				this.footerProps = {
					'hasButton': false,
					'type': 'view',
				};
				this.onlyImage = true;
				this.Form.disable();
				this.disableInput = true;
				localStorage.setItem('isChildView', 'true');
			}
			else if (this.type === 'edit') {
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
				localStorage.setItem('isChildView', 'true');
			}
			else {
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
	afterDetail(): void {
		this.isUpdate = true;
		this.Form.patchValue(this.formDetail);

		//check for passport & birthCertificateNumber
		console.log(this.formDetail);

		if (this.formDetail.religiousFestivals == 'null') {
			this.Form.get('religiousFestivals').setValue(null);
		}

		// if (this.formDetail.birthCertificateNumber == null) {
		// 	this.Form.get('birthCertificateNumber').setValue("");
		// }

		this.Form.controls['image'].setValue(this.formDetail.profilePicturePath);
		if (this.formDetail.dateOfBirth) {
			this.Form.get('matDateOfBirth').setValue(new Date(this.formDetail.dateOfBirth));
		}
		if (this.formDetail.registrationDate) {
			this.Form.get('matRegistrationDate').setValue(new Date(this.formDetail.registrationDate));
		}
		if (this.formDetail.discount != null) {
			this.Form.get('matDiscount').setValue(this.formDetail.discount.toFixed(2));
		}
		// if (this.formDetail.siblingDiscount)
		// {
		// 	this.Form.get('matSiblingDiscount').setValue(this.formDetail.siblingDiscount.toFixed(2));
		// }
		if (this.formDetail.hasChildAttendedNurseryBefore && this.formDetail.childPreviousNursery) {
			this.childPreviousNursery.patchValue(this.formDetail?.childPreviousNursery);
			if (this.formDetail?.childPreviousNursery.startDate) {
				this.childPreviousNursery.controls['matStartDate'].setValue(new Date(this.formDetail?.childPreviousNursery.startDate));
			}
			if (this.formDetail?.childPreviousNursery.endDate) {
				this.childPreviousNursery.controls['matEndDate'].setValue(new Date(this.formDetail?.childPreviousNursery.endDate));
			}
			this.Form.controls['hasChildAttendedNurseryBefore'].setValue(true);
		}
		else {
			this.Form.controls['hasChildAttendedNurseryBefore'].setValue(false);
		}

		if (this.Form.get('isStaffDiscountEnabled').value) {
			this.showStaffDiscount = true;
		}

		if (this.Form.get('isSiblingDiscountEnabled').value) {
			this.showSiblingDiscount = true;
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
		this.Form.get('languageLabel').setValue(languageObj ? languageObj.language : null);
		// End

		this.emptyForm = this.Form.value; console.log('ffff');
		this.communicationService.unSavedForm.next(false);

	}
	beforeSubmit() {
		// if (this.Form.get('image').invalid)
		// {
		// 	this.alertService.alertError('WARNING', 'Child image is required.');
		// 	return;
		// }

		if (this.Form.get('isChildEligibleForDiscount').value) {
			this.Form.get('childDiscountType').setValidators(Validators.required);
		} else {
			this.Form.get('childDiscountType').clearValidators();
		}
		this.Form.get('childDiscountType').updateValueAndValidity();

		if (this.checkValidations() == true) {
			this.Form.get('dateOfBirth').setValue(moment(this.Form.get('matDateOfBirth').value).format(config.serverDateFormat));
			this.Form.get('registrationDate').setValue(moment(this.Form.get('matRegistrationDate').value).format(config.serverDateFormat));
			this.childPreviousNursery.get('startDate').setValue(moment(this.childPreviousNursery.get('matStartDate').value).format(config.serverDateFormat));
			this.childPreviousNursery.get('endDate').setValue(moment(this.childPreviousNursery.get('matEndDate').value).format(config.serverDateFormat));

			this.isMultiple = true;
			this.Form.controls['childPreviousNursery'].setValue(JSON.stringify(this.childPreviousNursery.value));
			this.Form.controls['branchId'].setValue(localStorage.getItem('branchId'));
			// this.Form.get("matDateOfBirth").setValidators(null);
			// this.Form.get("matDateOfBirth").setErrors(null);
		}
		else {
			this.Form.setErrors({ 'invalid': true });
		}
	}

	checkValidations() {
		if (this.childPreviousNursery.invalid) {
			//  console.log("its invalid ===>",this.childDoctorDetail)
			this.childPreviousNursery.markAllAsTouched()
			return false;
		}
		return true;
	}
	afterSuccessfullyAdd(): void {
		// if (this.id == "add")
		// {
		// 	localStorage.setItem('child-id', this.responseData.id)
		// }
		this.sendchildId.emit(this.responseData.id);
		let data = {
			'number': 2,
			'url': 'guardian',
			'prevForm': 'id',
			'currentForm': 'childGuardianDetails',
			'isForm': false,
		}
		this.communicationService.setChild(data)
	}

	// isNegative(e) {

	// 	if ( e.target.value.toUpperCase() != e.target.value.toLowerCase() ) {
	// 		return false;
	// 	}

	// 	if(!((e.keyCode > 95 && e.keyCode < 106)
	// 	|| (e.keyCode > 47 && e.keyCode < 58)
	// 	|| e.keyCode == 8)) {
	// 	  return false;
	// 	}
	// }

	isNegative(event) {
		if (!['.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(event.key)) {
			event.preventDefault();
		}
	}

	onCheckBox(event: any) {
		console.log(this.Form.value);
	}

	beforeClear() {
		this.dateOfBirth = null
		this.registrationDate = null
	}
	clearForm() {
		this.beforeClear();
		this.Form.reset();
		this.Form.get('firstName').setValue('')
		this.Form.get('lastName').setValue('')
	}

	// onIsSiblingAtNurseryChange(event) {

	//      this.Form.get('isSiblingDiscountEnabled').setValue(event.value);
	//    this.showSiblingDiscount = event.value;

	//    if (event.value) {
	// 	this.Form.controls['siblingDiscount'].setValue('10.00');
	// 	this.Form.controls['matSiblingDiscount'].setValue('10.00');
	//   } else {
	// 	this.Form.controls['siblingDiscount'].setValue(null);
	// 	this.Form.controls['matSiblingDiscount'].setValue(null);
	//   }
	// }

	// onPresentPastSelect(val: any) {
	//   let value = val == 'present' ? true : false;
	//     this.Form.get('isSiblingDiscountEnabled').setValue(value);
	//   this.showSiblingDiscount = true;
	//     if (val == 'present') {
	// 	this.Form.controls['siblingDiscount'].setValue('10.00');
	// 	this.Form.controls['matSiblingDiscount'].setValue('10.00');
	//   } else {
	// 	this.Form.controls['siblingDiscount'].setValue(null);
	// 	this.Form.controls['matSiblingDiscount'].setValue(null);
	//   }

	// }

	// onIsSiblingDiscountChange(event: any) {
	//   this.showSiblingDiscount = event.checked;

	//   if (event.checked) {
	// 	this.Form.controls['siblingDiscount'].setValidators([Validators.required]);
	// 	this.Form.controls['matSiblingDiscount'].setValidators([Validators.required]);
	// 	this.Form.controls['siblingDiscount'].setValue('10.00');
	// 	this.Form.controls['matSiblingDiscount'].setValue('10.00');

	//   } else {
	// 	this.Form.controls['siblingDiscount'].setValidators(null);
	// 	this.Form.controls['matSiblingDiscount'].setValidators(null);
	// 	this.Form.controls['siblingDiscount'].setErrors(null);
	// 	this.Form.controls['matSiblingDiscount'].setErrors(null);
	// 	this.Form.controls['siblingDiscount'].setValue(null);
	// 	this.Form.controls['matSiblingDiscount'].setValue(null);
	//   }
	// }

	onIsStaffChildChange(event) {
		this.Form.get('isStaffDiscountEnabled').setValue(event.value);
		if (event.value == true) {
			// if (this.Form.get('isStaffDiscountEnabled').value) {
			this.showStaffDiscount = true;
			// }

			this.Form.controls['discount'].setValidators([Validators.required]);
			this.Form.controls['matDiscount'].setValidators([Validators.required]);
			this.Form.controls['discount'].setErrors({ 'incorrect': true });
			this.Form.controls['matDiscount'].setErrors({ 'incorrect': true });

			// if(!this.Form.get('discount').value) {
			this.Form.controls['discount'].setValue('25.00');
			this.Form.controls['matDiscount'].setValue('25.00');
			// }

		} else {

			this.Form.controls['discount'].setValidators(null);
			this.Form.controls['matDiscount'].setValidators(null);
			this.Form.controls['discount'].setErrors(null);
			this.Form.controls['matDiscount'].setErrors(null);
			this.Form.controls['discount'].setValue(null);
			this.Form.controls['matDiscount'].setValue(null);
		}
	}

	// onIsStaffDiscount(e) {
	// 	this.Form.get('isSiblingDiscountEnabled').setValue(true);
	// 	this.showStaffDiscount = true;
	// }

	onIsStaffDiscountChange(event: any) {
		// this.Form.get('isStaffDiscountEnabled').setValue(event.checked);
		this.showStaffDiscount = event.checked;

		if (event.checked) {
			this.Form.controls['discount'].setValidators([Validators.required]);
			this.Form.controls['matDiscount'].setValidators([Validators.required]);
			this.Form.controls['discount'].setErrors({ 'incorrect': true });
			this.Form.controls['matDiscount'].setErrors({ 'incorrect': true });
			this.Form.controls['discount'].setValue('25.00');
			this.Form.controls['matDiscount'].setValue('25.00');
		} else {
			this.Form.controls['discount'].setValidators(null);
			this.Form.controls['matDiscount'].setValidators(null);
			this.Form.controls['discount'].setErrors(null);
			this.Form.controls['matDiscount'].setErrors(null);
			this.Form.controls['discount'].setValue(null);
			this.Form.controls['matDiscount'].setValue(null);
		}
	}

	setDiscountValue(event) {

		switch (event.value) {
			// case 'siblingDiscount':
			// 	this.Form.controls['discount'].setValue('10.00');
			// 	this.Form.controls['matDiscount'].setValue('10.00');
			// break;

			case 'staffChildDiscount':
				this.Form.controls['discount'].setValue('25.00');
				this.Form.controls['matDiscount'].setValue('25.00');
				break;

			case 'discretionaryDiscount':
				this.Form.controls['discount'].setValue('0.00');
				this.Form.controls['matDiscount'].setValue('0.00');
				break;

			default:
				break;
		}
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

	goToEdit() {
		// this.router.navigateByUrl(`/main/enrolment/${this.id}/edit`);
		this.type = 'edit';
		this.checkType();
	}

	ngOnDestroy(): void {
		window.removeEventListener('popstate', () => { });
	}
}
