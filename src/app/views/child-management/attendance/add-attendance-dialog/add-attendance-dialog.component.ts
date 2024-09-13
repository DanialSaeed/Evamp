import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, AutocompleteFiltersService, CommunicationService } from 'src/app/services';
import { StaffAttendanceDialogComponent } from '../staff-attendance-dialog/staff-attendance-dialog.component';
import { config } from 'src/config';
import { ParentFormComponent } from 'src/app/shared/parent-form.component';
import { startWith, map } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'app-add-attendance-dialog',
  templateUrl: './add-attendance-dialog.component.html',
  styleUrls: ['./add-attendance-dialog.component.scss']
})
export class AddAttendanceDialogComponent implements OnInit {

	selectedChilds = [];
	Form: FormGroup;
  attendanceLog: FormGroup;
  breakLog: FormGroup;
  currentDate = new Date();
  dateValue: any;

	calendar: String = "assets/images/sdn/ic_event_24px.svg";
	tableConfigAndProps = {};
	footerProps: any;
	childs: any;
	buttonLabel = "Update";
	title = "Attendance";
	subTitle = "";
	disableInput = false;
	attendanceType: any;
  attendanceData: any;
  id: any;
  branches: any[] = [];
  filteredBranches: any[] = [];
  staffList: any[] = [];
  filteredStaffs: any[] = [];
  optionSelected = false;

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

		// super(router, _route, alertService, apiService, formbuilder, dialog);
		// this.Form.addControl('childIds', new FormControl(3));
		// this.Form.addControl('timeIn', new FormControl('', [Validators.required]));
		// this.Form.addControl('timeOut', new FormControl('', [Validators.required]));

    this.Form = this.formbuilder.group({
      'staffId': new FormControl(null, [Validators.required]),
      'staffLabel': new FormControl('', []),
      "attendanceLogs": this.formbuilder.array([])
    })

    // this.attendanceLog = this.formbuilder.group({
    //     "timeIn": new FormControl('', []),
    //     "timeOut": new FormControl('', []),
    //     "attendanceBreaksLogs" : this.formbuilder.array([])
    // })

    // this.breakLog = this.formbuilder.group({
    //   "breakIn": new FormControl('', []),
    //   "breakOut": new FormControl('', []),
    // })




