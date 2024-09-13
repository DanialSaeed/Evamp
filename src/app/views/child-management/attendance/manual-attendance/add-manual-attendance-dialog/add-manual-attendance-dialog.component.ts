import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, AutocompleteFiltersService, CommunicationService } from 'src/app/services';
import { config } from 'src/config';
import * as moment from 'moment';
import { StaffAttendanceDialogComponent } from '../../staff-attendance-dialog/staff-attendance-dialog.component';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { map, startWith } from 'rxjs/operators';
import { ParentFormComponent } from 'src/app/shared/parent-form.component';
@Component({
  selector: 'app-add-manual-attendance-dialog',
  templateUrl: './add-manual-attendance-dialog.component.html',
  styleUrls: ['./add-manual-attendance-dialog.component.scss']
})
export class AddManualAttendanceDialogComponent extends ParentFormComponent implements OnInit
{
  Form: FormGroup;
  FormTwo: FormGroup;
  currentDate = new Date();
  dateValue: any;
  calendar: String = "assets/images/sdn/ic_event_24px.svg";
  title = "Attendance";
  subTitle = "";
  disableInput = false;
  attendanceType: any;
  attendanceData: any;
  id: any;
  optionSelected = false;
  activeChildrens: any[] = [];
  rooms: any[] = [];
  roomId: any;
  childId: any;
  attendanceDate: string;
  disbaledFields: boolean = false;
  sessions: any[] = [];
  disabledMore: boolean = true;
  childrens: any[] = []
  filteredChildrens: any[] = [];
  sessionTime: any;

  constructor(protected router: Router,
    protected _route: ActivatedRoute,
    protected alertService: AlertService,
    protected apiService: ApiService,
    protected formbuilder: FormBuilder,
    protected dialog: MatDialog,
    protected communicationService: CommunicationService,
    protected filterService: AutocompleteFiltersService,
    protected dialogRef: MatDialogRef<StaffAttendanceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    super(router, _route, alertService, apiService, formbuilder, dialog, communicationService);
    this.Form = this.formbuilder.group({
      'childId': new FormControl('', []),
      'childName': new FormControl('', []),
      'branchId': new FormControl(localStorage.getItem('branchId')),
      'roomId': new FormControl('', []),
      "booked_attendance": this.formbuilder.array([]),
      'attendanceId': new FormControl(null, []),
    })
    this.FormTwo = this.formbuilder.group({
      dateValue: ['']
    })
  }

  ngOnInit()
  {
    if (this.attendanceDate)
    {
      this.FormTwo.get('dateValue').setValue(this.attendanceDate)
    }
    if (this.data && this.data.event)
    {
      this.attendanceType = this.data.type;
      this.attendanceData = this.data.event.row;
      this.sessionTime = this.data.event.row.sessionTime;
      if (!this.attendanceData.Attendance || this.attendanceData?.Attendance?.length == 0)
      {
        let temp = [];
        this.FormTwo.get('dateValue').setValue(this.attendanceData.oldDate);
        temp.push({ Attendance: [this.attendanceData] })
        this.attendanceData = temp[0];
      }
      this.Form.get('childName').setValue(this.attendanceData.childName ? this.attendanceData.childName : this.attendanceData.Attendance[0].ChildName)
      this.childId = this.attendanceData.Attendance[0].childId;
      this.roomId = this.roomId ? this.roomId : this.attendanceData.Attendance[0].roomId;
      this.FormTwo.get('dateValue').setValue(this.attendanceData.oldDate ? this.attendanceData.oldDate : this.attendanceData.Attendance[0].oldDate);
      this.attendanceDate = this.attendanceData.oldDate ? this.attendanceData.oldDate : this.attendanceData.Attendance[0].oldDate;
      this.validateAttributes();
    }

    let branchId = localStorage.getItem('branchId')
    this.getChildrens(branchId);
    this.getRoomsforDropdown(branchId);
    // this.addAttendanceRow();

    // auto complete childrens dropdown filteration
    let guardian = this.Form.get('childName').valueChanges.pipe(
      startWith(''),
      map(value => this.filterService._filterChildrens(value, this.childrens))
    );
    guardian.subscribe((d) =>
    {
      this.filteredChildrens = d
    });
    //End
  }

