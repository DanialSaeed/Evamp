import { GlobalListComponent } from './../../../../shared/global-list';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService, ApiService, CommunicationService, PermissionService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-invoice-booking-listing',
  templateUrl: './invoice-booking-listing.component.html',
  styleUrls: ['./invoice-booking-listing.component.scss']
})
export class InvoiceBookingListingComponent extends GlobalListComponent implements OnInit {

  @Input() bookings: any[] = [];
  @Output() tabIndex = new EventEmitter<any>();
  selectedTabIndex = 0;
  tableConfigAndProps = {};
	footerProps: any;
	childs: any;
	buttonHeaderProps: any;
  data = [];

  dataSource = new MatTableDataSource(this.data);

  inputData = {
    'actionColumn': 'Actions',
    'buttonEvent': "output",
    'hasCheckBox': false,
  }
  Actionbuttons = [
    { buttonLabel: "Delete", type: 'delete', buttonRoute: "" },
  ]

  columnHeader = {
    'day': 'Days', 'session': 'Session Name', 'numberOfHours': 'Attended Hrs', 'fundedHours': 'Funded Hrs', 'daysCount': 'Qty', 'price': 'Rate', 'totalPrice': 'Amount'
  };

  constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService,
    protected permissionService: PermissionService)
    {
      super(router, apiService, alertService, permissionService)

    }

  ngOnInit(): void {

    this.tableConfigAndProps = {
			ActionButtons: this.Actionbuttons,
			inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
		};

    super.ngOnInit();
  }

  setTabIndex(event) {
    this.tabIndex.emit(event.index);
  }

  afterListResponse() {
    this.dataItems.forEach((booking)=>{

    })
  }

  getProps(booking) {
    this.tableConfigAndProps = {
      ActionButtons: this.Actionbuttons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: new MatTableDataSource(booking.invoiceChildBookingSessionDetail),
    };

    return this.tableConfigAndProps;
  }

}