		this.footerProps = {
			'subButtonLabel': "Save Info",
			'hasSubButton': true,
			'type': 'output'
		};
	}
	
	ngOnInit()
	{
		// this.isMultiple = true;
    this.getAllStaff();
    this.getBranches();
		if (this.data)
		{
      console.log(this.attendanceData);
      console.log(this.Form.value);
      
			// this.id = this.data.event.row.id;
			// this.type = this.data.event.item.buttonLabel.toLowerCase();
			// this.subTitle = this.attendanceType == 'child' ? this.data.event.row.child.firstName+ ' ' +this.data.event.row.child.lastName : this.data.event.row.staff.firstName+ ' ' +this.data.event.row.staff.lastName;
			// this.Form.get('timeIn').setValue(this.data.event.row.timeIn);
			// this.Form.get('timeOut').setValue(this.data.event.row.timeOut);
			// this.checkType();


			// this.formApi = config.base_url_slug +'update/child/attendance/' + this.id;
			

			// if (this.attendanceType == 'staff')
			// {
			// 	this.Form.addControl('breakIn', new FormControl('', [Validators.required]));
			// 	this.Form.addControl('breakOut', new FormControl('', [Validators.required]));
			// 	this.Form.get('breakIn').setValue(this.data.event.row.breakIn);
			// 	this.Form.get('breakOut').setValue(this.data.event.row.breakOut);
			// }
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

	onSetTime(event, control?, index?): void
	{
    // let timeInMilli = this.getTimeForSelectedDate(event);
    if (index) {
      this.superCheckSignIn(event.timeInMili, control, event.controlName, index);
    } else {
      control.get(event.controlName).setValue(event.timeInMili);
    }
	}

	onSubmit()
	{

    if (!this.dateValue || this.Form.invalid) {
      this.alertService.alertError('WARNING', 'Please fill the required data.');
      return;
    }

		console.log("OnSubmit", this.Form.value);
		// super.onSubmit();
    let data = {...this.Form.value};

    //Loop for manually updating 0 index of breaklogs
    data.attendanceLogs.forEach((el)=> {

      el.staffId = this.Form.get('staffId').value;
      el.attendance = 'present';
      el.timeIn =  el.timeIn  ? this.getTimeForSelectedDate(el.timeIn) : null;
      el.timeOut = el.timeOut ? this.getTimeForSelectedDate(el.timeOut) : null;
      el.attendanceDate = moment(new Date(this.dateValue)).format(config.serverDateFormat);

       if (el.attendanceBreaksLogs.length != 0) {
        el.attendanceBreaksLogs[0].breakIn = el.breakIn ? this.getTimeForSelectedDate(el.breakIn) : null;
        el.attendanceBreaksLogs[0].breakOut = el.breakOut ? this.getTimeForSelectedDate(el.breakOut) : null;
        el.attendanceBreaksLogs[0].breakType = el.breakType;
        el.attendanceBreaksLogs[0].staffId = el.staffId;
       }

      //  if (el.attendanceBreaksLogs.length == 0 && el.breakIn && el.breakOut && el.breakType) {
      //   el.attendanceBreaksLogs.push({
      //     breakIn: el.breakIn ? this.getTimeForSelectedDate(el.breakIn) : null,
      //     breakOut: el.breakOut ? this.getTimeForSelectedDate(el.breakOut) : null,
      //     breakType: el.breakType,
      //     staffId: el.staffId,
      //   })
      //  }

       el.attendanceBreaksLogs.forEach((breakLog, i) => {
        if (i != 0) {
          breakLog.breakIn = breakLog.breakIn ? this.getTimeForSelectedDate(breakLog.breakIn) : null;
          breakLog.breakOut = breakLog.breakOut ? this.getTimeForSelectedDate(breakLog.breakOut) : null;
        }
       });
    })

    let postData = {
      staffAttendanceDaily: data.attendanceLogs
    }
    
    //End

    let url = config.base_url_slug;
    this.apiService.post( url + 'v2/add/staff-member/attendance', postData).then((response)=> {
      let msg = response.code == 201 ? 'Attendance Added Successfully' : response.message;
      this.alertService.alertSuccess(response.status, msg).then(result =>
        {
          if (response.code == 201) {
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

  onSetTimeSignIn(event, control?, breakInValue?, index?) {
    console.log(event);
    let selectedTime = new Date(event.timeInMili * 1000).getMinutes() + new Date(event.timeInMili * 1000).getHours() * 60;
    let breakInTime = new Date(breakInValue * 1000).getMinutes() + new Date(breakInValue * 1000).getHours() * 60;
    
    // let timeInMilli = this.getTimeForSelectedDate(event);
    
    if (breakInTime < selectedTime && breakInValue) {
      this.alertService.alertError('ERROR', 'Break In time cannot be before Sign In time').then(result =>{
        control.get(event.controlName).setValue(null);
      })
    } else {
      // control.get(event.controlName).setValue(event.timeInMili);
      this.superCheckSignIn(event.timeInMili, control, event.controlName, index);
    }
  }

  onSetTimeBreakIn(event, control?, signInValue?) {
    console.log(event);
    let selectedTime = new Date(event.timeInMili * 1000).getMinutes() + new Date(event.timeInMili * 1000).getHours() * 60;
    let signInTime = new Date(signInValue * 1000).getMinutes() + new Date(signInValue * 1000).getHours() * 60;

    // let timeInMilli = this.getTimeForSelectedDate(event);
    
    if (selectedTime < signInTime && signInValue) {

      // To Reset Value
      control.controls['breakIn'].setValue(event.timeInMili);
      setTimeout(()=> {
        control.controls['breakIn'].setValue(null);
      })
      // End

      this.alertService.alertError('ERROR', 'Break In time cannot be before Sign In time');
    } else {
      control.get(event.controlName).setValue(event.timeInMili);

      // If breakIn selected first time, set breaktype value to OnPremises
      if(control.get('breakType').value == null) {
        control.get('breakType').setValue('onPremises');
      }
      // End

      this.setRequired(control);
    }
  }

  onSetTimeBreakOut(event, control?, signOutValue?,index?) {
    console.log(event);
    let selectedTime = new Date(event.timeInMili * 1000).getMinutes() + new Date(event.timeInMili * 1000).getHours() * 60;
    let signOutTime = new Date(signOutValue * 1000).getMinutes() + new Date(signOutValue * 1000).getHours() * 60;

    // let timeInMilli = this.getTimeForSelectedDate(event);
    
    if (selectedTime > signOutTime && signOutValue) {

      // To Reset value
      control.get(event.controlName).setValue(event.timeInMili);
      setTimeout(()=> {
        control.controls[event.controlName].setValue(null);
      })
      // End

      this.alertService.alertError('ERROR', 'Break Out time cannot be greater than Sign Out time')
    } else {
      // control.get(event.controlName).setValue(event.timeInMili);
      this.superCheckBreak(event.timeInMili, control, event.controlName, index);
    }
  }

  onSetTimeSignOut(event, control?, breakOutValue?, index?) {
    console.log(event);
    let selectedTime = new Date(event.timeInMili * 1000).getMinutes() + new Date(event.timeInMili * 1000).getHours() * 60;
    let breakOutTime = new Date(breakOutValue * 1000).getMinutes() + new Date(breakOutValue * 1000).getHours() * 60;
    
    // let timeInMilli = this.getTimeForSelectedDate(event);
    
    if (breakOutTime > selectedTime && breakOutValue) {

      // To Reset value
      control.get(event.controlName).setValue(event.timeInMili);
      setTimeout(()=> {
        control.controls[event.controlName].setValue(null);
      })
      // End

      this.alertService.alertError('ERROR', 'Break Out time cannot be greater than Sign Out time');
    } else {
      // control.get(event.controlName).setValue(event.timeInMili);
      this.superCheckSignIn(event.timeInMili, control, event.controlName, index);
    }
  }

  getTimeForSelectedDate(timeInMilli) {
    // Setting the Date of row data for selected time

    let attendanceDate = new Date(this.dateValue);
    let selected = new Date(timeInMilli * 1000);
    attendanceDate.setHours(selected.getHours());
    attendanceDate.setMinutes(selected.getMinutes());
    attendanceDate.setSeconds(0);

    let offset = attendanceDate.getTimezoneOffset();
		const date = new Date(timeInMilli * 1000); 
		attendanceDate.setMinutes(attendanceDate.getMinutes() - offset);
		let finalUnix = attendanceDate.getTime() / 1000; 

    // let finalUnix = (attendanceDate.getTime()/1000);
    console.log(finalUnix);
    

    return finalUnix;
    // End
  }

  superCheckSignIn(currentVal, control, controlName, rowIndex, endd?) {

    let selectedTime = new Date(currentVal * 1000).getMinutes() + new Date(currentVal * 1000).getHours() * 60;

    let logArr = this.Form.get('attendanceLogs') as FormArray;
    let arr = logArr.value;
    arr.forEach((element,i) => {
      if (element.timeIn && element.timeOut && i != rowIndex) {
        let start = new Date(element.timeIn * 1000).getMinutes() + new Date(element.timeIn * 1000).getHours() * 60;
        let end = new Date(element.timeOut * 1000).getMinutes() + new Date(element.timeOut * 1000).getHours() * 60;

        if ((selectedTime > start && selectedTime < end) || (selectedTime == start && selectedTime == end) || (selectedTime < start && end < endd)) {
          this.alertService.alertError('ERROR', 'Selected time is overlapping with existing ranges').then(result =>{
            control.get(controlName).setValue(null);
          })
        } else {
          control.get(controlName).setValue(currentVal);
        }
      } else {
        control.get(controlName).setValue(currentVal);
      }
    });

  }

  superCheckBreak(currentVal, control, controlName, rowIndex, endd?) {

    let selectedTime = new Date(currentVal * 1000).getMinutes() + new Date(currentVal * 1000).getHours() * 60;

    let logArr = this.Form.get('attendanceLogs') as FormArray;
    let arr = logArr.value;
    arr.forEach((element,i) => {
      element.attendanceBreaksLogs.forEach((breakLog,j) => {

        let breakstart = new Date(breakLog.breakIn * 1000).getMinutes() + new Date(breakLog.breakIn * 1000).getHours() * 60;
        let breakend = new Date(breakLog.breakOut * 1000).getMinutes() + new Date(breakLog.breakOut * 1000).getHours() * 60;

        if (j == 0 && element.breakIn && element.breakOut && j != rowIndex) {

          // Checking for first row break
            let firstBreakIn = new Date(element.breakIn * 1000).getMinutes() + new Date(element.breakIn * 1000).getHours() * 60;
            let firstBreakOut = new Date(element.breakOut * 1000).getMinutes() + new Date(element.breakOut * 1000).getHours() * 60;
            if (element.breakIn && element.breakOut) {
              if ((selectedTime > firstBreakIn && selectedTime < firstBreakOut) || (selectedTime == breakstart && selectedTime == breakend)) {
                this.alertService.alertError('ERROR', 'Selected time is overlapping with existing ranges').then(result =>{
                  control.get(controlName).setValue(null);
                })
              } else {
                control.get(controlName).setValue(currentVal);

                // If breakIn selected first time, set breaktype value to OnPremises
                if(controlName == 'breakIn' && control.get('breakType').value == null) {
                  control.get('breakType').setValue('onPremises');
                }
                // End

                this.setRequired(control);
              }
            }

        }  
        else if (breakLog.breakIn && breakLog.breakOut && j != rowIndex) {
          if ((selectedTime > breakstart && selectedTime < breakend) || (selectedTime == breakstart && selectedTime == breakend) || (selectedTime < breakstart && breakend < endd)) {
            this.alertService.alertError('ERROR', 'Selected time is overlapping with existing ranges').then(result =>{
              control.get(controlName).setValue(null);
            })
          } 
          else {
            control.get(controlName).setValue(currentVal);

            // If breakIn selected first time, set breaktype value to OnPremises
            if(controlName == 'breakIn' && control.get('breakType').value == null) {
              control.get('breakType').setValue('onPremises');
            }
            // End

          }
        }
        else {
          if (j == 0) {
            this.setRequired(control);
          }
          control.get(controlName).setValue(currentVal);
        }
        
      });
    });

  }

  // superCheckSignOut(currentVal, control, controlName, rowIndex, endd?) {

  //   let selectedTime = new Date(currentVal * 1000).getMinutes() + new Date(currentVal * 1000).getHours() * 60;

  //   let logArr = this.Form.get('attendanceLogs') as FormArray;
  //   let arr = logArr.value;
  //   arr.forEach((element,i) => {
  //     if (element.timeIn && element.timeOut && i != rowIndex) {
  //       let start = new Date(element.timeIn * 1000).getMinutes() + new Date(element.timeIn * 1000).getHours() * 60;
  //       let end = new Date(element.timeOut * 1000).getMinutes() + new Date(element.timeOut * 1000).getHours() * 60;

  //       if ((selectedTime > start && selectedTime < end) || (selectedTime == start && selectedTime == end) || (selectedTime < start && end < endd)) {
  //         this.alertService.alertError('ERROR', 'Selected time is overlapping with existing ranges').then(result =>{
  //           control.get(controlName).setValue(null);
  //         })
  //       } else {
  //         control.get(controlName).setValue(currentVal);
  //       }
  //     } else {
  //       control.get(controlName).setValue(currentVal);
  //     }
  //   });

  // }

  addAttendanceRow() {

    this.filteredBranches = [...this.branches];
    // Adding logs in Array
    let logArr = this.Form.get('attendanceLogs') as FormArray;
    let staffId = this.Form.get('staffId').value;
    let newLog =  this.formbuilder.group({
          "timeIn": new FormControl(null, [Validators.required]),
          "timeOut": new FormControl(null, []),

          "staffId": new FormControl(staffId),
          "branchId": new FormControl(null, [Validators.required]),
          "breakIn": new FormControl(null, []),
          "breakOut": new FormControl(null, []),
          "breakType": new FormControl(null, []),
          'filteredBranches':  new FormControl(null),
          'branchLabel':  new FormControl(null),
          'attendance':  new FormControl('present'),
          'attendanceDate': new FormControl(null),
          "attendanceBreaksLogs" : this.formbuilder.array([]) 
    })

    // Setting branches for autocomplete  
    let branch = newLog.get('branchLabel').valueChanges.pipe(
        startWith(''),
        map(value => this.filterService._filterBranches(value, [...this.branches]))
    );
    newLog.get('filteredBranches').setValue(this.filteredBranches)
    branch.subscribe((d)=> newLog.get('filteredBranches').setValue(d));

    // Setting current branchId in first row branch
    if (logArr.length == 0) {
      let branchName = this.branches.find(x => x.value == Number(localStorage.getItem('branchId')))
      newLog.get('branchId').setValue(Number(localStorage.getItem('branchId')));
      newLog.get('branchLabel').setValue(branchName.label);
    }
      
    //Adding breaks in Array
    let breakArr = newLog.get('attendanceBreaksLogs') as FormArray;
    let newBreak = this.formbuilder.group({
        "breakIn": new FormControl(null),
        "breakOut": new FormControl(null),
        "breakType": new FormControl(null),
        "staffId": new FormControl(staffId),
    });

    breakArr.push(newBreak);

    logArr.push(newLog);

    // this.Form.controls['guardianDetails']['controls'].forEach((element, index) =>{
    //     // Populate autcomplete data for language
    //     let language = element.controls.branchLabel.valueChanges.pipe(
    //         startWith(''),
    //         map(value => this.filterService._filterLanguage(value, [...this.firstLanguages]))
    //     );
    //     element.controls.filteredLanguage.setValue(this.filteredLanguages)
    //     language.subscribe((d)=> element.controls.filteredLanguage.setValue(d));
    //     // End
    // })
  }

  addAnotherBreak(logIndex) {
    let logArr = this.Form.get('attendanceLogs') as FormArray;
    let selectedLog = logArr.controls[logIndex];
    let breakArr = selectedLog.get('attendanceBreaksLogs') as FormArray;
    let staffId = this.Form.get('staffId').value;
    
    let newBreak = this.formbuilder.group({
      "breakIn": new FormControl(null, []),
      "breakOut": new FormControl(null, []),
      "breakType": new FormControl(null, []),
      "staffId": new FormControl(staffId, []),
    })

    // selectedLog.get('breakIn').setValidators([Validators.required]);
    // selectedLog.get('breakOut').setValidators([Validators.required]);
    // selectedLog.get('breakIn').updateValueAndValidity();
    // selectedLog.get('breakOut').updateValueAndValidity();


    breakArr.push(newBreak);

    // selectedLog.get('attendanceBreaksLogs').setValue(breakArr.value);
  }

  getBranches(newUrl?: any): any
	{
		let data = [];
		let url = config.base_url_slug +'view/branches?sortBy=name&sortOrder=ASC&attributes=[{"key": "status","value": "1" }]&fetchType=dropdown';
		if (newUrl)
		{
			url = url + newUrl;
		}
		this.apiService.get(url).then(res =>
		{
			if (res.code == 200)
			{
				let outerIndex = 0;
				res.data.forEach((element, index) =>
				{
						let dict = {
							key: 'branchId',
							value: element.id,
							label: element.name,
						}
						data.push(dict);
				});

				this.branches = data;

        // Now create the row after getting branches
        this.addAttendanceRow();
        // End
			}
			else
			{
				this.branches = [];
			}
		});
	}

  getAllStaff() {
    let branchId = localStorage.getItem('branchId');
		let url = config.base_url_slug + `view/staff-members/all?&sortBy=firstName&sortOrder=DESC&attributes=[{"key": "status","value": "1" },{"key": "branchId","value": "${branchId}" }]`;

		this.apiService.get(url).then(res => {
			if (res.code == 200)
			{
				this.staffList = res.data.listing;

        this.staffList.forEach((staff)=> {
          staff['name'] = staff.firstName + ' ' + (staff.lastName ? staff.lastName : '');
        });

        this.filteredStaffs = [...this.staffList]

        // Populate autcomplete data for nationality
        let staff = this.Form.get('staffLabel').valueChanges.pipe(
          startWith(''),
          map(value => this.filterService._filterStaff(value, this.staffList))
        );
        staff.subscribe((d)=> this.filteredStaffs =  d);
      // End
			}
		});
  }

  setStaffId() {

    // If staff value changes, reset the form.
    // if (this.Form.get('staffId').value && this.dateValue) {
    //   this.Form.get('attendanceLogs').reset();
    // }
    // End

    let staff = this.staffList.find(x => x.name == this.Form.get('staffLabel').value);
		this.Form.get('staffId').setValue(staff ? staff.id : null);
  }

  setBranchId(form) {
		let branch = this.branches.find(x => x.label == form.get('branchLabel').value);
		form.get('branchId').setValue(branch ? branch.value : null);
	}

  onDateChange() {

    // If staff value changes, reset the form.
    // if (this.Form.get('staffId').value) {
    //   this.Form.get('attendanceLogs').reset();
    // }
    // End

  }

  get attendancelogs() : FormArray {
    return this.Form.get("attendanceLogs") as FormArray
  }

  onSetTimeBreak(event, control?, index?) {

    // let timeInMilli = this.getTimeForSelectedDate(event);
    if (index) {
      this.superCheckBreak(event.timeInMili, control, event.controlName, index);
    } else {
      control.get(event.controlName).setValue(event.timeInMili);
    }
  }

  setRequired(selectedLog) {
    // selectedLog.controls['breakIn'].setValidators([Validators.required]);
    // selectedLog.controls['breakOut'].setValidators([Validators.required]);
    // selectedLog.controls['breakType'].setValidators([Validators.required]);
    // selectedLog.controls['breakIn'].updateValueAndValidity();
    // selectedLog.controls['breakOut'].updateValueAndValidity();
    // selectedLog.controls['breakType'].updateValueAndValidity();
  }

  onStaffFieldFocusOut() {
    let existingStaff = this.staffList.find(x => x.name == this.Form.get('staffLabel').value);
    if (!existingStaff) {
      this.Form.get('staffLabel').setValue(null);
      this.Form.get('staffId').setValue(null);
      this.optionSelected = false;
    } 
  }

  pto() {
    this.optionSelected = true;
  }

  resetBreakType(control) {
    control.get('breakType').setValue(null);
    control.get('breakIn').setValue(null);
    control.get('breakOut').setValue(null);
  }

  removeAttendance(i:number) {
    let logArr = this.Form.get('attendanceLogs') as FormArray
    logArr.removeAt(i);
  }

  removeBreak(i:number, log) {
    let breakArr = log.get('attendanceBreaksLogs') as FormArray
    breakArr.removeAt(i);
  }

  isAddMoreDisable() {
    
      let arr = this.Form.get('attendanceLogs') as FormArray;
      if (arr.length != 0) {
        return !arr.controls[0].get('timeIn').value || !arr.controls[0].get('timeOut').value;
      } else {
        return true;
      }
  }

}
