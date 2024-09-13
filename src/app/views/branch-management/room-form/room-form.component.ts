import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, AutocompleteFiltersService, PermissionService, UtilsService } from 'src/app/services';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { config } from 'src/config';
import { getRoomFieldMsg } from '../../../shared/field-validation-messages';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
@Component({
	selector: 'app-room-form',
	templateUrl: './room-form.component.html',
	styleUrls: ['/src/app/views/shared-style.scss']
})
export class RoomFormComponent extends GlobalFormComponent implements OnInit
{

	// footerProps: any;
	ageGroupId: any;
	area: any;
	title = "Room"
	// filteredAgeBands : Observable<any[]>;
	filteredAgeBands = [];

	ageBands = [
		{label: 'Under 2 years', value: '1'},
		{label: 'Between 2 and 3 years', value: '2'},
		{label: '3+ years', value: '3'},
		{label: '5+ years', value: '4'},
	]
	constructor(protected router: Router,
		protected _route: ActivatedRoute,
		protected alertService: AlertService,
		protected apiService: ApiService,
		protected formbuilder: FormBuilder,
		protected dialog: MatDialog,
		protected util: UtilsService,
		protected filterService: AutocompleteFiltersService,
		protected permissionsService?: PermissionService)
	{

		super(router, _route, alertService, apiService, formbuilder,dialog,permissionsService);
		this.Form.addControl('branchId', new FormControl('8'));
		this.Form.addControl('name', new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(28), this.util.trimWhitespaceValidator]));
		this.Form.addControl('ageGroupId', new FormControl(null, [Validators.required]));
		this.Form.addControl('length', new FormControl('', []));
		this.Form.addControl('width', new FormControl('', []));
		this.Form.addControl('area', new FormControl(null, [Validators.min(0)]));
		this.Form.addControl('totalCapacity', new FormControl(null, [Validators.min(1)]));
		this.Form.addControl('occupiedCapacity', new FormControl(null));
		this.Form.addControl('operationalCapacity', new FormControl(100));
		this.Form.addControl('ageLabel', new FormControl(null, [this.util.trimWhitespaceValidator]));

		this.editPermit = this.permissionsService.getPermissionsBySubModuleName('Branch Overview', 'Room').update;
	}

	ngOnInit(): void
	{
		// this.Form.controls['area'].disable();
		this.sub = this._route.params.subscribe(params =>
		{
			this.id = params['id'];
			// if (params.type == "edit")
			// {
			//   this.Form.controls['id'].disable()
			// }
			if (this.id == 'add') 
			{
				this.formApi = config.base_url_slug +"add/room";
			}
			else
			{
				this.formApi = config.base_url_slug +'update/room/' + this.id;
				this.detailApi = config.base_url_slug +'view/room/' + this.id;
				this.getDetail();
			}
		});
		super.ngOnInit();

		// this.filteredAgeBands = [...this.ageBands];

		
		// Populate autcomplete data for ageBand
			let ageBand = this.Form.get('ageLabel').valueChanges.pipe(
				startWith(''),
				map(value => this.filterService._filterRelationships(value, this.ageBands))
			);
			ageBand.subscribe((d)=> {this.filteredAgeBands =  d;});
	    // End

		// this.footerProps = {
		// 	'buttonLabel': "Save Info",
		// 	'hasSubButton': false,
		// };

		// this.Form.controls['area'].setValue(this.Form.get('length').value + " x " + this.Form.get('width').value)
		this.checkFormChanges();
	}

	checkFormChanges()
	{
		// this.Form.get("length").valueChanges.subscribe(length =>
		// {
		// 	this.Form.controls['area'].setValue(length + " x " + this.Form.get('width').value)
		// })

		// this.Form.get("width").valueChanges.subscribe(width =>
		// {
		// 	this.Form.controls['area'].setValue(this.Form.get('length').value + "x" + width)
		// })
	}

	getErrorMessage(field: any, form?): any
	{
		if (form) {
			return form.get(field) && form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getRoomFieldMsg[field];
		}
		return this.Form.get(field) && this.Form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getRoomFieldMsg[field];
	}

	afterDetail(): void
	{
		// var area = this.formDetail['length'] + ' x ' + this.formDetail['width'];
		this.formDetail['ageGroupId'] = this.formDetail['ageGroupId'].toString();
		this.Form.patchValue(this.formDetail);

		// Setting ageband manually for autocomplete
		let age = this.ageBands.find(x => x.value == this.formDetail.ageGroupId);
		this.Form.get('ageLabel').setValue(age ? age.label : null);
		// End

		// this.Form.controls['area'].setValue(area);
		// this.Form.controls['ageGroupId'].setValue(this.ageGroupId);

	}
	
	beforeSubmit()
	{
        this.Form.controls['branchId'].setValue(localStorage.getItem('branchId'));
        this.Form.controls['operationalCapacity'].setValue(1000);
	}

	checkType()
    {
        if (this.type != "")
        {
            if (this.type === 'view')
            {
                this.title = "View Room";
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
                this.title = "Update Room";
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
                this.title = "Add New Room";
            }
        }
    }

	setAgeId() {
		let age = this.ageBands.find(x => x.label == this.Form.get('ageLabel').value);
		this.Form.get('ageGroupId').setValue(age ? age.value : null);
	}

	// allowTwoDecimal(e) {
	// 	let val = e.target.value;
	// 	if (val.includes('.')) {
	// 		if(val.split('.')[1].length > 2){
	// 		  return false;
	// 		}
	// 		console.log(val);
	// 	 }
	// 	 console.log(this.Form.get('area').value);
	// }

	// check() {
	// 	console.log(this.Form.get('area').value);
	// }

	// areaDataHandle(e) {
	// 	if (e.target.value.includes('.')) {
	// 	  if(e.target.value.split('.')[1].length > 2) {
	// 		 e.target.value = e.target.value =  e.target.value.split('.')[0] + '.' + e.target.value.split('.')[1].slice(0,2)
	// 	  }
	// 	}
	// }

}
