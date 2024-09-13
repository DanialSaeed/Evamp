import { Component, Inject, OnInit, } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, CommunicationService } from 'src/app/services';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { config } from 'src/config';
@Component({
  selector: 'app-staff-attendance-dialog',
  templateUrl: './staff-attendance-dialog.component.html',
  styleUrls: ['./staff-attendance-dialog.component.scss']
})
export class StaffAttendanceDialogComponent implements OnInit
{
	Form: FormGroup;
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

	constructor(protected router: Router,
		protected _route: ActivatedRoute,
		protected alertService: AlertService,
		protected apiService: ApiService,
		protected formbuilder: FormBuilder,
		protected dialog: MatDialog,
		protected communicationService: CommunicationService,
		protected dialogRef: MatDialogRef<StaffAttendanceDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any)
	{

		// super(router, _route, alertService, apiService, formbuilder, dialog);

    this.Form = this.formbuilder.group({
      "attendanceLogs": this.formbuilder.array([])
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

      // console.log(this.attendanceData);

      this.attendanceData.staffAttendanceLog.forEach((log)=> {

        log['matTimeIn'] = (log.matTimeIn / 1000);
        log['matTimeOut'] = (log.matTimeOut / 1000);
        // Adding logs in Array
        let logArr = this.Form.get('attendanceLogs') as FormArray;
        let newLog =  this.formbuilder.group({
              "timeIn": new FormControl('', []),
              "timeOut": new FormControl('', []),
              "matTimeIn": new FormControl('', []),
              "matTimeOut": new FormControl('', []),
              "staffId": new FormControl('', []),
              // "staffBranchId": new FormControl('', []),
              "id": new FormControl('', []),
              "branch": new FormControl('', []),
              "breakIn": new FormControl('', []),
              "breakOut": new FormControl('', []),
              "matBreakIn": new FormControl('', []),
              "matBreakOut": new FormControl('', []),
              "breakType": new FormControl('', []),
              "attendanceBreaksLogs" : this.formbuilder.array([]) 
        })
        newLog.patchValue(log)
        // newLog.get('staffBranchId').setValue(this.attendanceData?.staff?.branchId);

        //Setting value of breaklogs for first Row
        let breakInValue = log.staffAttendanceBreaksLog.length != 0 ? log.staffAttendanceBreaksLog[0].breakIn : null;
        let breakOutValue = log.staffAttendanceBreaksLog.length != 0 ? log.staffAttendanceBreaksLog[0].breakOut : null;
        let matBreakInValue = log.staffAttendanceBreaksLog.length != 0 ? log.staffAttendanceBreaksLog[0].matBreakIn : null;
        let matBreakOutValue = log.staffAttendanceBreaksLog.length != 0 ? log.staffAttendanceBreaksLog[0].matBreakOut : null;
        let breakTypeValue = log.staffAttendanceBreaksLog.length != 0 ? log.staffAttendanceBreaksLog[0].breakType : null;
        newLog.get('breakIn').setValue(breakInValue);
        newLog.get('breakOut').setValue(breakOutValue);
        newLog.get('matBreakIn').setValue(matBreakInValue/1000);
        newLog.get('matBreakOut').setValue(matBreakOutValue/1000);
        newLog.get('breakType').setValue(breakTypeValue);
        //End

        //Adding breaks in Array
        log.staffAttendanceBreaksLog.forEach((logBreak,i) => {
          logBreak['matBreakIn'] = (logBreak.matBreakIn / 1000);
          logBreak['matBreakOut'] = (logBreak.matBreakOut / 1000);
          let breakArr = newLog.get('attendanceBreaksLogs') as FormArray;
          let newBreak = this.formbuilder.group({
                "breakIn": new FormControl('', []),
                "breakOut": new FormControl('', []),
                "matBreakIn": new FormControl('', []),
                "matBreakOut": new FormControl('', []),
                "breakType": new FormControl('', []),
                "staffId": new FormControl('', []),
                "id": new FormControl('', []),
          })
          newBreak.patchValue(logBreak);

          breakArr.push(newBreak);
        });

        logArr.push(newLog);
        console.log(this.attendancelogs);
        

      });

      console.log(this.attendanceData);

			this.subTitle = this.attendanceType == 'child' ? this.data.event.row.child.firstName+ ' ' +this.data.event.row.child.lastName : this.data.event.row.staff.firstName+ ' ' +this.data.event.row.staff.lastName;

			if (this.attendanceType == 'staff')
			{
				this.Form.addControl('breakIn', new FormControl('', [Validators.required]));
				this.Form.addControl('breakOut', new FormControl('', [Validators.required]));
        this.Form.addControl('matBreakIn', new FormControl('', [Validators.required]));
				this.Form.addControl('matBreakOut', new FormControl('', [Validators.required]));
				this.Form.get('breakIn').setValue(this.data.event.row.breakIn);
				this.Form.get('breakOut').setValue(this.data.event.row.breakOut);
        this.Form.get('matBreakIn').setValue(this.data.event.row.matBreakIn);
				this.Form.get('matBreakOut').setValue(this.data.event.row.matBreakOut);
			}
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

	onSetTime(event, control?, matControlName?): void
	{
    let timeInMilli = this.getTimeForSelectedDate(event);

    control.get(matControlName).setValue(event.timeInMili);
		control.get(event.controlName).setValue(timeInMilli);
	}

	onSubmit()
	{
    let data = this.Form.value;

    // Loop for manually updating 0 index of breaklogs
    data.attendanceLogs.forEach((el)=> {
       if (el.attendanceBreaksLogs.length != 0) {
        el.attendanceBreaksLogs[0].breakIn = el.breakIn;
        el.attendanceBreaksLogs[0].breakOut = el.breakOut;
        el.attendanceBreaksLogs[0].breakType = el.breakType;
       }

       if (el.attendanceBreaksLogs.length == 0 && el.breakIn && el.breakOut && el.breakType) {
        el.attendanceBreaksLogs.push({
          breakIn: el.breakIn,
          breakOut: el.breakOut,
          breakType: el.breakType,
          staffId: el.staffId,
          attendanceLogId: el.id
        })
       }
    })
    // End

    let url = config.base_url_slug;
    this.apiService.patch( url + 'v2/update/staff-member/attendance/' + this.id, this.Form.value).then((response)=> {
      this.alertService.alertSuccess(response.status, response.message).then(result =>
        {
          if (response.code == 200 || response.code == 201) {
            this.afterSuccessfullyAdd();    
          }    
        });
    })
	}

  goToView() {
    this.router.navigate([`main/staff-attendance-detail/${this.data?.event?.row?.staffId}/staff`]);
    localStorage.setItem('AttendanceDate', this.attendanceData.createdTime);
    this.onCancel();
  }

  onSetTimeBreakOut(event, control?, signOutValue?, matControlName?) {
    console.log(event);
    // let selectedTime = new Date(event.timeInMili * 1000).getMinutes() + new Date(event.timeInMili * 1000).getHours() * 60;
    // let signOutTime = new Date(signOutValue * 1000).getMinutes() + new Date(signOutValue * 1000).getHours() * 60;
    // let z = x - y;

    let timeInMilli = this.getTimeForSelectedDate(event);
    // let selectedTime = new Date(timeInMilli * 1000);
    // let signOutTime = new Date(signOutValue * 1000);
    
    if (event.timeInMili > signOutValue && signOutValue) {
      this.alertService.alertError('ERROR', 'Break Out time cannot be greater than Sign Out time').then(result =>{
        control.get(event.controlName).setValue(null);
        control.get(matControlName).setValue(null);
      })
    } else {
      control.get(event.controlName).setValue(timeInMilli);
      control.get(matControlName).setValue(event.timeInMili);
    }
  }

  onSetTimeSignOut(event, control?, breakOutValue?, matControlName?) {
    console.log(event);
    
    let timeInMilli = this.getTimeForSelectedDate(event);

    // let selectedTime = new Date(event.timeInMili * 1000).getMinutes() + new Date(event.timeInMili * 1000).getHours() * 60;
    // let breakOutTime = new Date(breakOutValue * 1000).getMinutes() + new Date(breakOutValue).getHours() * 60;
    
    
    if (breakOutValue > event.timeInMili && breakOutValue) {
      this.alertService.alertError('ERROR', 'Break Out time cannot be greater than Sign Out time').then(result =>{
        control.get(event.controlName).setValue(null);
        control.get(matControlName).setValue(null);
      })
    } else {
      control.get(event.controlName).setValue(timeInMilli);
      control.get(matControlName).setValue(event.timeInMili);
    }
  }

  getTimeForSelectedDate(event) {

    // Setting the Date of row data for selected time
    let attendanceDate = new Date(this.attendanceData.createdTime * 1000);
    let selected = new Date(event.timeInMili * 1000);
    attendanceDate.setHours(selected.getHours());
    attendanceDate.setMinutes(selected.getMinutes());
    attendanceDate.setSeconds(0);

    let offset = attendanceDate.getTimezoneOffset();
		const date = new Date(event.timeInMili * 1000); 
		attendanceDate.setMinutes(attendanceDate.getMinutes() - offset);
		let finalUnix = attendanceDate.getTime() / 1000; 

    // let finalUnix = (attendanceDate.getTime()/1000);
    console.log(finalUnix);
    

    return finalUnix;
    // End
  }

  get attendancelogs() : FormArray {
    return this.Form.get("attendanceLogs") as FormArray
  }

}
