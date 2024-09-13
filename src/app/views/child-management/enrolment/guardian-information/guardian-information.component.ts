import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormArray, Validators, FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, AutocompleteFiltersService, CommunicationService, PermissionService, UtilsService } from 'src/app/services';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { MatDialog } from '@angular/material/dialog';
import { getGuardianInfoFieldMsg } from '../../../../shared/field-validation-messages';
import { config } from 'src/config';
import { ParentFormComponent } from 'src/app/shared/parent-form.component';
import { map, startWith } from 'rxjs/operators';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import * as moment from 'moment';

@Component({
    selector: 'app-guardian-information',
    templateUrl: './guardian-information.component.html',
    styleUrls: ['/src/app/views/shared-style.scss']
})

export class GuardianInformationComponent extends ParentFormComponent implements OnInit
{
    footerProps: any;
    formNo = 2;
    selected: any;
    guardianDetails: FormArray;
    addCount = 0;
    dateOfBirth: any;
    @Input() childId: any;
    filteredChildrens : any[] = [];
    editPermit: any;
    filteredLanguages: any[];
    filteredLanguages2: any[];
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
		{label: 'Other', value: 'other'},
	]

    constructor(protected router: Router,
        protected _route: ActivatedRoute,
        protected alertService: AlertService,
        protected apiService: ApiService,
        protected formbuilder: FormBuilder,
        protected dialog: MatDialog,
        protected utilService: UtilsService,
        protected filterService: AutocompleteFiltersService,
        protected permissionsService: PermissionService,
        protected communicationService: CommunicationService)
    {
        super(router, _route, alertService, apiService, formbuilder, dialog, communicationService,permissionsService);
        this.Form = this.formbuilder.group({
            childId: null,
            guardianDetails: this.formbuilder.array([this.createItem()])
        });
        this.isMultiple = true;
        this.editPermit = this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Children').update;
    }

    createItem(): FormGroup
    {
        return this.formbuilder.group({
            'id': new FormControl(null),
            'title': new FormControl(null, [Validators.required]),
            'name': new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(36), this.utilService.trimWhitespaceValidator]),
            'relationToChild': new FormControl(null, [Validators.required]),
            'dateOfBirth': new FormControl(null),
            'matDateOfBirth': new FormControl(null),
            'firstLanguageId': new FormControl(0, [Validators.required]),
            'nationalInsuranceNumber': new FormControl(null, [Validators.pattern('^[a-zA-Z]{2}[0-9]{6}[a-zA-Z]{1}$'), this.utilService.trimWhitespaceValidator]),
            'homeLandLineNumber': new FormControl(null, [Validators.min(0),Validators.minLength(10), Validators.maxLength(16), Validators.pattern("^-?[0-9]\\d*(\\.\\d{1,2})?$"), this.utilService.trimWhitespaceValidator]),
            'mobileNumber': new FormControl(null, [Validators.required, Validators.min(0),Validators.minLength(10), Validators.maxLength(16), Validators.pattern("^-?[0-9]\\d*(\\.\\d{1,2})?$"), this.utilService.trimWhitespaceValidator]),
            'address': new FormControl(null, [Validators.required]),
            'workTelephoneNumber': new FormControl(null, [Validators.min(0),Validators.minLength(10), Validators.maxLength(16), Validators.pattern("^-?[0-9]\\d*(\\.\\d{1,2})?$")]),
            'email': new FormControl(null, [Validators.required, Validators.email,this.utilService.trimWhitespaceValidator]),
            'postalCode': new FormControl(null, [Validators.required]),
            'streetNumber': new FormControl(null, [Validators.required]),
            'city': new FormControl(null, [Validators.required]),
            'latitude': new FormControl(null),
            'longitude': new FormControl(null),
            'isPrimaryGuardian': new FormControl(null),
            'addressLabel': new FormControl(null, [Validators.required]),
            'streetAddress': new FormControl(null),
            'country': new FormControl(null),
            'region': new FormControl(null),

            'languageLabel': new FormControl(null, [Validators.required, this.utilService.trimWhitespaceValidator]),
            'filteredLanguage':  new FormControl(null),
            'relationLabel':  new FormControl(null),
        });
    }
    ngOnInit(): void
    {
        if (this.parentId != -1)
        {
            this.Form.controls['childId'].setValue(this.parentId);
        }

        this.sub = this._route.params.subscribe(params =>
        {
            this.id = params['id'];
            if (this.id == 'add')
            {
                if (this.parentId != -1)
                {
                    this.formApi = config.base_url_slug + "add/child/guardian-contact";
                    this.detailApi = config.base_url_slug + 'view/child/' + this.parentId;
                    this.getDetail();

                    if (this.childId != -1)
                    {
                        this.formApi = config.base_url_slug + 'update/child/' + this.parentId + '/guardian-contact';
                    }
                    else
                    {
                        this.formApi = config.base_url_slug + "add/child/guardian-contact";
                    }
                }
                else
                {
                    this.formApi = config.base_url_slug + "add/child/guardian-contact";
                }
            }
            else
            {
                // this.formApi = config.base_url_slug + 'update/child/' + this.id + '/guardian-contact';
                // this.detailApi = config.base_url_slug + 'view/child/' + this.id;
                // this.getDetail();

                if (this.childId != -1)
                {
                    this.formApi = config.base_url_slug + 'update/child/' + this.id + '/guardian-contact';
                    this.detailApi = config.base_url_slug + 'view/child/' + this.id;
                    this.getDetail();
                }
                else
                {
                    this.formApi = config.base_url_slug + "add/child/guardian-contact";
                }
            }
        });

        // let x = this.Form.get('name').valueChanges.pipe(
        //     startWith(''),
        //     map(value => this._filter(value))
        //   );

        super.ngOnInit();

        this.filteredLanguages = [...this.firstLanguages];
        
        this.Form.controls['guardianDetails']['controls'].forEach((element, index) =>{
            // Populate autcomplete data for language
            let language = element.controls.languageLabel.valueChanges.pipe(
                startWith(''),
                map(value => this.filterService._filterLanguage(value, [...this.firstLanguages]))
            );
            element.controls.filteredLanguage.setValue(this.filteredLanguages)
            language.subscribe((d)=> element.controls.filteredLanguage.setValue(d));
            // End
        })

        // this.filteredRelations = [...this.relations];

		// Populate autcomplete data for ageBand

		// this.Form.controls['guardianDetails']['controls'].forEach((element, index) =>{
		// 	let relation = element.controls.relationLabel.valueChanges.pipe(
		// 		startWith(''),
		// 		map((value: any) => this.filterService._filterRooms(value, this.relations))
		// 	);
		// 	element.controls.filteredRelations.setValue(this.filteredRelations)
		// 	relation.subscribe((d)=> {element.controls.filteredRelations.setValue(d); console.log(d);
		// 	});
		// })



        // x.subscribe((d: any)=>
        // this.filteredChildrens =  d);
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
                    'hasButton': true,
                    'hasSubButton': true,
                    'hasbackButton': true,
                    'backButtonLabel': 'Cancel',
                    'subButtonLabel': "Add More",
                    'color': "#E2AF2A",
                    'type': "output"
                };
                this.Form.enable();
                this.disableInput = false;
                this.onlyImage = false;
                this.title = "Update " + this.title;
            }
            else
            {
                this.footerProps = {
                    'buttonLabel': "Next",
                    'hasButton': true,
                    'hasSubButton': true,
                    'hasbackButton': true,
                    'backButtonLabel': 'Cancel',
                    'subButtonLabel': "Add More",
                    'color': "#E2AF2A",
                    'type': "output"
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
    beforeSubmit()
    {
        this.isMultiple = true;
        this.Form.controls['guardianDetails']['controls'].forEach((element, index) =>
        {
            if (index == 0)
            {
                element.controls.isPrimaryGuardian.patchValue(true)
            }
            else if (index == 1)
            {
                element.controls.isPrimaryGuardian.patchValue(false)
            }
        });
    }

    setRelationValue(form) {
		let relation = this.relations.find(x => x.label == form.get('relationLabel').value);
		form.get('relationToChild').setValue(relation ? relation.value : null);
	}

    getErrorMessage(field: any, form?): any
	{
		if (form) {
			return form.get(field) && form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getGuardianInfoFieldMsg[field];
		}
		return this.Form.get(field) && this.Form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getGuardianInfoFieldMsg[field];
	}

    afterDetail(): void
    {
        this.isUpdate = true;
        this.formDetail?.childGuardianDetails?.forEach((element, index) =>
        {
            if (element.dateOfBirth) {
                element['matDateOfBirth'] = (new Date(element.dateOfBirth));
            }

            if (index > 0)
            {
                this.addMore()
            }
            this.Form.controls['guardianDetails']['controls'][index].patchValue(element);

            // Setting language manually for autocomplete
            let languageObj = this.firstLanguages.find(x => x.id == element.firstLanguageId);
            this.Form.controls['guardianDetails']['controls'][index]['controls'].languageLabel.setValue(languageObj ? languageObj.language: null);
            // End

            // Setting relation manually for autocomplete
			// let relationObj = this.relations.find(x => x.value == element.relationToChild);
			// this.Form.controls['guardianDetails']['controls'][index]['controls'].relationLabel.setValue(relationObj ? relationObj.label: null);
			// End

            this.Form.controls['guardianDetails']['controls'].forEach(form => {
                form.get('addressLabel').setValue(form.get('address').value);
            });
        });

        this.emptyForm = this.Form.value;

        this.communicationService.unSavedForm.next(false);
        this.checkType()
    }

    // afterSuccessfullyAdd(): void
    // {
    // 	let data = {
    // 		'number': 3,
    // 		'url': 'medical',
    // 		'prevForm': 'childGuardianDetails',
    // 		'currentForm': 'childDoctorDetail',
    // 		'isForm': true,
    // 	}
    // 	this.communicationService.setChild(data)
    // }

    afterSuccessfullyAdd(): void
    {
        this.emitFormData.emit({
            type: 'child',
            value: 100,
            key: 'guardianInfoId'
        });

        let data = {
            'number': 3,
            'url': 'medical',
            'prevForm': 'childGuardianDetails',
            'currentForm': 'childDoctorDetail',
            'isForm': true,
        }
        this.communicationService.setChild(data)
    }

    addMore()
    {
        if (this.addCount < 1)
        {
            this.guardianDetails = this.Form.get('guardianDetails') as FormArray;
            this.guardianDetails.push(this.createItem());
            this.addCount++;

            this.Form.controls['guardianDetails']['controls'].forEach((element, index) =>{
                // debugger;
                // Populate autcomplete data for language
                let language = element.controls.languageLabel.valueChanges.pipe(
                    startWith(''),
                    map(value => this.filterService._filterLanguage(value, [...this.firstLanguages]))
                );
                element.controls.filteredLanguage.setValue(this.filteredLanguages)
                language.subscribe((d)=> element.controls.filteredLanguage.setValue(d));
                // End
            })
        }
        if (this.addCount == 1)
        {
            this.footerProps.hasSubButton = false;
        }
    }

    setChildData() {
        // this.selectedChild = this.Form.get('child').value;
        // this.Form.get('child').setValue(this.selectedChild.firstName);
        // console.log(this.selectedChild);
        // console.log(this.Form.get('child').value);
        // if (this.Form.get('child').value != ''){
        //   this.Form.get('guardian').setValue(this.selectedChild.childGuardianDetails[0].name);
        //   this.Form.get('address').setValue(this.selectedChild.childGuardianDetails[0].address);
        // } else {
        //   this.Form.get('guardian').setValue(null);
        //   this.Form.get('address').setValue(null);
        // }
    
      }

    private _filter(value: any) {
        // console.log(value);
        // let filterValue = '';
        // console.log(this.Form.get('child').value);
        // if (typeof(value) == 'string') {
        //   filterValue = value.toLowerCase();
        // } else {
        //   filterValue = value.firstName.toLowerCase();
        // }

        // return this.childrens.filter(option => option.firstName.toLowerCase().includes(filterValue));
    }

    removeAddress(form) {
		form.get('address').setValue(null);
		form.get('postalCode').setValue(null);
		form.get('streetNumber').setValue(null);
		form.get('city').setValue(null);
		form.get('latitude').setValue(null);
		form.get('longitude').setValue(null);	
        form.get('addressLabel').setValue(null);
        form.get('streetAddress').setValue(null);
        form.get('country').setValue(null);
        form.get('region').setValue(null);
	}

    clearForm()
    {
        let ids = [];
        // console.log(this.Form.controls['emergencyDetails'],"------>")
        this.Form.controls['guardianDetails']['controls'].forEach(element =>
        {
            ids.push(element['controls']['id'].value)
        });
        this.beforeClear();
        this.Form.reset()
        // var child_id = localStorage.getItem('child-id');
        if (this.childId != null)
        {
            this.Form.controls['childId'].setValue(this.childId);
        }

        this.Form.controls['guardianDetails']['controls'].forEach((element, index) =>
        {
            element['controls']['id'].setValue(ids[index])
        });
    }

    setDateFormat(form: FormGroup, realField, event: MatDatepickerInputEvent<Date>)
    {
        if (form.get('matDateOfBirth').value == null) {
           form.get('dateOfBirth').setValue(null);
        } else {
            form.get(realField).setValue(moment(new Date(event.value)).format(config.serverDateFormat));
        }
    }

    setLanguageId(form) {
		let language = this.firstLanguages.find(x => x.language == form.get('languageLabel').value);
		form.get('firstLanguageId').setValue(language ? language.id : null);
	}

	goToEdit() {
		// this.router.navigateByUrl(`/main/enrolment/${this.id}/edit`);
		this.type = 'edit';
		this.checkType();
	}
}
