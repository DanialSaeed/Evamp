import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { config } from 'src/config';
import { ChildAttendanceDialogComponent } from '../../manual-attendance/child-attendance-dialog/child-attendance-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-booked-sessions',
  templateUrl: './booked-sessions.component.html',
  styleUrls: ['./booked-sessions.component.scss']
})
export class BookedSessionsComponent extends GlobalListComponent implements OnInit
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
  bookedSessions: any[] = [];

  ngOnChanges(changes: SimpleChanges)
  {
    this.attendanceDate = changes.attendanceDate.currentValue;
    let url = `${config.base_url_slug}view/child/attendance?attributes=[{"key": "childId", "value": "${this.id}"}, {"key": "attendanceDate", "value": "${this.attendanceDate}"}, {"key": "platform","value": "web" },{"key": "branchId","value": ${localStorage.getItem('branchId')} }]`;
    let type = 'get';
    this.getSessions(url, type);
  }

  constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected permissionsService: PermissionService, protected dialog: MatDialog)
  {
    super(router, apiService, alertService, permissionsService);
    this.actionButtons =
      [
        { buttonLabel: "Edit", buttonRoute: "session", type: 'edit', visibility: this.permissionsService.getPermissionsByModuleName('Session Management').update },
        // { buttonLabel: "View", buttonRoute: "session", visibility: this.permissionsService.getPermissionsByModuleName('Session Management').read },
        {
          buttonLabel: "Discard", type: 'discard', buttonRoute: "", isConditional: true,
          condition: { key: 'isDiscrepantRow', value: true }, visibility: true
        },
      ]
    this.headerButtons = [
      { buttonLabel: "Create Session", color: "#E2AF2A", buttonRoute: "session/add", isMultiple: false, firstFormName: 'session-info', visibility: this.permissionsService.getPermissionsByModuleName('Session Management').create },
    ]
    this.columnHeader = {
      'room': 'Room', 'session': 'Session', 'timeInDisplay': 'Time In', 'timeOutDisplay': 'Time Out', 'Actions': 'Actions'
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
    let url = `${config.base_url_slug}view/child/attendance?attributes=[{"key": "childId", "value": "${this.id}"},{"key": "attendanceDate", "value": "${attendanceDate}"}, {"key": "platform","value": "web" },{"key": "branchId","value": ${localStorage.getItem('branchId')} }]`;
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
    this.bookedSessions.length = 0;
    // this.bookedSessions = sessions.filter(x => x.Attendance[0].session != null);
    for (let i = 0; i < sessions.length; i++)
    {
      let attendance = sessions[i].Attendance
      for (let j = 0; j < attendance.length; j++)
      {
        if (attendance[j].session != null)
        {
          this.bookedSessions.push(attendance[j]);
        }
      }
    }
    this.bookedSessions.forEach(element =>
    {
      element['isDiscrepantRow'] = false;
      if (element.discrepancy && element.discrepancy != "Discarded")
      {
        let rowBackgroundColor = 'rgb(255, 230, 230)'
        element['highlight'] = rowBackgroundColor;
        element['isDiscrepantRow'] = true
      }
      element['room'] = element.room ? element.room.name : '-'
      let endTime = element.session ? moment((element.session.endTime * 1000) + (new Date().getTimezoneOffset() * 60000)).format("hh:mm A") : ''
      let startTime = element.session ? moment((element.session.startTime * 1000) + (new Date().getTimezoneOffset() * 60000)).format("hh:mm A") : ''
      let sessionTime = startTime ? ' (' + startTime + '-' + endTime + ')' : '';
      element['session'] = element.session ? element.session.name + sessionTime : '-'
      element['timeInDisplay'] = element.timeIn ? moment((element.timeIn * 1000) + (new Date().getTimezoneOffset() * 60000)).format("hh:mm A") : ''
      element['timeOutDisplay'] = element.timeOut ? moment((element.timeOut * 1000) + (new Date().getTimezoneOffset() * 60000)).format("hh:mm A") : ''
    })

    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: new MatTableDataSource(this.bookedSessions),
      pagination: this.pagination
    };
  }

  actionButtonOutput(event)
  {
    if (event.item.type === "edit")
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

  openDialog(event?): void
  {
    // let dialogComp: any = ChildAttendanceDialogComponent;
    const dialogRef = this.dialog.open(ChildAttendanceDialogComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      width: '75%',
      data: {
        event: event,
        type: 'child',
      }
    });
    dialogRef.componentInstance.isShowSessionTime = false;
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

