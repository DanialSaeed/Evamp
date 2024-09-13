import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, AutocompleteFiltersService, CommunicationService } from 'src/app/services';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { getShiftPatternFieldMsg } from 'src/app/shared/field-validation-messages';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { FormArray } from '@angular/forms';
import { config } from 'src/config';
import * as moment from 'moment';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { map, startWith } from 'rxjs/operators';
@Component({
	selector: 'app-shift-pattern-dialog',
	templateUrl: './shift-pattern-dialog.component.html',
	styleUrls: ['/src/app/views/shared-style.scss']
})
export class ShiftPatternDialogComponent extends GlobalFormComponent implements OnInit, AfterViewInit
{

	type: any;
	data: any;
	staffId: any;
	staffName: any;
	monday: FormGroup;
	tuesday: FormGroup;
	wednesday: FormGroup;
	thursday: FormGroup;
	friday: FormGroup;
	emptyForm: any;
	patternKpi: any = {
		contractedHours: 0,
		scheduledHours: 0,
		remainingHours: 0,
	};
	isUnsavedForm = false;
	filteredRooms: any[];

	constructor(protected router: Router,
		protected _route: ActivatedRoute,
		protected alertService: AlertService,
		protected apiService: ApiService,
		protected formbuilder: FormBuilder,
		protected dialog: MatDialog,
		protected filterService: AutocompleteFiltersService,
		protected communicationService: CommunicationService,
		protected dialogRef: MatDialogRef<ShiftPatternDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data1: any)
	{

		super(router, _route, alertService, apiService, formbuilder, dialog);
		this.data = data1;
		console.log(this.data);
		
		this.type = data1?.event.type;
		this.Form.addControl('branchId', new FormControl(null, [Validators.required]));
		this.Form.addControl('staffId', new FormControl(null, [Validators.required]));
		this.Form.addControl('roomId', new FormControl(null, []));
		this.Form.addControl('patterns', new FormArray([]));
		this.Form.addControl('matjoiningDate', new FormControl(null, [Validators.required]));
		this.Form.addControl('matleaveDate', new FormControl(null));
		this.Form.addControl('joiningDate', new FormControl(null));
		this.Form.addControl('leavingDate', new FormControl(null));

		this.Form.addControl('roomLabel', new FormControl(null));

		this.emptyForm = this.Form.value;
		let day = '';
		for (let i = 0; i < 5; i++)
		{
			switch (i)
			{
				case 0:
					day = 'monday';
					break;
				case 1:
					day = 'tuesday';
					break;
				case 2:
					day = 'wednesday';
					break;
				case 3:
					day = 'thursday';
					break;
				case 4:
					day = 'friday';
					break;
			}
			let fg = this.formbuilder.group({
				"day": day,
				"startDate": new FormControl(0, [Validators.required]),
				"endDate": new FormControl(0, [Validators.required]),
				"matStartTime": new FormControl(0, [Validators.required]),
				"matEndTime": new FormControl(0, [Validators.required]),
				"breakDeduction": new FormControl(null),
				"disable": new FormControl(true),
			});

			fg.disable();
			(<FormArray>this.Form.get('patterns')).push(fg); //add day form to form array patterns
		}
	}
	ngAfterViewInit(): void
	{
		this.checkFormUrls();
		this.checkType();
	}

	ngOnInit(): void
	{
		this.id = this.data?.event?.row?.id;
		
		if (this.type == 'add') 
		{
			this.formApi = config.base_url_slug +"add/staff-member/shift-patterns";
			this.Form.controls['branchId'].setValue(this.data.event.branchId);
			this.staffId = this.data?.event?.staffId;
			this.staffName = this.data?.event?.staffName
			this.patternKpi = this.data?.event?.patternKpi
			this.Form.controls['staffId'].setValue(this.staffId);
			this.listenForChildForms();
			this.getRoomsforDropdown(this.Form.controls['branchId'].value);
			// this.Form.controls['roomId'].setValue(this.data.event.roomId);
		}
		else
		{
			this.afterDetail()
			this.formApi = config.base_url_slug +'update/staff-member/' + 'shift-patterns/' + this.id;
		}
		
		super.ngOnInit();

		this.checkFormUrls();
	}

	get patterns(): FormArray 
	{
		return this.Form.get('patterns') as FormArray;
	}

	listenForChildForms() {
		
		this.Form.valueChanges.subscribe((val)=> {
			if (JSON.stringify(this.emptyForm) != JSON.stringify(this.Form.value)) 
			{
			   this.communicationService.unSavedForm.next(true);
			}
		});

		this.communicationService.unSavedForm.subscribe((val)=> {
			if (val) {
			  this.isUnsavedForm = true;
			} else {
			  this.isUnsavedForm = false;
			}
		 })
	}

