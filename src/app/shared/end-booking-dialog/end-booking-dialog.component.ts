import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { AlertService, ApiService } from 'src/app/services';
import { config } from 'src/config';

@Component({
  selector: 'app-end-booking-dialog',
  templateUrl: './end-booking-dialog.component.html',
  styleUrls: ['./end-booking-dialog.component.scss', '/src/app/views/shared-style.scss']
})
export class EndBookingDialogComponent implements OnInit {

  optionValue = 'end';
  selectedDate = new Date();
  minStart = new Date();
  form: FormGroup;
  bookingId: any;
  calendar: String = "assets/images/sdn/ic_event_24px.svg";
  bookingData: any;

  constructor(protected formbuilder: FormBuilder, 
              protected apiService: ApiService, 
              protected dialogRef: MatDialogRef<EndBookingDialogComponent>,
              protected alertService: AlertService) {
    this.form = this.formbuilder.group({
      'option': new FormControl('end', [Validators.required]),
      'leavingDate': new FormControl(null, [Validators.required]),
    });
   }

  ngOnInit(): void {

    // Check for applying minimum of date
    if (this.bookingData.lastInvoicedDate) {
      let endDateOfMonth = moment(this.bookingData.lastInvoicedDate).endOf('month');
      this.minStart = endDateOfMonth.toDate();
    } else {
      this.minStart = new Date(this.bookingData.joinDate);
    }
    // End

  }

  onCancelClick() {
    this.dialogRef.close(false);
  }

  onSubmitClick() {
    
  }

  radioChange(e) {
    if (e.value == 'end') {
      this.form.get('leavingDate').setValue(null);
    }
  }

  dateChangeStatic(event)
  {
    const formattedDate = moment(new Date(event.value)).format(config.serverDateFormat);
    this.form.get('leavingDate').setValue(formattedDate);
    console.log(this.form.get('leavingDate').value);
    
  }

  endBooking() {
    let url = config.base_url_slug + 'end/child/session-booking/' + this.bookingId;
    let data = {};
    data['leavingDate'] = this.form.get('leavingDate').value ? this.form.get('leavingDate').value : moment(new Date()).format(config.serverDateFormat); 
    this.apiService.patch(url,data).then(result =>
      {
        if (result.code == 200 || result.code == 201)
        {
          // this.getList(this.filterUrl);
          this.alertService.alertSuccess(result.status, result.message);
          this.dialogRef.close(true);
        }
        else
        {
          this.alertService.alertError(result.status, result.message);
        }
      });
    
  }

}