  afterSuccessfullyAdd()
  {
    this.dialogRef.close({ 'status': 'success', 'type': 'edit' });
  }

  onCancel()
  {
    this.dialogRef.close();
  }

  onSetTime(event, control?, index?): void
  {
    if (index)
    {
      this.superCheckSignIn(event.timeInMili, control, event.controlName, index);
    } else
    {
      control.get(event.controlName).setValue(event.timeInMili);
    }
  }

  afterChildrens()
  {
    this.filteredChildrens = [...this.childrens];
    console.log("filteredChildrens", this.filteredChildrens);

  }

  onSubmit(i: any)
  {
    this.Form.get('childId').setValue(this.childId);
    this.Form.get('roomId').setValue(this.roomId);
    let TI = this.Form.controls.booked_attendance.value[i].timeIn
    if (!this.FormTwo.get('dateValue').value || TI == 0 || TI == null)
    {
      this.alertService.alertError('WARNING', 'Please fill the required data.');
      return;
    }
    let data = { ...this.Form.value };
    let adhoc_attendance = [];
    let booked_attendance = [];
    let postData = data.booked_attendance[i];
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
      data.booked_attendance[i].attendanceType = "adhoc_attendance"
      data.booked_attendance[i].createdDate = this.attendanceDate
      adhoc_attendance.push(data.booked_attendance[i])
      this.Form.addControl('adhoc_attendance', new FormControl(adhoc_attendance));
      data['adhoc_attendance'] = adhoc_attendance;
      data.booked_attendance.length = 0;
      this.disabledMore = true;
    }
    else
    {
      data.booked_attendance[i].attendanceType = "booking_attendance";
      data.booked_attendance[i].createdDate = this.attendanceDate
      booked_attendance.push(data.booked_attendance[i])
      this.Form.addControl('booked_attendance', new FormControl(booked_attendance))
      data['booked_attendance'] = booked_attendance;
      data['adhoc_attendance'] = adhoc_attendance = [];

    }

    // set time to london zone
    // if (data.booked_attendance) {
    //   data.booked_attendance.forEach(element => {
    //     element['timeIn'] = this.getUTCMilliseconds(element.timeIn);  
    //     element['timeOut'] = this.getUTCMilliseconds(element.timeOut);
    //   });
    // }

    // if (data.adhoc_attendance) {
    //   data.adhoc_attendance.forEach(element => {
    //     element['timeIn'] = this.getUTCMilliseconds(element.timeIn);  
    //     element['timeOut'] = this.getUTCMilliseconds(element.timeOut);
    //   });
    // }