	checkFormUrls()
	{
		console.log("in form urslll")
		if (this.data?.event?.type == "add")
		{
			this.type = "add"
		}
		else 
		{
			this.type = this.data?.event?.item?.buttonLabel.toLowerCase();

		}
	}

	checkType()
	{
		// console.log("checking type", this.type)
		if (this.type != "")
		{
			if (this.type === 'view')
			{
				this.title = "View " + this.title;
				this.footerProps = {
					'hasButton': false,
				};
				this.onlyImage = true;
				this.Form.disable();
				this.disableInput = true;
			}
			else if (this.type === 'edit')
			{
				this.footerProps = {
					'type': 'output',
					'buttonLabel': "Save",
					'hasButton': true,
					'hasSubButton': true,
					'subButtonLabel': 'End Shift'

				};
				this.onlyImage = false;
				this.title = "Update " + this.title;
			}
			else
			{
				this.footerProps = {
					'buttonLabel': "Save",
					'hasButton': true,
					'hasSubButton': false,
				};
				this.onlyImage = false;
				this.title = "Add New " + this.title;
			}
		}
		this.footerProps['backColor'] = '#C1BBB9';
	}

	afterRoom(): void {
		// Setting branch manually for autocomplete
		
        if (this.type != 'add') {
			let roomObj = this.rooms.find(x => x.value == this.data.event.row.staffShiftPatternDetails[0].roomId);
			this.Form.get('roomLabel').setValue(roomObj ? roomObj.label : null);
		}

		// End

		this.filteredRooms = [...this.rooms];
		console.log(this.filteredRooms);

		// Populate autcomplete data for rooms
			let rooms = this.Form.get('roomLabel').valueChanges.pipe(
				startWith(''),
				map(value => this.filterService._filterRooms(value, this.rooms))
			);
			rooms.subscribe((d)=> this.filteredRooms =  d);
		// End
	}

	getErrorMessage(field: any): any
	{
		return getShiftPatternFieldMsg[field];
	}

	disableForm(Form)
	{
		if (this.type != "view")
		{
			if (Form.controls['disable'].value == false)
			{
				Form.disable();
				Form.controls['disable'].setValue(true);
			}
			else
			{
				Form.enable();
				Form.controls['disable'].setValue(false);
				Form.controls['breakDeduction'].setValue(null);
			}
		}
	}
	
	timeChanged(event)
	{
		// console.log("time has changed",event)
	}

	afterDetail(): void
	{
		this.patternKpi = this.data.event.patternKpi
		// this.patterns = this.data.event.patternArray
		this.staffName = this.data?.event?.staffName
		this.type = this.data?.event?.item?.buttonLabel.toLowerCase();
		this.updatePatternArray(this.data.event.patternArray)
		this.Form.controls['branchId'].setValue(this.data.event.row.branchId);
		this.id = this.data.event.row.id;
		this.staffId = this.data.event.row.staffId;
		this.Form.controls['staffId'].setValue(this.staffId);
		this.Form.controls['roomId'].setValue(this.data.event.row.roomId);
		// console.log("---------->", this.Form.value,this.data.event.patternArray)
		this.Form.controls['joiningDate'].setValue(this.data.event.row.joiningDate);
		this.Form.controls['leavingDate'].setValue(this.data.event.row.leavingDate);

		if (this.data.event.row.joiningDate) {
		    this.Form.controls['matjoiningDate'].setValue(new Date(this.data.event.row.joiningDate));
		}

		if (this.data.event.row.leavingDate) {
			this.Form.controls['matleaveDate'].setValue(new Date(this.data.event.row.leavingDate));
		}

		this.getRoomsforDropdown(this.Form.controls['branchId'].value);
	}
	updatePatternArray(patterns)
	{
		patterns.forEach(element =>
		{
			if (element['startDate'] != 0)
			{
				element['matStartTime'] = (element['startDate'] * 1000) + (new Date(element['startDate'] * 1000).getTimezoneOffset()*60000);
			}
			if (element['endDate'] != 0)
			{
				element['matEndTime'] = (element['endDate'] * 1000) + (new Date(element['endDate'] * 1000).getTimezoneOffset()*60000);

			}
			if (element['endDate'] != 0 && element['startDate'] != 0)
			{
				element['disable'] = false;

			}
			else
			{
				element['disable'] = true;
			}
			// if (element['breakDeduction'] == 0)
			// {
			// 	element['breakDeduction'] = null;
			// }

			if(this.type == 'view')
			{
				element['disable'] = true;
			}
		});
		this.Form.controls['patterns'].patchValue(patterns);
		this.Form.controls['patterns']['controls'].forEach(element =>
		{
			if (element.controls['disable'].value)
			{
				element.disable();
			}
			else
            {
                element.enable();
            }
            console.log(element);
		});
	}

