import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormArray, Validators, FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, AutocompleteFiltersService, CommunicationService, PermissionService, UtilsService } from 'src/app/services';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { getEmergencyInfoFieldMsg } from '../../../../shared/field-validation-messages';
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { config } from 'src/config';
import { ParentFormComponent } from 'src/app/shared/parent-form.component';
import { map, startWith } from 'rxjs/operators';
@Component({
	selector: 'app-emergency-details',
	templateUrl: './emergency-details.component.html',
	styleUrls: ['/src/app/views/shared-style.scss']
})
export class EmergencyDetailsComponent extends ParentFormComponent implements OnInit
{
	footerProps: any;
	location: String = "assets/images/sdn/location.svg"
	formNo = 2;
	showDuration: boolean = false;
	@Output() category: EventEmitter<string> = new EventEmitter<string>();
	@Output() sendSuccessToParent: EventEmitter<any> = new EventEmitter<any>();
	selected: any;
	startTime: any;
	endTime: any;
	emergencyDetails: FormArray;
	addCount = 0;
	@Input() childId: any;
	editPermit: any;
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
		protected util: UtilsService,
		protected filterService: AutocompleteFiltersService,
		protected permissionsService: PermissionService,
		protected communicationService: CommunicationService)
	{

		super(router, _route, alertService, apiService, formbuilder, dialog, communicationService,permissionsService);
		this.Form = this.formbuilder.group({
			childId: null,
			emergencyDetails: this.formbuilder.array([this.createItem()])
		});

		// End

		// this.Form.addControl('name', new FormControl(null));
		// this.Form.addControl('relationToChild', new FormControl(null));
		// this.Form.addControl('homeLandLineNumber', new FormControl(null));
		// this.Form.addControl('mobileNumber', new FormControl(null));
		// this.Form.addControl('workTelephoneNumber', new FormControl(null));
		// this.Form.addControl('email', new FormControl(null));
		// this.Form.addControl('placeOfWork', new FormControl(null));
		// this.Form.addControl('postal', new FormControl(null));
		// this.Form.addControl('address', new FormControl(null));
		// this.Form.addControl('option', new FormControl(null));

		this.addressRequire = false;
		this.isMultiple = true;
		this.editPermit = this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Children').update;


	}
	createItem(): FormGroup
	{
		return this.formbuilder.group({
			id: new FormControl(null),
			name: new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(36), this.util.trimWhitespaceValidator]),
			relationToChild: new FormControl(null, [Validators.required]),
			homeLandLineNumber: new FormControl(null, [Validators.min(0),Validators.minLength(8), Validators.maxLength(11), Validators.pattern("^-?[0-9]\\d*(\\.\\d{1,2})?$"), this.util.trimWhitespaceValidator]),
			mobileNumber: new FormControl(null, [Validators.required, Validators.min(0),Validators.minLength(8), Validators.maxLength(11), Validators.pattern("^-?[0-9]\\d*(\\.\\d{1,2})?$"), this.util.trimWhitespaceValidator]),
			workTelephoneNumber: new FormControl(null, [Validators.min(0),Validators.minLength(8), Validators.maxLength(11), Validators.pattern("^-?[0-9]\\d*(\\.\\d{1,2})?$"), this.util.trimWhitespaceValidator]),
			email: new FormControl(null, [Validators.email, this.util.trimWhitespaceValidator]),
			placeOfWork: new FormControl(null, [this.util.trimWhitespaceValidator]),
			address: new FormControl(null),
			addressLabel: new FormControl(null),
			authorisedToCollectTheChild: new FormControl(null, [Validators.required]),
			postalCode: new FormControl(null),
			streetNumber: new FormControl(null),
			city: new FormControl(null),
			latitude: new FormControl(null),
			longitude: new FormControl(null),
			streetAddress: new FormControl(null),
			country : new FormControl(null),
			relationLabel: new FormControl(null),
			filteredRelations: new FormControl(null),
		});
	}

	ngOnInit(): void
	{
		if (this.parentId != -1)
		{
			this.Form.get('childId').setValue(this.parentId);
		}
		console.log(this.childId, this.Form.get('childId').value);

		this.sub = this._route.params.subscribe(params =>
		{
			this.id = params['id'];
			if (this.id == 'add')
			{
				if (this.parentId != -1)
				{
					this.formApi = config.base_url_slug + "add/child/emergency-contact";
					this.detailApi = config.base_url_slug + 'view/child/' + this.parentId;
					this.getDetail();

					if (this.childId != -1)
					{
						this.formApi = config.base_url_slug + 'update/child/' + this.parentId + '/emergency-contact';
					}
					else
					{
						this.formApi = config.base_url_slug + "add/child/emergency-contact";
					}
				}
				else
				{
					this.formApi = config.base_url_slug + "add/child/emergency-contact";
				}
			}
			else
			{
				if (this.childId != -1)
				{
					this.formApi = config.base_url_slug + 'update/child/' + this.id + '/emergency-contact';
					this.detailApi = config.base_url_slug + 'view/child/' + this.id;
					this.getDetail();
				}
				else
				{
					this.formApi = config.base_url_slug + "add/child/emergency-contact";
				}
			}
		});
		super.ngOnInit();
		this.footerProps.hasSubButton = true;
		this.footerProps.subButtonLabel = "Add More";
		this.footerProps.color = "#E2AF2A";
		this.footerProps.type = "output";

		this.filteredRelations = [...this.relations];

		// Populate autcomplete data for ageBand

		this.Form.controls['emergencyDetails']['controls'].forEach((element, index) =>{
			let relation = element.controls.relationLabel.valueChanges.pipe(
				startWith(''),
				map((value: any) => this.filterService._filterRooms(value, this.relations))
			);
			element.controls.filteredRelations.setValue(this.filteredRelations)
			relation.subscribe((d)=> {element.controls.filteredRelations.setValue(d); console.log(d);
			});
		})

		this.communicationService.unSavedForm.next(false);
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
				this.communicationService.unSavedForm.next(false);
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
			this.footerProps['backColor'] = '#C1BBB9';
		}
	}

	beforeSubmit()
	{
		this.isMultiple = true
		// var startTime = moment(this.startTime,'HH:mm:ss: A').valueOf()
		// this.Form.controls['startTime'].setValue(startTime)
		// var endTime = moment(this.endTime,'HH:mm:ss: A').valueOf()
		// this.Form.controls['endTime'].setValue(endTime)
		// // console.log("this is after update")
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
	}

	
	setRelationValue(form) {
		let relation = this.relations.find(x => x.label == form.get('relationLabel').value);
		form.get('relationToChild').setValue(relation ? relation.value : null);
	}

	getErrorMessage(field: any, form?): any
	{
		return form.get(field) && form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getEmergencyInfoFieldMsg[field];
	}

	afterDetail(): void
	{
		console.log('hehehe');
		
		this.isUpdate = true;
		this.formDetail?.childEmergencyDetails?.forEach((element, index) =>
		{
			if (index > 0)
			{
				this.addMore()
			}
			this.Form.controls['emergencyDetails']['controls'][index].patchValue(element);
			this.Form.controls['emergencyDetails']['controls'].forEach(form => {
				form.get('addressLabel').setValue(form.get('address').value);

			// Setting relation manually for autocomplete
			let relationObj = this.relations.find(x => x.value == element.relationToChild);
			this.Form.controls['emergencyDetails']['controls'][index]['controls'].relationLabel.setValue(relationObj ? relationObj.label: null);
			// End
			});			
		});

		this.emptyForm = this.Form.value;
		// this.Form.patchValue(this.formDetail);
		this.communicationService.unSavedForm.next(false);
		this.checkType();
	}

	onFormClick(number)
	{
		this.formNo = number
	}

	// afterSuccessfullyAdd(): void
	// {
	//   let data = {
	//     'number': 5,
	//     'url': 'funding',
	//     'prevForm': 'childEmergencyDetails',
	//     'currentForm': 'childFinanceDetail',
	//     'isForm': true,
	//   }
	//   this.communicationService.setChild(data)

	// }

	afterSuccessfullyAdd(): void
	{
		this.emitFormData.emit({
			type: 'child',
			value: 100,
			key: 'emergencyDetailId'
		});

		let data = {
			'number': 5,
			'url': 'funding',
			'prevForm': 'childEmergencyDetails',
			'currentForm': 'childFinanceDetail',
			'isForm': true,
		}
		this.communicationService.setChild(data)
	}

	addMore()
	{
		console.log("can add more here")
		if (this.addCount < 1)
		{
			this.emergencyDetails = this.Form.get('emergencyDetails') as FormArray;
			this.emergencyDetails.push(this.createItem());
			this.addCount++;
		}
		if (this.addCount == 1)
		{
			this.footerProps.hasSubButton = false;
		}

		// Populate autcomplete data for ageBand
		this.Form.controls['emergencyDetails']['controls'].forEach((element, index) =>{
			let relation = element.controls.relationLabel.valueChanges.pipe(
				startWith(''),
				map((value: any) => this.filterService._filterRelationships(value, this.relations))
			);
			element.controls.filteredRelations.setValue(this.filteredRelations)
			relation.subscribe((d)=> {element.controls.filteredRelations.setValue(d); console.log(d);
			});
		})

		// End

	}

	clearForm()
	{
		let ids = []
		// console.log(this.Form.controls['emergencyDetails'],"------>")
		this.Form.controls['emergencyDetails']['controls'].forEach(element =>
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

		this.Form.controls['emergencyDetails']['controls'].forEach((element, index) =>
		{
			element['controls']['id'].setValue(ids[index])
		});
		// console.log("after clear------?",this.Form.controls['emergencyDetails'])
	}

	goToEdit() {
		// this.router.navigateByUrl(`/main/enrolment/${this.id}/edit`);
		this.type = 'edit';
		this.checkType();
	}
}
