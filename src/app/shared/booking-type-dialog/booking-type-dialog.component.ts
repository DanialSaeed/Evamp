import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { ApiService, AlertService } from 'src/app/services';
import { config } from 'src/config';
import { EndBookingDialogComponent } from '../end-booking-dialog/end-booking-dialog.component';

@Component({
  selector: 'app-booking-type-dialog',
  templateUrl: './booking-type-dialog.component.html',
  styleUrls: ['./booking-type-dialog.component.scss']
})
export class BookingTypeDialogComponent implements OnInit {

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
      'bookingType': new FormControl(null, [Validators.required]),
    });
   }

  ngOnInit(): void {

    // Check for applying minimum of date
    // if (this.bookingData.lastInvoicedDate) {
    //   let endDateOfMonth = moment(this.bookingData.lastInvoicedDate).endOf('month');
    //   this.minStart = endDateOfMonth.toDate();
    // } else {
    //   this.minStart = new Date(this.bookingData.joinDate);
    // }
    // End

  }

  onCancelClick() {
    this.dialogRef.close(false);
  }

  onSubmitClick() {
    if (this.form.invalid) {
      this.alertService.alertError('WARNING', 'Please fill the required data.');
      return;
    }

    this.dialogRef.close(this.form.get('bookingType').value);
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