	beforeSubmit()
	{
		this.isMultiple = true
		this.Form.controls['patterns']['controls'].forEach(element =>
		{
			// if (element.controls['matStartTime'].value != null && !element.controls['disable'].value)
			// {
			// 	element.controls['startDate'].setValue(element.controls['matStartTime'].value)
			// }
			// else
			// {
			// 	element.controls['startDate'].setValue(0)
			// }
			// if (element.controls['matEndTime'].value != null && !element.controls['disable'].value)
			// {
			// 	element.controls['endDate'].setValue(element.controls['matEndTime'].value)
			// }
			// else
			// {
			// 	element.controls['endDate'].setValue(0)
			// }
			if (element.controls['disable'].value)
			{
				element.controls['breakDeduction'].setValue(0)
			}
		});
	}
	
	afterSuccessfullyAdd(): void
	{
		// localStorage.removeItem('staff-id')
		this.dialogRef.close({ 'status': 'success', 'type': this.type });
	}

	onCancel()
	{
		if (this.isUnsavedForm) {
			let heading = 'Confirmation';
			let message = 'You have unsaved changes, are you sure you want to leave ?';
			let leftButton = 'Cancel';
			let rightButton = 'Leave';
			this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then((val)=> {
			   if (val) {
				this.communicationService.unSavedForm.next(false);
				this.dialogRef.close({ 'status': 'close', 'type': this.type });
			   }
			})
		} else {
			this.dialogRef.close({ 'status': 'close', 'type': this.type });
		}

	}

	setRoomId() {
		let room = this.rooms.find(x => x.label == this.Form.get('roomLabel').value);
		this.Form.get('roomId').setValue(room ? room.value : null);
	}

	onEndShift()
	{
		this.dialogRef.close({ 'status': 'success', 'type': 'delete', 'staffId': this.data?.event?.row?.id });
	}

	onSubmit(): void
	{
		this.beforeSubmit();
		if (this.Form.invalid)
		{
			this.Form.markAllAsTouched();
			this.alertService.alertError('WARNING', 'Please fill the required data.');
			return;
		}
		if (this.type == "view") {}
		else
		{
			let formData = this.Form.getRawValue();
			if (this.formValueChanged)
			{
				formData = this.otherForm;
			}

			if (this.type == 'edit')
			{
				this.apiService.patch(this.formApi, formData, this.hasFile).then(response =>
				{
					if (response.code == 201 || response.code == 200)
					{
						this.responseData = response.data;
						this.communicationService.unSavedForm.next(false);
						if (this.showSuccess)
						{
							this.alertService.alertSuccess(response.status, response.message).then(result =>
							{
								if (!this.isMultiple)
								{
									this.onLocationBack();
								}
							});
						}
						this.afterSuccessfullyAdd();
					}
					else
					{
						this.alertService.alertError(response.status, response.message);
					}
				})
			}
			else
			{
				this.apiService.post(this.formApi, formData, this.hasFile).then(response =>
				{
					if (response.code == 201 || response.code == 200)
					{
						this.responseData = response.data;
						this.communicationService.unSavedForm.next(false);
						if (this.showSuccess)
						{
							this.alertService.alertSuccess(response.status, response.message).then(result =>
							{
								if (!this.isMultiple)
								{
									this.onLocationBack();
								}
							});
						}
						this.afterSuccessfullyAdd();
					}
					else
					{
						this.alertService.alertError(response.status, response.message);
					}
				})
			}
		}
	}

	onSetTime(event, idx): void
	{
		console.log("onSetTime", event, idx);

		let offset = new Date().getTimezoneOffset();
		const date = new Date(event.timeInMili * 1000); // Multiply by 1000 to convert seconds to milliseconds
		date.setMinutes(date.getMinutes() - offset);
		const adjustedEpochTimestamp = date.getTime() / 1000; // Divide by 1000 to convert milliseconds to seconds

		let control = event.controlName == 'matStartTime' ? 'startDate' : 'endDate';
		this.Form.controls['patterns']['controls'][idx].controls[control].setValue(adjustedEpochTimestamp);
		this.Form.controls['patterns']['controls'][idx].controls[event.controlName].setValue(event.timeInMili);
	}

	dateChangeStatic(Form, controlName, event: MatDatepickerInputEvent<Date>)
	{
		let control = controlName == 'joiningDate' ? 'matjoiningDate' : 'matleaveDate';

		if (Form.get(control).value == null) {
			Form.get(controlName).setValue(null);
		} else {
			const formattedDate = moment(new Date(event.value)).format(config.serverDateFormat);
			Form.get(controlName).setValue(formattedDate);
		}
  
		console.log(controlName);
	}
}