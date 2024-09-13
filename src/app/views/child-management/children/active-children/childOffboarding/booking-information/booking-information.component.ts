import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, CommunicationService, PermissionService } from 'src/app/services';
import { MatDialog } from '@angular/material/dialog';
import { config } from 'src/config';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
@Component({
  selector: 'app-booking-information',
  templateUrl: './booking-information.component.html',
  styleUrls: ['/src/app/views/shared-style.scss', './booking-information.component.scss']
})
export class BookingInformationComponent extends GlobalListComponent implements OnInit
{
  footerProps: any;
  @Input() childId: any;
  @Input() childData: any;
  @Input() previousForm: any;
  @Input() formDetail: any;
  redirectUrl = 'main/children';
  tableConfigAndProps = {};
  editableDateProps = {}
  dataSource: any;
  red = 'rgb(255, 230, 230)';
  green = 'rgb(212, 244, 224)';
  custom = 'rgb(255, 0, 0)';
  columnHeader = {
    'id': 'ID', 'roomName': 'Room', 'start': 'Start', 'end': 'End', 'type': 'Valid',
  }
  calendar: String = "assets/images/sdn/ic_event_24px.svg"
  inputData = {
    'actionColumn': 'Actions',
    'buttonEvent': "output",
    'hasCheckBox': false,
    'Action': 'Stretch'

  }
  Actionbuttons = [
    { buttonLabel: "Delete", type: 'delete', buttonRoute: "", visibility: false },
  ]

  constructor(protected router: Router,
    protected _route: ActivatedRoute,
    protected alertService: AlertService,
    protected apiService: ApiService,
    protected formbuilder: FormBuilder,
    protected dialog: MatDialog,
    protected permissionsService: PermissionService,
    protected communicationService: CommunicationService)
  {

    super(router, apiService, alertService, permissionsService);

    this.communicationService.getChild().subscribe(childData => console.log(childData));

    this.tableConfigAndProps = {
      ActionButtons: this.Actionbuttons,
      inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
    };
    this.editableDateProps = { editAble: false, disabled: true }

  }

  ngOnInit(): void
  {
    if (this.previousForm)
    {
      this.listApi = `${config.base_url_slug}view/childs/active-session-booking?sortOrder=DESC&attributes=[{"key": "childId","value": ${this.previousForm.childId} }]&leaveDate=${this.previousForm.leaveDate}`
      this.getList();
      this.checkType();
    }
    super.ngOnInit();
  }
  afterListResponse(): void
  {
    this.dataItems.forEach(element =>
    {
      // element['roomName'] = element.roomName != null ? element.roomName : '-'
      element['roomName'] = element.bookingType == 'multiple_sessions' ? 'Multiple Rooms' : element.roomName != null ? element.roomName : '-'

      element['start'] = element.joiningDate != null ? moment(new Date(element.joiningDate)).format(config.cmsDateFormat) : '-';
      element['type'] = element?.validityType == 'fullYear' ? 'Full Year' : element?.validityType == 'nonTerm' ? 'Non Term' : element?.validityType == 'termOnly' ? 'Term Only' : element?.validityType

      let offboardingLeaveDate = new Date(this.previousForm.leaveDate);
      let bookingLeaveDate = element.leavingDate != null ? new Date(element.leavingDate) : null;
      let bookingStartDate = new Date(element.joiningDate);
      if (offboardingLeaveDate < bookingStartDate)
      {
        element['end'] = bookingLeaveDate != null ? moment(new Date(bookingLeaveDate)).format(config.cmsDateFormat) : '-'
        element['highlight'] = this.red; // handle only null leave date
      }
      else if (offboardingLeaveDate >= bookingStartDate)
      {
        if (!element.leavingDate)
        {
          element['end'] = this.previousForm.leaveDate != null ? moment(new Date(this.previousForm.leaveDate)).format(config.cmsDateFormat) : '-'
          element['highlight'] = this.green;
        }
        else if (offboardingLeaveDate >= bookingLeaveDate)
        {
          element['end'] = bookingLeaveDate != null ? moment(new Date(bookingLeaveDate)).format(config.cmsDateFormat) : '-'
        }
        else if (offboardingLeaveDate >= bookingStartDate && offboardingLeaveDate < bookingLeaveDate)
        {
          element['end'] = this.previousForm.leaveDate != null ? moment(new Date(this.previousForm.leaveDate)).format(config.cmsDateFormat) : '-'
          element['highlight'] = this.green;
        }
        else
        {
          element['end'] = bookingLeaveDate != null ? moment(new Date(bookingLeaveDate)).format(config.cmsDateFormat) : '-'
          element['highlight'] = this.custom;
        }
      }
    })
    console.log("this.dataItems",this.dataItems);

    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: new MatTableDataSource(this.dataItems),
      pagination: this.pagination
    };
  }
  checkType()
  {
    this.footerProps = {
      'subButtonLabel': "Next",
      'hasbackButton': true,
      'hasButton': false,
      'hasSubButton': true,
      'hasClearForm': false,
      'backButtonLabel': 'Go Back',
      'hasCancel': true,
      'hasCancelLabel': 'Cancel',
      'type': 'output'
    };
  }

  actionButtonOutput(event)
  {

    console.log("Event-------", event);
    switch (event.item.type)
    {

      case 'delete':
        break;

      case 'edit':
        break;
    }

  }
  goBack()
  {
    let data = {
      'number': 2,
      'url': 'offboarding-funding-info',
      'prevForm': '',
      'currentForm': 'booking-information',
      'isForm': true,
    }
    this.communicationService.setChild(data);
  }
  onCancel()
  {
    window.history.back();
  }
  onNext()
  {
    let data = {
      'number': 4,
      'url': 'child-summary',
      'prevForm': '',
      'currentForm': 'booking-information',
      'isForm': true,
    }
    this.communicationService.setChild(data);
  }

}