    let url = config.base_url_slug;
    this.apiService.patch(url + 'update/child/take-attendance', data).then((response) =>
    {
      console.log("add api's response ", response);
      if (response.code == 201 || response.code == 200)
      {
        let msg = (response.code == 201 || response.code == 200) ? 'Attendance Added Successfully' : response.message;
        this.alertService.alertSuccess(response.status, msg).then(() =>
        {
          this.disabledMore = false;
          this.validateAttributes();
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

  changeChild(changeChild: any)
  {
    // let child = { childId: changeChild }
    this.validateAttributes();
  }

  getUTCMilliseconds(timeInMili) {
    let offset = new Date().getTimezoneOffset();
		const date = new Date(timeInMili * 1000); // Multiply by 1000 to convert seconds to milliseconds
		date.setMinutes(date.getMinutes() - offset);
		const adjustedEpochTimestamp = date.getTime() / 1000; // Divide by 1000 to convert milliseconds to seconds
    return adjustedEpochTimestamp;
  }

  changeRoom(changeRoom: any)
  {
    this.validateAttributes();
  }
  onDateChange()
  {
    this.attendanceDate = moment(new Date(this.FormTwo.get('dateValue').value)).format(config.serverDateFormat);
    // let attendanceDate = { attendanceDate: date };
    this.validateAttributes();
  }
  setDateFormat(form: FormGroup, realField, event: MatDatepickerInputEvent<Date>)
  {
    let date = form.get(realField).value;
    let currentDate = new Date();
    let selectedDate = new Date(date);

    if (moment(date).format('dddd') == 'Saturday' || moment(date).format('dddd') == 'Sunday')
    {
      form.get(realField).setValue(null);
      this.alertService.alertInfo('Warning', 'Selection not allowed on Saturday and Sunday');
      let childLogArr = this.Form.get('booked_attendance') as FormArray;
      childLogArr.clear();
      return;
    }
    this.onDateChange();
    if (form.get('dateValue').value == null)
    {
      form.get('dateValue').setValue(null);
    } else
    {
      if (currentDate < selectedDate)
      {
        form.get(realField).setValue(moment(currentDate).format(config.serverDateFormat));
      }
      else
      {
        form.get(realField).setValue(moment(new Date(event.value)).format(config.serverDateFormat));
      }
    }
  }
  validateAttributes()
  {
    if (this.FormTwo.get('dateValue').value && this.roomId && this.childId != -1)
    {
      this.getAttendances();
      this.disabledMore = false;
    }
  }
  getAttendances()
  {
    let url = `${config.base_url_slug}view/child/attendance?attributes=[{"key": "childId", "value": "${this.childId}"},{"key": "roomId", "value": "${this.roomId}"}, {"key": "attendanceDate", "value": "${this.attendanceDate}"}, {"key": "platform","value": "web" },{"key": "branchId","value": ${localStorage.getItem('branchId')} }]&page=1&perPage=100`;
    console.log(url);
    this.getSessions(url, "get")
  }
  async getSessions(url, type)
  {
    this.sessions.length = 0;
    let childLogArr = this.Form.get('booked_attendance') as FormArray;
    childLogArr.clear();
    let response = await this.apiService[type](url);
    let sessions = response.data.listing[0];

    this.sessions = sessions ? sessions.Attendance : [];
    this.sessions.forEach(element =>
    {
      if (element.attendanceType == "adhoc_attendance" && element.timeOut == 0)
      {
        this.disabledMore = true;
      }
      let endTime = element.session ? moment((element.session.endTime * 1000) + (new Date(element.session.endTime * 1000).getTimezoneOffset()*60000)).format("hh:mm A") : ''
      let startTime = element.session ? moment((element.session.startTime * 1000) + (new Date(element.session.startTime * 1000).getTimezoneOffset()*60000)).format("hh:mm A") : ''
      let sessionTime = startTime ? '(' + startTime + '-' + endTime + ')' : '';
      let session = element.session ? element.session.name : null
      let sessionId = element.session ? element.session.id : null
      let addOns = element.addOns ? element.addOns : null

      element['matTimeIn'] = element.timeIn ? (element.timeIn * 1000) + (new Date(element.timeIn * 1000).getTimezoneOffset()*60000) : null;
      element['matTimeOut'] = element.timeOut ? (element.timeOut * 1000) + (new Date(element.timeOut * 1000).getTimezoneOffset()*60000) : null;
      // this.addAttendanceRow();

      let attendanceLog = this.formbuilder.group({
        "timeIn": new FormControl(element.timeIn, [Validators.required]),
        "timeOut": new FormControl(element.timeOut, []),
        "matTimeIn": new FormControl(element.matTimeIn, [Validators.required]),
        "matTimeOut": new FormControl(element.matTimeOut, []),
        "note": new FormControl(element.note),
        "createdDate": new FormControl(null),
        "attendanceType": new FormControl(null),
        "session": new FormControl(session),
        "sessionTime": new FormControl(this.sessionTime || sessionTime),
        "addOns": new FormControl(addOns),
        "sessionId": new FormControl(sessionId),
        "previous": new FormControl(true),
        "submitted": new FormControl(element.timeIn ? true : false),
        "attendanceId": new FormControl(element.attendanceId),
        "childBookingSessionId": new FormControl(element.childBookingSessionDetailId),

      })
      if (element?.session?.id != null)
      {
        element.createdDate = this.FormTwo.get('dateValue').value
      }
      childLogArr.push(attendanceLog);
    })
    // if (this.sessions.length == 0)
    // {
    //   this.isAddMoreDisable({ disabledMore: false });
    // }
  }
  onSetTimeSignIn(event, control?, index?)
  {
    this.superCheckSignIn(event.timeInMili, control, event.controlName, index);
  }

  onSetTimeSignOut(event, control?, index?)
  {
    this.superCheckSignIn(event.timeInMili, control, event.controlName, index);
  }

  getTimeForSelectedDate(timeInMilli)
  {
    let attendanceDate = new Date(this.FormTwo.get('dateValue').value);
    let selected = new Date(timeInMilli * 1000);
    attendanceDate.setHours(selected.getHours());
    attendanceDate.setMinutes(selected.getMinutes());
    attendanceDate.setSeconds(0);
    let finalUnix = (attendanceDate.getTime() / 1000);
    console.log(finalUnix);
    return finalUnix;
  }

  superCheckSignIn(currentVal, control, controlName, rowIndex, endd?)
  {
    let selectedTime = new Date(currentVal * 1000).getMinutes() + new Date(currentVal * 1000).getHours() * 60;
    let logArr = this.Form.get('booked_attendance') as FormArray;
    let arr = logArr.value;
    let matControlName = controlName == 'timeIn' ? 'matTimeIn' : 'matTimeOut';
    arr.forEach((element, i) =>
    {
      if (element.timeIn && element.timeOut && i != rowIndex)
      {
        let start = new Date(element.timeIn * 1000).getMinutes() + new Date(element.timeIn * 1000).getHours() * 60;
        let end = new Date(element.timeOut * 1000).getMinutes() + new Date(element.timeOut * 1000).getHours() * 60;

        if ((selectedTime > start && selectedTime < end) || (selectedTime == start && selectedTime == end) || (selectedTime < start && end < endd))
        {
          this.alertService.alertError('ERROR', 'Selected time is overlapping with existing ranges').then(result =>
          {
            control.get(controlName).setValue(null);
            control.get(matControlName).setValue(null);
          })
        } else
        {
          control.get(controlName).setValue(this.getUTCMilliseconds(currentVal));
          control.get(matControlName).setValue(currentVal);
        }
      } else
      {
        control.get(controlName).setValue(this.getUTCMilliseconds(currentVal));
        control.get(matControlName).setValue(currentVal);
      }
    });
  }

  addAttendanceRow(attendanceType?)
  {
    this.disabledMore = true;
    let childLogArr = this.Form.get('booked_attendance') as FormArray;
    let attendanceLog = this.formbuilder.group({
      "timeIn": new FormControl(null, [Validators.required]),
      "timeOut": new FormControl(null, []),
      "matTimeIn": new FormControl(null, [Validators.required]),
      "matTimeOut": new FormControl(null, []),
      "note": new FormControl(null),
      "createdDate": new FormControl(null),
      "attendanceType": new FormControl(null),
      "sessionId": new FormControl(null),
      "session": new FormControl('-'),
      "addOns": new FormControl([]),
      "previous": new FormControl(false),
      "submitted": new FormControl(false),
      "sessionTime": new FormControl(""),
      "childBookingSessionId": new FormControl(null),
    })
    if (attendanceType)
    {
      attendanceLog.get('attendanceType').setValue(attendanceType);
    }
    else
    {
      attendanceLog.get('attendanceType').setValue('booking_attendance');
    }
    attendanceLog.get('createdDate').setValue(moment(new Date()).format(config.serverDateFormat));
    childLogArr.push(attendanceLog);
    // this.isAddMoreDisable(true)
  }

  get booked_attendance(): FormArray
  {
    return this.Form.get("booked_attendance") as FormArray
  }

  setRequired(selectedLog)
  {
  }

  pto()
  {
    this.optionSelected = true;
  }

  removeChildAttendance(i: number)
  {
    let logArr = this.Form.get('booked_attendance') as FormArray
    logArr.removeAt(i);
    this.disabledMore = false;
  }

  isAddMoreDisable()
  {
    let arr = this.Form.get('booked_attendance') as FormArray;
    if (arr.length == 0)
    {
      return false;
    }
    else if (arr.length != 0)
    {
      return !arr.controls[arr.controls.length - 1].get('timeIn').value;
    } else
    {
      return true;
    }
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
    // if (items.length <= 3)
    // {
    //   return items.map(item => item.name).join(', ');
    // } else
    // {
    //   const firstThreeItems = items.slice(0, 3).map(item => item.name).join(', ');
    //   return `${firstThreeItems}, ...`;
    // }
  }

  setChildId()
  {
    let child = this.childrens.find(x => x.name == this.Form.get('childName').value);
    this.Form.get('childName').setValue(child.name);
    this.Form.get('childId').setValue(child ? child.id : null);
    this.childId = child ? child.id : -1;
    this.validateAttributes();
  }

}
