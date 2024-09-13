import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { config } from 'src/config';
import { BookingDetailComponent } from '../../../child-booking/add-booking/booking-detail/booking-detail.component';
import { MatDialog } from '@angular/material/dialog';
import { ChildAttendanceDialogComponent } from '../../manual-attendance/child-attendance-dialog/child-attendance-dialog.component';

@Component({
  selector: 'app-unbooked-sessions',
  templateUrl: './unbooked-sessions.component.html',
  styleUrls: ['./unbooked-sessions.component.scss']
})
export class UnbookedSessionsComponent extends GlobalListComponent implements OnInit
{
  tableConfigAndProps = {};
  dataSource = new MatTableDataSource();
  buttonHeaderProps: any;
  @Input() attendanceDate: any;

  inputData = {
    'imageColumn': 'profilePicture',
    'actionColumn': 'Actions',
    'expandColumn': 'expandable',
    'firstColumn': 'No.',
    'lastColumn': '',
    'roundedTable': false,
    'hasSwitch': false,
    'buttonEvent': "output"
  }
  id: any;
  unBookedSessions: any[] = [];
  childName: string;
  dateOfBirth: any;
  ngOnChanges(changes: SimpleChanges)
  {
    this.attendanceDate = changes.attendanceDate.currentValue;
    let url = `${config.base_url_slug}view/child/attendance?attributes=[{"key": "childId", "value": "${this.id}"}, {"key": "attendanceDate", "value": "${this.attendanceDate}"}, {"key": "platform","value": "web" },{"key": "branchId","value": ${localStorage.getItem('branchId')} }]`;
    let type = 'get';
    this.getSessions(url, type);
  }
  constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected permissionsService: PermissionService, protected dialog: MatDialog,)
  {
    super(router, apiService, alertService, permissionsService);
    this.actionButtons =
      [
        { buttonLabel: "Create", type: 'create', buttonRoute: "", visibility: this.permissionsService.getPermissionsByModuleName('Session Management').create },
        { buttonLabel: "Edit", type: 'edit', buttonRoute: "", visibility: this.permissionsService.getPermissionsByModuleName('Session Management').update },
        { buttonLabel: "Discard", type: 'discard', buttonRoute: "", visibility: true },
        // { buttonLabel: "Delete", type: 'delete', buttonRoute: "session", visibility: this.permissionsService.getPermissionsByModuleName('Session Management').delete },
      ]
    this.headerButtons = [
      { buttonLabel: "Create Session", color: "#E2AF2A", buttonRoute: "session/add", isMultiple: false, firstFormName: 'session-info', visibility: this.permissionsService.getPermissionsByModuleName('Session Management').create },
    ]
    this.columnHeader = {
      'room': 'Room', 'session': 'Session', 'timeIntoDisplay': 'Time In', 'timeOuttoDisplay': 'Time Out', 'Actions': 'Actions',
    };
    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
    };

    let sub = this._route.params.subscribe(params =>
    {
      this.id = params['id'];
    })
    let attendanceDate;
    let sub1 = this._route.queryParams.subscribe(params =>
    {
      attendanceDate = params['attendanceDate'];
    })
    attendanceDate = this.attendanceDate ? this.attendanceDate : attendanceDate;
    let url = `${config.base_url_slug}view/child/attendance?attributes=[{"key": "childId", "value": "${this.id}"}, {"key": "attendanceDate", "value": "${attendanceDate}"}, {"key": "platform","value": "web" },{"key": "branchId","value": ${localStorage.getItem('branchId')} }]`;
    let type = 'get';
    this.getSessions(url, type);


    // this.getList()
    super.ngOnInit();

    this.isMultiple = false;
    this.firstFormName = 'session-info';
  }
  async getSessions(url, type)
  {
    let response = await this.apiService[type](url);
    let sessions = response.data.listing;
    if (sessions.length > 0)
    {
      this.childName = sessions[0].firstName + " " + sessions[0].lastName
      this.dateOfBirth = sessions[0].dateOfBirth
    }

    this.unBookedSessions.length = 0;
    // this.unBookedSessions = sessions.filter(x => x.Attendance[0].session == null);
    for (let i = 0; i < sessions.length; i++)
    {
      let attendance = sessions[i].Attendance
      for (let j = 0; j < attendance.length; j++)
      {
        if (attendance[j].session == null)
        {
          this.unBookedSessions.push(attendance[j]);
        }
      }
    }
    this.unBookedSessions.forEach(element =>
    {
      if (element.discrepancy && element.discrepancy != "Discarded")
      {
        let rowBackgroundColor = 'rgb(255, 230, 230)'
        element['highlight'] = rowBackgroundColor
      }
      element['room'] = element.room ? element.room.name : '-'
      let endTime = element.session ? moment((element.session.endTime * 1000) + (new Date().getTimezoneOffset() * 60000)).format("hh:mm A") : ''
      let startTime = element.session ? moment((element.session.startTime * 1000) + (new Date().getTimezoneOffset() * 60000)).format("hh:mm A") : ''
      let sessionTime = startTime ? ' (' + startTime + '-' + endTime + ')' : '';
      element['session'] = element.session ? element.session.name + sessionTime : '-'
      element['timeIntoDisplay'] = element.timeIn ? moment((element.timeIn * 1000) + (new Date().getTimezoneOffset() * 60000)).format("hh:mm A") : ''
      element['timeOuttoDisplay'] = element.timeOut ? moment((element.timeOut * 1000) + (new Date().getTimezoneOffset() * 60000)).format("hh:mm A") : ''
    })

    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: new MatTableDataSource(this.unBookedSessions),
      pagination: this.pagination
    };
  }
  actionButtonOutput(event)
  {
    console.log('actionButtonOutput ==> ', event);
    if (event.item.type === "create")
    {
      this.openBookingDialog(event);
    }
    else if (event.item.type === "edit")
    {
      if (event.row.attendance === "Absent")
      {
        this.alertService.alertError('WARNING', 'You are not allowed to edit this record.');
        return;
      }
      this.openDialog(event);
    }
    else if (event.item.type == "discard")
    {
      let child = event.row;
      this.removeDiscrepancy(child.attendanceId, 'delete', child, 'child');
    }
  }
  openBookingDialog(event)
  {
    const dialogRef = this.dialog.open(BookingDetailComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      width: '70%',
    });

    let child = event.row;
    dialogRef.componentInstance.isAttendancePopup = true;
    dialogRef.componentInstance.useCustomeMargin = true;
    dialogRef.componentInstance.attendanceDate = child.createdDate;
    dialogRef.componentInstance.type = 'new';
    dialogRef.componentInstance.data = { id: child.childId, name: this.childName, roomId: event.row.roomId, dateOfBirth: this.dateOfBirth, bookingType: 'adhoc_session', attendanceId: child.attendanceId };

    dialogRef.afterClosed().subscribe(result =>
    {
      let url = `${config.base_url_slug}view/child/attendance?attributes=[{"key": "childId", "value": "${this.id}"}, {"key": "attendanceDate", "value": "${this.attendanceDate}"}, {"key": "platform","value": "web" },{"key": "branchId","value": ${localStorage.getItem('branchId')} }]`;
      let type = 'get';
      this.getSessions(url, type);
    });
  }

  openDialog(event?): void
  {
    let dialogComp: any = ChildAttendanceDialogComponent;
    const dialogRef = this.dialog.open(dialogComp, {
      autoFocus: false,
      maxHeight: '90vh',
      width: '75%',
      data: {
        event: event,
        type: 'child',
      }
    });


    dialogRef.afterClosed().subscribe(result =>
    {
      if (result.type == 'edit')
      {
        let url = `${config.base_url_slug}view/child/attendance?attributes=[{"key": "childId", "value": "${this.id}"}, {"key": "attendanceDate", "value": "${this.attendanceDate}"}, {"key": "platform","value": "web" },{"key": "branchId","value": ${localStorage.getItem('branchId')} }]`;
        let type = 'get';
        this.getSessions(url, type);
      }
    });
  }
  removeDiscrepancy(id, popupType?, Data?, attendanceType?)
  {
    let title = popupType == 'delete' ? 'CONFIRMATION' : 'YOUR COMMENT HERE';
    let message = popupType == 'delete' ? 'Reason for Discrepancy Removal ?' : '';
    let reqType = attendanceType == 'child' ? 'post' : 'patch';
    let textData = popupType == 'comment' ? Data.note : '';
    let data;
    let url;

    this.alertService.alertAsk(title, message, 'Submit', 'Cancel', true, textData).then((res: any) =>
    {
      if (res)
      {
        if (attendanceType == 'child')
        {
          data = { attendaceIds: [{ id: id, discrepancyNote: res }] };
          url = config.base_url_slug + `remove/child/attendance/discrepancy`;
        }
        this.apiService[reqType](url, data).then((res) =>
        {
          if (res.code == 200 || res.code == 201)
          {
            let msg = popupType == 'delete' ? 'Discrepancy Successfully Removed' : 'Comment Added Successfully'
            this.alertService.alertSuccess('SUCCESS', msg);
            let url = `${config.base_url_slug}view/child/attendance?attributes=[{"key": "childId", "value": "${this.id}"}, {"key": "attendanceDate", "value": "${this.attendanceDate}"}, {"key": "platform","value": "web" },{"key": "branchId","value": ${localStorage.getItem('branchId')} }]`;
            let type = 'get';
            this.getSessions(url, type);
          }
        })
          .catch(err => console.log(err));
      }
    })
  }
}
