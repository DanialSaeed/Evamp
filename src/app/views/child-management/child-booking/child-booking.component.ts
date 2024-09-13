import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { BookingPatterenDialogComponent } from 'src/app/shared/booking-patteren/booking-patteren-dialog.component';

@Component({
  selector: 'app-child-booking',
  templateUrl: './child-booking.component.html',
  styleUrls: ['/src/app/views/shared-style.scss','./child-booking.component.scss']
})
export class ChildBookingComponent extends GlobalListComponent implements OnInit
{
  idToSend: any;
  patternKpi: any = {
    contractedHours: 0,
    scheduledHours: 0,
    remainingHours: 0,
  };
  buttonHeaderProps: any;

  constructor(private dialog: MatDialog, protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected permissionService: PermissionService)
  {
    
    super(router, apiService, alertService, permissionService);
    // const dialogRef = this.dialog.open(BookingPatterenDialogComponent, {
    //     autoFocus: false,
    //     // maxHeight: '90vh',
    //     // width: '50%',
    //     // data: { event: event }
    //   });
    this.headerButtons = [
      { buttonLabel: "Add New Booking", color: "#E2AF2A", buttonRoute: "child-booking/add", isMultiple: false, firstFormName: 'select-child', visibility: this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Booking Manager').create },
    ];

    this.buttonHeaderProps = {
      headingLabel: "Child Booking",
      ActionButtons: this.headerButtons,
      hasButton: true,
      hasHeading: true,
      labelMargin: '0px',
      float: 'right',
      textclass: 'text-bolder text-color',
      buttonsMargin: '0px 10px 0px',
      margin: '10px'
    };
    // if (localStorage.getItem('booking'))
    // {
    //   localStorage.removeItem('booking')
    // }
  }

}
