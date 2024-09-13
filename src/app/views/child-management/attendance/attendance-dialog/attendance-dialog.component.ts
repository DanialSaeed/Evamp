import { Component, Inject, OnInit, } from '@angular/core';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, CommunicationService } from 'src/app/services';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { config } from 'src/config';
@Component({
	selector: 'app-attendance-dialog',
	templateUrl: './attendance-dialog.component.html',
	styleUrls: ['/src/app/views/shared-style.scss']
})
export class AttendanceDialogComponent extends GlobalFormComponent implements OnInit
{
	selectedChilds = [];
	Form: FormGroup;
	calendar: String = "assets/images/sdn/ic_event_24px.svg";
	tableConfigAndProps = {};
	footerProps: any;
	childs: any;
	buttonLabel = "Update";
	title = "Attendance";
	subTitle = "";
	disableInput = false;
	attendanceType: any;

	constructor(protected router: Router,
		protected _route: ActivatedRoute,
		protected alertService: AlertService,
		protected apiService: ApiService,
		protected formbuilder: FormBuilder,
		protected dialog: MatDialog,
		protected communicationService: CommunicationService,
		protected dialogRef: MatDialogRef<AttendanceDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any)
	{

		super(router, _route, alertService, apiService, formbuilder, dialog);
		// this.Form.addControl('childIds', new FormControl(3));
		this.Form.addControl('timeIn', new FormControl('', [Validators.required]));
		this.Form.addControl('timeOut', new FormControl('', [Validators.required]));
		// this.Form.addControl('matTimeIn', new FormControl('', [Validators.required]));
		// this.Form.addControl('matTimeOut', new FormControl('', [Validators.required]));

		this.footerProps = {
			'subButtonLabel': "Save Info",
			'hasSubButton': true,
			'type': 'output'
		};
	}
	
	ngOnInit()
	{
		this.isMultiple = true;
		if (this.data)
		{
			this.attendanceType = this.data.type;

			this.id = this.data.event.row.id;
			this.type = this.data.event.item.buttonLabel.toLowerCase();
			this.subTitle = this.attendanceType == 'child' ? this.data.event.row.child.firstName+ ' ' +this.data.event.row.child.lastName : this.data.event.row.staff.firstName+ ' ' +this.data.event.row.staff.lastName;
			this.Form.get('timeIn').setValue(this.data.event.row.timeIn);
			this.Form.get('timeOut').setValue(this.data.event.row.timeOut);
			// this.Form.get('matTimeIn').setValue((this.data.event.row.timeIn * 1000) + (new Date().getTimezoneOffset()*60000));
			// this.Form.get('matTimeOut').setValue((this.data.event.row.timeOut * 1000) + (new Date().getTimezoneOffset()*60000));
			this.checkType();


			this.formApi = config.base_url_slug +'update/child/attendance/' + this.id;
			

			if (this.attendanceType == 'staff')
			{
				this.formApi = config.base_url_slug +'update/staff-member/attendance/' + this.id;
				this.Form.addControl('breakIn', new FormControl('', [Validators.required]));
				this.Form.addControl('breakOut', new FormControl('', [Validators.required]));
				// this.Form.addControl('matBreakIn', new FormControl('', [Validators.required]));
				// this.Form.addControl('matBreakOut', new FormControl('', [Validators.required]));
				this.Form.get('breakIn').setValue(this.data.event.row.breakIn);
				this.Form.get('breakOut').setValue(this.data.event.row.breakOut);
			}
		}
	}

	checkType()
	{
		if (this.type == "view")
		{
			this.disableInput = true;
			this.title = this.type + " " + this.title;
			this.Form.disable();
		}
		else
		{
			this.title = "Edit" + " " + this.title;
		}
	}

	afterSuccessfullyAdd()
	{
		this.dialogRef.close({ 'status': 'success', 'type': this.type });
	}

	onCancel()
	{
		this.dialogRef.close();
	}

	onSetTime(event): void
	{
		console.log(event);

		let offset = new Date().getTimezoneOffset();
		const date = new Date(event.timeInMili * 1000); // Multiply by 1000 to convert seconds to milliseconds
		date.setMinutes(date.getMinutes() - offset);
		const adjustedEpochTimestamp = date.getTime() / 1000; // Divide by 1000 to convert milliseconds to seconds

		// this.Form.get(controlName).setValue(event.timeInMili);
		this.Form.get(event.controlName).setValue(adjustedEpochTimestamp);

		// this.Form.get(event.controlName).setValue(event.timeInMili);
	}

	onSubmit()
	{
		console.log("OnSubmit", this.Form.value);
		super.onSubmit();
	}

}
