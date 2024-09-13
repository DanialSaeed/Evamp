import { Component, Inject, OnInit, } from '@angular/core';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, CommunicationService, PermissionService } from 'src/app/services';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { config } from 'src/config';

@Component({
  selector: 'app-global-additional-dialog',
  templateUrl: './global-additional-dialog.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class GlobalAdditionalDialogComponent extends GlobalFormComponent implements OnInit
{
	selectedChilds = []
	Form: FormGroup;
	calendar: String = "assets/images/sdn/ic_event_24px.svg"
	tableConfigAndProps = {};
	footerProps: any;
	childs: any;
	buttonLabel = "Update"
	title = "Additional Item"
	// dataSource = new MatTableDataSource();

	constructor(protected router: Router,
		protected _route: ActivatedRoute,
		protected alertService: AlertService,
		protected apiService: ApiService,
		protected formbuilder: FormBuilder,
		protected dialog: MatDialog,
		protected permissionService: PermissionService,
		protected communicationService: CommunicationService,
		protected dialogRef: MatDialogRef<GlobalAdditionalDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any)
	{

		super(router, _route, alertService, apiService, formbuilder, dialog, permissionService);
		this.Form.addControl('item', new FormControl('', [Validators.required]));
		this.Form.addControl('matRate', new FormControl('', [Validators.required,Validators.max(999999)]));
		this.Form.addControl('rate', new FormControl('',));
		this.Form.addControl('date', new FormControl('', [Validators.required]));
		this.Form.addControl('matDate', new FormControl('', [Validators.required]));


		this.footerProps = {
			'subButtonLabel': "Save Info",
			'hasSubButton': true,
			'type': 'output'
		};

		this.editPermit = true
	}
	ngOnInit()
	{
		this.isMultiple = true;
		if (this.data)
		{
			console.log(this.data);

			this.id = this.data.event.row.id;
			this.type = this.data.event.item.buttonLabel.toLowerCase();
			this.Form.get('item').setValue(this.data.event.row.item);
			this.Form.get('matRate').setValue(this.data.event.row.rate);
			this.Form.get('rate').setValue(this.data.event.row.rate);
			this.Form.get('date').setValue(this.data.event.row.date);
			this.Form.get('matDate').setValue(new Date(this.data.event.row.date));
			this.checkType()
			// this.formApi = config.base_url_slug +'update/child/additional-item/' + this.id;
		}

	}
	checkType()
	{
		if (this.type == "view")
		{
			// this.title = this.type + " " + this.title;
			this.title = "View Additional Item";
			this.Form.disable()
		}
		else
		{
			this.title = "Update Additional Item";
			this.Form.enable();
			console.log(this.Form);


		}
	}

	beforeSubmit(): void
	{
		this.Form.get('date').setValue(moment(this.Form.get('matDate').value).format(config.serverDateFormat));
	}

	afterSuccessfullyAdd()
	{
		this.dialogRef.close({ 'status': 'success', 'type': this.type });

	}
	onCancel()
	{
		this.type = 'view';
		this.checkType();
		// this.dialogRef.close({ 'status': 'close', 'type': this.type });
	}

//   onBlurEvent(event)
//   {
//       if (event.target.value <= 0 || event.target.value == "")
//       {
//           this.Form.controls['rate'].setErrors({ 'incorrect': true });
//           this.Form.controls['matRate'].setErrors(null);
//       }
//       else
//       {
//           this.Form.controls['rate'].setErrors(null);
//           this.Form.controls['matRate'].setErrors(null);
//           this.Form.controls['rate'].patchValue(parseFloat(event.target.value).toFixed(2))
//       }
//   }

onBlurEvent(event)
{
  if (event.target.value.includes('.')) {
	  event.target.value = parseFloat(parseFloat(event.target.value).toFixed(2));
	  this.Form.get('rate').setValue(event.target.value);
  } else {
	this.Form.get('rate').setValue(event.target.value);
  }
}

}
