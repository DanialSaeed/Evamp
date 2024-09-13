import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService, UtilsService } from 'src/app/services';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { getEventDialogFieldMsg } from 'src/app/shared/field-validation-messages';
@Component({
  selector: 'app-event-dialog',
  templateUrl: './event-dialog.component.html',
  styleUrls: ['/src/app/views/shared-style.scss', './event-dialog.component.scss']
})
export class EventDialogComponent implements OnInit 
{
  bell: String = "assets/images/sdn/event_bell.svg"
  Desc: String = "assets/images/sdn/ic_assignment_24px.svg"
  event_clander: String = "assets/images/sdn/event_clander.svg"
  title = "Create"
  Form: FormGroup;
  currentDate = new Date();
  minDate: any;
  maxDate: any;
  eventDesc: String = "assets/images/sdn/eventDesc.svg"
  showValidationError = true;
  tempHolidayType: any;
  initialType: any;
  tempDescription: string;
  tempEndDate: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, protected alertService: AlertService, protected util: UtilsService, protected formbuilder: FormBuilder, protected dialogRef: MatDialogRef<EventDialogComponent>)
  {
    this.Form = this.formbuilder.group({});
    this.Form.addControl('type', new FormControl(null, [Validators.required]));
    this.Form.addControl('description', new FormControl(null, [Validators.required, Validators.maxLength(300), this.util.trimWhitespaceValidator]));
    this.Form.addControl('startDate', new FormControl(null, [Validators.required]));
    this.Form.addControl('endDate', new FormControl(null, [Validators.required]));
    this.Form.addControl('branchId', new FormControl(localStorage.getItem('branchId')));
    this.Form.addControl('termId', new FormControl(null));
    this.Form.addControl('operation', new FormControl(null));
    this.Form.addControl('isDiscountedHoliday', new FormControl(null));

    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 74, 0, 1);
  }

  ngOnInit(): void
  {
    var date = new Date(this.data.event.date), y = date.getFullYear(), m = date.getMonth();
    this.minDate = new Date(y, m, 1);
    if (this.data.event.view == "month")
    {
      this.maxDate = new Date(y, m + 1, 0);
    }
    this.initialType = this.data.event.type;

    if (this.data.event.type === "add")
    {      
      this.Form.controls['startDate'].setValue(this.data.event.date);
      this.Form.controls['endDate'].setValue(this.data.event.date);
      this.Form.controls['termId'].setValue(this.data.event.termId);
      
    }
    else 
    {
      this.title = " Update"
      let element = this.data.event.event
      this.tempHolidayType = element.type;
      this.tempDescription = element.description;
      this.tempEndDate = element.endDate;
      this.Form.controls['description'].setValue(element.description);
      this.Form.controls['startDate'].setValue(element.startDate);
      this.Form.controls['endDate'].setValue(element.endDate);
      this.Form.controls['type'].setValue(element.type);
      this.Form.controls['branchId'].setValue(element.branchId);
      this.Form.controls['termId'].setValue(element.termId);
      this.Form.controls['isDiscountedHoliday'].setValue(element.isDiscountedHoliday);

      if (element.type == 'endTermHolidays') {
        this.Form.controls['type'].setValue('midTermHolidays');
      }
    }
  }

	getErrorMessage(field: any, form?): any
	{
		if (form) {
			return form.get(field) && form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getEventDialogFieldMsg[field];
		}
		return this.Form.get(field) && this.Form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getEventDialogFieldMsg[field];
	}

  getField(field: any, form?: any): any
  {
    if (form)
    {
      return form.get(field).invalid;
    }
    return this.Form.get(field).invalid;
  }

  onSubmit(): void
  {
    if (new Date(this.Form.get('startDate').value) > new Date(this.Form.get('endDate').value))
    {
      this.Form.markAllAsTouched();
      this.alertService.alertError('WARNING', 'Start date must less then end date.');
      return;
    }
    if (this.Form.valid)
    {
      this.dialogRef.close(this.Form);
    }
    else
    {
      this.Form.markAllAsTouched();
      this.alertService.alertError('WARNING', 'Please fill the required data.');
    }
  }

  close(): void
  {
    this.dialogRef.close();
  }

  typeChange(value)
	{
		// if (value != "bankHolidays")
		// {
		// 	this.Form.get('endDate').setValue(null)
		// }

    // Setting flag for bank holiday (if status changed to bank holiday, create a new holdiay) 
    if ((this.tempHolidayType != value)) {
      this.Form.get('operation').setValue('add');
      this.Form.get('description').setValue(null);
      this.Form.get('endDate').setValue(null);
      this.title = 'Create';
    } else {
      if (this.initialType != 'add') {
        this.Form.get('operation').setValue('update');
        this.Form.get('description').setValue(this.tempDescription);
        this.Form.get('endDate').setValue(this.tempEndDate);
        this.title = 'Update';
      }
    }
    // End
	}

}