import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AlertService, ApiService } from 'src/app/services';
@Component({
	selector: 'app-select-branch-dialog',
	templateUrl: './select-branch-dialog.component.html',
	styleUrls: ['/src/app/views/shared-style.scss']
})
export class SelectBranchDialogComponent implements OnInit
{
	Form: FormGroup;
	data: any;
	checked: boolean =  false
	branches: any[]
	// startTime: any;
	// endTime: any;
	// disableInput = false;
	checkBoxes: any[] = [
		{ day: 'ALL', checked: false, fullDay: 'Monday,' },
		{ day: 'Branch 1', checked: false, fullDay: 'Tuesday,' },
		{ day: 'Branch 2', checked: false, fullDay: 'Wednesday,' },
		{ day: 'Branch 3', checked: false, fullDay: 'Thursday,' },
		{ day: 'Branch 4', checked: false, fullDay: 'Friday,' },
		{ day: 'Branch 5', checked: false, fullDay: 'Saturday,' },
		{ day: 'Branch 6', checked: false, fullDay: 'Saturday,' },
		{ day: 'Branch 7', checked: false, fullDay: 'Sunday' },
		{ day: 'Branch 8', checked: false, fullDay: 'Saturday,' },
	]
	checkBoxDisabled = false;

	constructor(
		protected alertService: AlertService,
		protected apiService: ApiService,
		protected formbuilder: FormBuilder,
        protected dialogRef: MatDialogRef<SelectBranchDialogComponent>
	)
	{
		this.branches = JSON.parse(localStorage.getItem('branches'));
		// this.Form = this.formbuilder.group({});
	  // this.Form.addControl('stars', new FormControl(null));
    //   this.Form.addControl('room', new FormControl(null));
    //   this.Form.addControl('mondaystart', new FormControl(null));
    //   this.Form.addControl('mondayend', new FormControl(null));
    //   this.Form.addControl('mondaybreak', new FormControl(null));
    //   this.Form.addControl('tuesdaystart', new FormControl(null));
    //   this.Form.addControl('tuesdayend', new FormControl(null));
    //   this.Form.addControl('tuesdaybreak', new FormControl(null));
    //   this.Form.addControl('wednesdaystart', new FormControl(null));
    //   this.Form.addControl('wednesdayend', new FormControl(null));
    //   this.Form.addControl('wednesdaybreak', new FormControl(null));
    //   this.Form.addControl('thursdaystart', new FormControl(null));
    //   this.Form.addControl('thursdayend', new FormControl(null));
    //   this.Form.addControl('thursdaybreak', new FormControl(null));
    //   this.Form.addControl('fridaystart', new FormControl(null));
    //   this.Form.addControl('fridayend', new FormControl(null));
    //   this.Form.addControl('fridaybreak', new FormControl(null));

	}

	ngOnInit(): void
	{
		this.Form.patchValue(this.data);
	}

  onSubmitAddress(): void
	{
		this.dialogRef.close(this.Form.value);
	}
  onCancel(){
    this.dialogRef.close();
  }
}
