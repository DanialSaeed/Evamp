import { Component, Inject, OnInit, } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, CommunicationService } from 'src/app/services';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { config } from 'src/config';
import * as moment from 'moment';
@Component({
  selector: 'app-child-attendance-dialog',
  templateUrl: './child-attendance-dialog.component.html',
  styleUrls: ['./child-attendance-dialog.component.scss']
})
export class ChildAttendanceDialogComponent implements OnInit
{
  Form: FormGroup;
  FormTwo: FormGroup;
  attendanceLog: FormGroup;
  breakLog: FormGroup;
  calendar: String = "assets/images/sdn/ic_event_24px.svg";
  childs: any;
  buttonLabel = "Update";
  title = "Attendance";
  subTitle = "";
  disableInput = false;
  attendanceType: any;
  attendanceData: any;
  id: any;
  activeChildrens: any[] = [];
  rooms: any[] = [];
  roomId: any;
  childId: any;
  currentDate = new Date();
  dateValue: any;
  attendanceDate: string;
  isShowSessionTime: boolean = true;
  isUpdateDisabled: boolean = false;

  constructor(protected router: Router,
    protected _route: ActivatedRoute,
    protected alertService: AlertService,
    protected apiService: ApiService,
    protected formbuilder: FormBuilder,
    protected dialog: MatDialog,
    protected communicationService: CommunicationService,
    protected dialogRef: MatDialogRef<ChildAttendanceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {

    // super(router, _route, alertService, apiService, formbuilder, dialog);

    this.Form = this.formbuilder.group({
      'childId': new FormControl('', []),
      'branchId': new FormControl(localStorage.getItem('branchId')),
      'roomId': new FormControl(''),
      'attendanceId': new FormControl(null),
      // "attendanceLogs": this.formbuilder.array([]),
      "booked_attendance": this.formbuilder.array([]),
    })
    this.FormTwo = this.formbuilder.group({
      dateValue: ['']
    })

  }

  ngOnInit()
  {
    // this.isMultiple = true;
    if (this.data)
    {
      this.attendanceType = this.data.type;
      this.attendanceData = this.data.event.row;
      this.id = this.data.event.row.id;

      console.log("In model", this.attendanceData);
      this.FormTwo.get('dateValue').setValue(this.attendanceData.oldDate);
      if (!this.attendanceData.Attendance)
      {
        let temp = [];
        this.FormTwo.get('dateValue').setValue(this.attendanceData.oldDate ? this.attendanceData.oldDate : this.attendanceData.createdDate);
        temp.push({ Attendance: [this.attendanceData] })
        this.attendanceData = temp[0];
      }
      this.attendanceData.Attendance.forEach((log) =>
      {
        // Adding logs in Array
        this.childId = log.childId;
        this.roomId = log.roomId ? log.roomId : this.attendanceData.roomId;
        let endTime = log.session != '-' && log.session ? moment(new Date(log.session.endTime * 1000)).format("hh:mm A") : ''
        let startTime = log.session != '-' && log.session ? moment(new Date(log.session.startTime * 1000)).format("hh:mm A") : ''
        let sessionTime = startTime ? '(' + startTime + '-' + endTime + ')' : '';
        let session = log.session ? log.session.name : ''
        let sessionId = log.session ? log.session.id : null
        let addOns = log.addOns ? log.addOns : null;
        let childBookingSessionId = log.childBookingSessionDetailId ? log.childBookingSessionDetailId : null;
        // Setting utc to London time 
        log['matTimeIn'] = log.timeIn ? (log.timeIn * 1000) + (new Date(log.timeIn * 1000).getTimezoneOffset()*60000) : 0;
        log['matTimeOut'] = log.timeOut ? (log.timeOut * 1000) + (new Date(log.timeOut * 1000).getTimezoneOffset()*60000) : 0;

        let logArr = this.Form.get('booked_attendance') as FormArray;
        let attendanceLog = this.formbuilder.group({
          "timeIn": new FormControl(null, [Validators.required]),
          "timeOut": new FormControl(null, []),
          "matTimeIn": new FormControl(null, [Validators.required]),
          "matTimeOut": new FormControl(null, []),
          "note": new FormControl(null),
          "createdDate": new FormControl(this.FormTwo.get('dateValue').value),
          "attendanceType": new FormControl(null),
          "sessionId": new FormControl(sessionId),
          "session": new FormControl(session),
          "sessionTime": new FormControl(sessionTime),
          "addOns": new FormControl(addOns),
          "attendanceId": new FormControl(log.attendanceId),
          "childBookingSessionId": new FormControl(childBookingSessionId),
        })
        log.createdDate = this.FormTwo.get('dateValue').value;
        if (log.sessionId == null)
        {
          log.attendanceType = 'adhoc_attendance';
        }
        else
        {
          log.attendanceType = 'booking_attendance';
          // log.sessionId = log.sessionId;
          // log.session = log.session.name;
        }
        if (!log.timeIn)
        {
          this.isUpdateDisabled = true;
        }

        attendanceLog.patchValue(log)
        logArr.push(attendanceLog);
      });
      // this.subTitle = this.attendanceType == 'child' ? this.data.event.row.child.firstName + ' ' + this.data.event.row.child.lastName : this.data.event.row.staff.firstName + ' ' + this.data.event.row.staff.lastName;
      let branchId = localStorage.getItem('branchId')
      this.getChildrens(branchId);
      this.getRoomsforDropdown(branchId);
    }
  }

  // checkType()
  // {
  // 	if (this.type == "view")
  // 	{
  // 		this.disableInput = true;
  // 		this.title = this.type + " " + this.title;
  // 		this.Form.disable();
  // 	}
  // 	else
  // 	{
  // 		this.title = "Edit" + " " + this.title;
  // 	}
  // }

  afterSuccessfullyAdd()
  {
    this.dialogRef.close({ 'status': 'success', 'type': 'edit' });
  }

  onCancel()
  {
    this.dialogRef.close();
  }

  onSetTime(event, control?, controlName?): void
  {
    let timeInMilli = this.getTimeForSelectedDate(event);
    control.get(event.controlName).setValue(timeInMilli);
    control.get(controlName).setValue(event.timeInMili);
    this.isUpdateDisabled = false;
  }

  onSubmit()
  {
    // let data = this.Form.value;
    this.Form.get('childId').setValue(this.childId);
    this.Form.get('roomId').setValue(this.roomId);
    console.log("OnSubmit ----***----", this.Form.value);
    let data = { ...this.Form.value };
    let adhoc_attendance = [];
    let booked_attendance = [];
    let postData = data.booked_attendance[0];
    if (postData.attendanceId)
    {
      data.attendanceId = postData.attendanceId;
    }
    else
    {
      data.attendanceId = null;
    }
    if (postData.sessionId == null)
    {
      this.attendanceData.createdDate = this.FormTwo.get('dateValue').value;
      adhoc_attendance.push(data.booked_attendance[0])
      this.Form.addControl('adhoc_attendance', new FormControl(adhoc_attendance));
      data['adhoc_attendance'] = adhoc_attendance;
      data.booked_attendance.length = 0;
    }
    else
    {
      this.attendanceData.createdDate = this.FormTwo.get('dateValue').value;
      booked_attendance.push(data.booked_attendance[0])
      this.Form.addControl('booked_attendance', new FormControl(booked_attendance))
      data['booked_attendance'] = booked_attendance;
      data['adhoc_attendance'] = adhoc_attendance = [];
    }
    let url = config.base_url_slug;
    this.apiService.patch(url + 'update/child/take-attendance', data).then((response) =>
    {
      console.log("add api's response ", response);
      if (response.code == 201 || response.code == 200)
      {
        let msg = (response.code == 201 || response.code == 200) ? 'Attendance Updated Successfully' : response.message;
        this.alertService.alertSuccess(response.status, msg).then(() =>
        {
          this.afterSuccessfullyAdd();
        });
      }
      else if (response.code == 400 || response?.error?.code)
      {
        let status = response.error.status ? response.error.status : response.status;
        let message = response.error.message ? response.error.message : response.message
        this.alertService.alertError(status, message)
      }
    })
  }

  goToView()
  {
    this.router.navigate([`main/staff-attendance-detail/${this.data?.event?.row?.childId}/child`]);
    localStorage.setItem('AttendanceDate', this.attendanceData.createdTime);
    this.onCancel();
  }

  onSetTimeSignOut(event, control?, controlName?)
  {

    let timeInMilli = this.getTimeForSelectedDate(event);
    control.get(event.controlName).setValue(timeInMilli);
    control.get(controlName).setValue(event.timeInMili);
  }

  getTimeForSelectedDate(event)
  {

    // Setting the Date of row data for selected time
    let attendanceDate = new Date(this.FormTwo.get('dateValue').value);
    let selected = new Date(event.timeInMili * 1000);
    attendanceDate.setHours(selected.getHours());
    attendanceDate.setMinutes(selected.getMinutes());
    attendanceDate.setSeconds(0);

    let offset = attendanceDate.getTimezoneOffset();
		const date = new Date(event.timeInMili * 1000); 
		attendanceDate.setMinutes(attendanceDate.getMinutes() - offset);
		let finalUnix = attendanceDate.getTime() / 1000; 

    // let finalUnix = (attendanceDate.getTime() / 1000);
    console.log(finalUnix);


    return finalUnix;
    // End
  }

  get attendancelogs(): FormArray
  {
    return this.Form.get("attendanceLogs") as FormArray
  }

  get booked_attendance(): FormArray
  {
    return this.Form.get("booked_attendance") as FormArray
  }

  onDateChange()
  {
    this.attendanceDate = moment(new Date(this.FormTwo.get('dateValue').value)).format(config.serverDateFormat);
    this.FormTwo.get('dateValue').setValue(this.attendanceDate)

  }
  getChildrens(branchId: any)
  {
    let attributes = '?attributes=[{"key": "branchId","value":' + branchId + '}]&perPage=1000';
    this.apiService.get(config.base_url_slug + 'v4/view/childs' + attributes).then(res =>
    {
      this.activeChildrens = res.data.listing;
    })
  }

  getRoomsforDropdown(branchId: any): any
  {
    let url = config.base_url_slug + 'view/rooms?sortBy=name&sortOrder=DESC&fetchType=dropdown&attributes=[{"key": "branchId","value": "' + branchId + '" }]';
    this.apiService.get(url).then(res =>
    {
      if (res.code == 200)
      {
        this.rooms = res.data;
      }
    })
  }
  getCommaSeparatedNames(items: any)
  {
    return items.map(item => item.name).join(', ');
  }
}
