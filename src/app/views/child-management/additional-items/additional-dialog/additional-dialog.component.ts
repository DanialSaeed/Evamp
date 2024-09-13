import { Component, Inject, OnInit, } from '@angular/core';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, CommunicationService, PermissionService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { config } from 'src/config';
@Component({
	selector: 'app-additional-dialog',
	templateUrl: './additional-dialog.component.html',
	styleUrls: ['/src/app/views/shared-style.scss']
})
export class AdditionalDialogComponent extends GlobalFormComponent implements OnInit
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
	additionalItems = [];

	constructor(protected router: Router,
		protected _route: ActivatedRoute,
		protected alertService: AlertService,
		protected apiService: ApiService,
		protected formbuilder: FormBuilder,
		protected dialog: MatDialog,
		protected permissionService: PermissionService,
		protected communicationService: CommunicationService,
		protected dialogRef: MatDialogRef<AdditionalDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any)
	{

		super(router, _route, alertService, apiService, formbuilder, dialog, permissionService);
		this.Form.addControl('childIds', new FormControl(3));
		this.Form.addControl('item', new FormControl('', [Validators.required]));
		this.Form.addControl('matRate', new FormControl(null));
		this.Form.addControl('rate', new FormControl(null));
		this.Form.addControl('date', new FormControl('', [Validators.required]));
		this.Form.addControl('matDate', new FormControl('', [Validators.required]));


		this.footerProps = {
			'subButtonLabel': "Save Info",
			'hasSubButton': true,
			'type': 'output'
		};

		this.editPermit = this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Additional Items').update
	}


	onSelectItemFromDropdown(value) {
		 this.Form.get('matRate').setValue(this.additionalItems.find(x => x.id == this.Form.get('item').value).amount);

	}
	ngOnInit()
	{
		this.isMultiple = true;
		this.getAdditionalItems();

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
			this.formApi = config.base_url_slug +'update/child/additional-item/' + this.id;
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
	getAdditionalItems()
	{
	  let branchId = localStorage.getItem('branchId');
	  let url = config.base_url_slug + 'view/global/additionalItem?branchId=' + branchId+'&perpage=' + 500;
	  this.apiService.get(url).then(response =>
	  {
		this.additionalItems = response.data.listing;
	  })
	}
	beforeSubmit(): void
	{
		this.Form.get('date').setValue(moment(this.Form.get('matDate').value).format(config.serverDateFormat));
		this.Form.get('rate').setValue(this.Form.get('matRate').value);
		this.Form.get('item').setValue(this.additionalItems.find(x => x.id == this.Form.get('item').value).name);
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

	// onSubmit()
	// {
	//   console.log("my form",this.Form.value);

	// }

}
