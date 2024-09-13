import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-multiple-bookings',
  templateUrl: './multiple-bookings.component.html',
  styleUrls: ['./multiple-bookings.component.scss']
})
export class MultipleBookingsComponent implements OnInit {

  constructor() { }
  invoiceData: any = {};
  bookings: any[] = [];
  dialog: any;

  ngOnInit(): void {
    // let childData = this.invoiceData.invoiceDetails.child;
    this.bookings = this.invoiceData.bookings;
    // this.bookings.forEach(book => {
    //   book.child = childData;
      // var dateString = "23/10/2015"; 

    //  var dateMomentObject = moment(dateString, "DD/MM/YYYY");
    // if ( book.leavingDate.includes('/')  book.leavingDate.includes('/'))
    // book.joiningDate = moment(book.joiningDate, "DD/MM/YYYY").format("YYYY-MM-DD");
    // book.leavingDate = moment(book.leavingDate, "DD/MM/YYYY").format("YYYY-MM-DD");

    // });

    console.log(this.bookings);
    console.log(this.invoiceData);
  }

  setTabIndex(event) {
    // this.selectedTabIndex = event.index;
  }

  close() {
    this.dialog.close();
  }

}
