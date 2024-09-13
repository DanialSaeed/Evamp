import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { formatDate } from '@angular/common';
import { config } from 'src/config';
import * as moment from 'moment';
import { Form, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, CommunicationService, LoaderService, PermissionService } from 'src/app/services';
import { Subscription } from 'rxjs';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: any[] = [
  {day: 1, room: 'Hydrogen', session: 1.0079, startTime: '', endTime: '', occupancy: ''},
];

@Component({
  selector: 'app-multiple-booking-detail',
  templateUrl: './multiple-booking-detail.component.html',
  styleUrls: ['./multiple-booking-detail.component.scss']
})
export class MultipleBookingDetailComponent extends GlobalFormComponent implements OnInit {

  displayedColumns: string[] = ['day', 'room', 'session', 'startTime', 'endTime', 'occupancy', 'deleteAction'];
  dataSource: any;
  branchId = localStorage.getItem('branchId');
  // Custom Calendar Variables
  year: number;
  month: number;
  selectedDates: Date[] = [];
  weeks: Date[][] = [];
  currentDate: Date = new Date();
  monthLabel: string = '';
  selectedRoom: any;

  // Component Variables
  @Input() data: any;
  @Input() bookingDatafromInvoice: any = null;
  @Input() isPopup = false;
  @Input() formGroup: any;
  @Input() mode: any;
  @Input() sessionDetailArr: any;
  @Input() defaultRoomId: any;
  @Output() advanceDialog = new EventEmitter<any>();
  
  childName: string = 'John Doe';
  ageYear = 0;
  ageMonth = 0;
  isAttendancePopup = false;
  minStart = null;
  futureDate1: string;
  futureDate2: string;
  sessions: any;
  tempSessions = [];
  responseSlots = [];
  sessionList = [];
  compareAbleSessionDetails: any;
  sub2: Subscription;
  hasBeenCalled : boolean= false;



  constructor(protected router: Router,
    protected _route: ActivatedRoute,
    protected alertService: AlertService,
    protected apiService: ApiService,
    protected formbuilder: FormBuilder,
    protected dialog: MatDialog,
    protected loader: LoaderService,
    protected permissionService: PermissionService,
    protected communicationService : CommunicationService) {

    super(router, _route, alertService, apiService, formbuilder, dialog, permissionService);
    
    this.Form.addControl('id', new FormControl(null));
    this.Form.addControl('branchName', new FormControl(null));
    this.Form.addControl('roomId', new FormControl(null));
    this.Form.addControl('childId', new FormControl(null, [Validators.required]));
    this.Form.addControl('childBookingDetail', new FormControl(null, [Validators.required]));
    this.Form.addControl('sessionDetail', new FormArray([]));

    this.year = new Date().getFullYear();
    this.month= new Date().getMonth();
   }

  ngOnInit(): void {
    this.generateCalendar();
    this.updateMonthLabel();
    this.getRoomsforDropdown(this.branchId);
    this.getSessions(this.branchId);
    this.compareAbleSessionDetails = this.sessionDetailArr.value;

    this.sub2 = this.sessionDetailArr.valueChanges.subscribe((val) => {

      const areArraysEqual = this.areFormArraysEqual(
        this.compareAbleSessionDetails,
        this.sessionDetailArr.value
      );

      if (!areArraysEqual) {
        this.communicationService.unSavedForm.next(true);
      } else {
        this.communicationService.unSavedForm.next(false);
      }
    });

  }

  ngOnChanges() {
    if (this.sessionDetailArr.value.length != 0) {
      // this.selectedDates =  this.sessionDetailArr.value.map(x => new Date(x.sessionDate));

      // this.sessionDetailArr.controls.forEach(session => {
      //   this.getDayOccupancy(session, session.controls['day'].value, session.controls['roomId'].value); 
      // });
      this.tempSessions = [...this.sessionDetailArr.value];
      this.getOccupancyListAndPopulateTable();


      if (this.mode == 'view') {
        this.sessionDetailArr.controls.forEach(session => {
          session.disable();
          session.get('disable').setValue(true); 
        });
      } else {
        this.sessionDetailArr.controls.forEach(session => {
          session.enable(); 
          session.get('disable').setValue(false);
        });
      }

      console.log(this.sessionDetailArr);
      
      // this.dataSource = new MatTableDataSource(this.sessionDetailArr.value);
    }
    console.log(this.defaultRoomId);
    console.log(this.sessionDetailArr);
    if (!this.hasBeenCalled) {
      // Set initial form on patch
      this.compareAbleSessionDetails = this.sessionDetailArr.value;
      // Check form states once after patch
      const areArraysEqual = this.areFormArraysEqual(
        this.compareAbleSessionDetails,
        this.sessionDetailArr.value
      );

      if (!areArraysEqual) {
        this.communicationService.unSavedForm.next(true);
      } else {
        this.communicationService.unSavedForm.next(false);
      }
    }

  }

  getSlotList(session) {
    let slot = this.responseSlots.find(x=> x.roomId == session.roomId && x.day == session.day);
    if (slot) {
      return slot.slots
    } else {
      return [];
    }
  }



toggleDateSelection(date: Date) {

  if (this.mode == 'view' || this.mode == 'view-logs') {
    return;
  }

  if (moment(date).format('dddd') == 'Saturday' || moment(date).format('dddd') == 'Sunday') {
   // this.alertService.alertInfo('Warning', 'Selection not allowed on Saturday and Sunday');
    return;
  }

  const index = this.selectedDates.findIndex(d => this.isSameDay(d, date));

  if (index >= 0) {
    this.selectedDates.splice(index, 1);
    // this.sessionDetailArr.removeAt(index);
    // this.dataSource = new MatTableDataSource(this.sessionDetailArr.value);

    return
  } 

  this.selectedDates.push(date);
  // this.selectDayForSession(date);

}

isDateSelected(date: Date): boolean {
  return this.selectedDates.some(d => this.isSameDay(d, date));
}

isToday(date: Date): boolean {
  const today = new Date();
  return this.isSameDay(today, date);
}

isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear()
    && date1.getMonth() === date2.getMonth()
    && date1.getDate() === date2.getDate();
}

  navigateMonth(type) {

    if (type == 'next') {
      let nextMonth = moment(this.currentDate).add(1, 'months');
      this.currentDate = nextMonth.toDate();
      // this.month += 1;
    } else {
      let prevMonth = moment(this.currentDate).subtract(1, 'months');
      this.currentDate = prevMonth.toDate();
      // this.month -= 1;
    }
    console.log(this.month);
    

    this.updateMonthLabel();
    this.generateCalendar();

  }

  navigateYear(type) {
    if (type == 'next') {
      this.currentDate.setFullYear(this.year + 1, this.currentDate.getMonth());
      this.year += 1;
    } else {
      this.currentDate.setFullYear(this.year - 1, this.currentDate.getMonth());
      this.year -= 1;
    }

    this.updateMonthLabel();
    this.generateCalendar();
  }

  isCurrentMonth(date) {
    return date.getMonth() != this.currentDate.getMonth() || (moment(date).format('dddd') == 'Saturday' || moment(date).format('dddd') == 'Sunday');
  }

  updateMonthLabel(): void {
    const startOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const endOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    this.monthLabel = `${formatDate(startOfMonth, 'dd', 'en')} ${formatDate(startOfMonth, 'MMM', 'en')} - ${formatDate(endOfMonth, 'dd', 'en')} ${formatDate(endOfMonth, 'MMM', 'en')}`;
  }

  private generateCalendar(): void {
    this.weeks = [];

    const firstDayOfMonth = new Date(this.year, this.currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(this.year, this.currentDate.getMonth() + 1, 0);
    // const daysInMonth = lastDayOfMonth.getDate();

    let currentDay = new Date(firstDayOfMonth);
    currentDay.setDate(currentDay.getDate() - currentDay.getDay() + 1); // start with the previous Monday

    while (currentDay <= lastDayOfMonth) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(currentDay));
        currentDay.setDate(currentDay.getDate() + 1);
      }
      this.weeks.push(week);
    }
    console.log(this.weeks);
    
  }

  getOccupencyColor(slot, roomId)
  {
    let color = 'hour-box-disabled';
    let room = this.rooms.find(x => x.value == roomId);
    if (room) {
      if (slot.occupiedCapacity >= room.totalCapacity)
      {
        //available 0
        color = 'hour-box-not-available';
      }
      if ((slot.occupiedCapacity < room.totalCapacity) && (slot.occupiedCapacity > room.totalCapacity / 2))
      {
        // available 1 to 49
        color = 'hour-box-limited';
      }
      if (slot.occupiedCapacity <= room.totalCapacity / 2)
      {
        // available > 50
        color = 'hour-box-available';
      }
    }

    return color;
  }

  getTimeWithStaticDate(timeInSec)
  {
    // let currentDate = new Date(config.staticDateForTime);
    let currentDate = new Date();

    let currentDay = currentDate.getDate();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    let tm = new Date(timeInSec * 1000);
    tm.setSeconds(0);
    tm.setDate(currentDay);
    tm.setMonth(currentMonth);
    tm.setFullYear(currentYear);

    return tm.getTime() / 1000; //return in sec
  }

  selectDayForSession(date) {
    let day = moment(date).format('dddd').toLowerCase();

    // if (this.isDateSelected(date)) {
    //   this.sessionDetailArr.value.forEach((element, index) => {
    //     if (moment(date).format(config.serverDateFormat) == element.sessionDate) {
    //        this.sessionDetailArr.removeAt(index);
    //        this.selectedDates.splice(this.selectedDates.indexOf(date),1);
    //     }
    //   });

    //   return;
    // }

    let session = this.formbuilder.group({
      "day": day,
      "sessionDate": moment(date).format(config.serverDateFormat),
      "startTime": new FormControl(null, [Validators.required]),
      "endTime": new FormControl(null, [Validators.required]),
      "matStartTime": new FormControl(null, [Validators.required]),
      "matEndTime": new FormControl(null, [Validators.required]),
      "sessionId": new FormControl(null, [Validators.required]),
      "disable": new FormControl(false),
      "category": new FormControl(null),
      "roomId": new FormControl(this.defaultRoomId),
      "slots": new FormControl([]),
      "addOnsIds": new FormControl([]),
      "allowFunding": new FormControl('yes'),
      "allowDiscount": new FormControl('yes')
    });

    // let sessionDetailArr: any = this.Form.get('sessionDetail') as FormArray;
    this.sessionDetailArr.push(session);
    this.tempSessions.push(session.value);
    // this.getDayOccupancy(session, session.controls['day'].value, session.controls['roomId'].value);
    // this.dataSource = new MatTableDataSource(this.sessionDetailArr.value);


  }

  ins(d) {
    console.log(d);
    
  }

  // get sessionDetailArr() {
  //   return this.Form.get('sessionDetail') as FormArray;
  // }

  getTooltip(slot, roomId)
  {
    let room = this.rooms.find(x => x.value == roomId);
    if (room) {
      let st = slot.startTime ? moment((slot.startTime * 1000) + (new Date(slot.startTime * 1000).getTimezoneOffset()*60000)).format(config.cmsTimeFormat) : null;
      let et = slot.endTime ? moment((slot.endTime * 1000) + (new Date(slot.endTime * 1000).getTimezoneOffset()*60000)).format(config.cmsTimeFormat) : null;

      return st + " to " + et + " - " + slot.occupiedCapacity + "/" + room.totalCapacity;
    }
  }

  getInputControl(index: number, controlName: string): FormControl {
    return this.sessionDetailArr.controls[index][controlName] as FormControl;
  }

  onSetTime(event, idx): void
	{
		console.log("onSetTime", event, idx);

    let offset = new Date().getTimezoneOffset();
		const startTime = new Date(event.startTime * 1000); // Multiply by 1000 to convert seconds to milliseconds
    const endTime = new Date(event.endTime * 1000); // Multiply by 1000 to convert seconds to milliseconds
		startTime.setMinutes(startTime.getMinutes() - offset);
    endTime.setMinutes(endTime.getMinutes() - offset);
		const startTimeAdjusted = startTime.getTime() / 1000; // Divide by 1000 to convert milliseconds to seconds
    const endTimeAdjusted = endTime.getTime() / 1000; // Divide by 1000 to convert milliseconds to seconds

    this.sessionDetailArr.controls[idx].get('startTime').setValue(startTimeAdjusted);
    this.sessionDetailArr.controls[idx].get('endTime').setValue(endTimeAdjusted);
    this.sessionDetailArr.controls[idx].get('matStartTime').setValue(event.startTime);
    this.sessionDetailArr.controls[idx].get('matEndTime').setValue(event.endTime);
    // this.dataSource = new MatTableDataSource(this.sessionDetailArr.value);
    this.sessionList = this.sessionDetailArr.value;

    console.log("this.sessionList",this.sessionList);
    
	}

  getSessions(branchId: any): any
  {
    let url = config.base_url_slug + 'view/sessions?sortBy=name&sortOrder=DESC&fetchType=dropdown&attributes=[{"key": "branchId","value": "' + branchId + '" }]';

    this.apiService.get(url).then(res =>
    {
      if (res.code == 200)
      {
        this.sessions = res.data;
      }
      else
      {
        this.sessions = [];
      }
    });
  }

  onSessionChange(event, index)
  {
    var result = this.sessions.filter(obj =>
    {
      return obj.id === event.value
    });

    if (result)
    {
      this.sessionDetailArr.controls[index].controls['category'].setValue(result[0].category);
    }

    if (result && result['category'] != 'hourly')
    {
      let start = result[0].startTime ? (result[0].startTime * 1000) + (new Date(result[0].startTime * 1000).getTimezoneOffset()*60000) : 0;
      let end = result[0].endTime ? (result[0].endTime * 1000) + (new Date(result[0].endTime * 1000).getTimezoneOffset()*60000) : 0;

      this.sessionDetailArr.controls[index].controls['startTime'].setValue(result[0].startTime);
      this.sessionDetailArr.controls[index].controls['endTime'].setValue(result[0].endTime);
      this.sessionDetailArr.controls[index].controls['matStartTime'].setValue(start ? start/1000 : 0);
      this.sessionDetailArr.controls[index].controls['matEndTime'].setValue(end ? end/1000 : 0);
    }
    // this.dataSource = new MatTableDataSource(this.sessionDetailArr.value);
    this.sessionList = this.sessionDetailArr.value;

    if (JSON.stringify(this.compareAbleSessionDetails) != JSON.stringify(this.sessionDetailArr.value)) {
      this.hasBeenCalled = true;
    } else {
      this.hasBeenCalled = false;
    }
    
  }

  check() {
    console.log(this.Form);
    
  }

  onRoomChange(event,element)
  { 
    this.selectedRoom = this.rooms.find(rm => rm.value === event.value);
    let existingSlot = this.responseSlots.find(x=> x.roomId == event.value && x.day == element.day);
    if (!existingSlot) {
        this.getDayOccupancy(element, element.day, event.value);
    }
    this.sessionList = this.sessionDetailArr.value;
    // this.formGroup.controls['sessionDetail']['controls'].forEach(element =>
    // {
    //   if (!element.controls['disable'].value)
    //   {
    //     this.getDayOccupancy(element, element.controls['day'].value, element.controls['roomId'].value);
    //   }
    // });
    if (JSON.stringify(this.compareAbleSessionDetails) != JSON.stringify(this.sessionDetailArr.value)) {
      this.hasBeenCalled = true;
    } else {
      this.hasBeenCalled = false;
    }
  }

  getDayOccupancy(Form, day: String, roomId): void
  {
    // console.log("getDayOccupancy ",Form.value , day)
    let url = config.base_url_slug + 'view/room/' + roomId + '/per-day-per-hour-occupancy?sortOrder=ASC&attributes=[{"key":"day","value":"' + day + '"}]';
    this.apiService.get(url).then(result =>
    {
      if (result.code === 200 && result.data)
      {
        // Form.controls['slots'].setValue(result.data.listing);
        let slots = result.data.listing;
        slots.forEach(element => {
          element['startTime'] = (element.startTime * 1000) + (new Date(element.startTime * 1000).getTimezoneOffset()*60000);
          element['endTime'] = (element.endTime * 1000) + (new Date(element.endTime * 1000).getTimezoneOffset()*60000); 
        });
        this.responseSlots.push({roomId: slots[0].roomId, day: slots[0].day, slots: slots});
        // this.dataSource = new MatTableDataSource(this.sessionDetailArr.value);
        this.sessionList = this.sessionDetailArr.value;
      }
      else
      {
        Form.controls['slots'].setValue([]);
      }
    });
  }

  setChildAge() {
    // Find Age of child

    let dob = !this.type ? this.data.dateOfBirth : this.type == 'new' ? this.data.dateOfBirth : this.formDetail.child.dateOfBirth;

    let a = moment(dob);
    let b = moment();

    this.ageYear = b.diff(a, 'year');

    let months = b.diff(a, 'months');

    this.ageMonth = months - (this.ageYear * 12);

    // End

   // Find birthday of next two years

    let year1Addition;
    let year2Addition;
    let tempDateformat = moment(new Date(dob)).format(config.cmsDateFormat);
    let currentDate = moment().format(config.cmsDateFormat);

    if (new Date(currentDate.split('/')[2]+'-'+ tempDateformat.split('/')[1] + '-' + tempDateformat.split('/')[0]) > new Date()) {
      year1Addition = 0;
      year2Addition = 1;
    } else {
      year1Addition = 1;
      year2Addition = 2;
    }

    this.futureDate1 = tempDateformat.split('/')[0] + '/' + tempDateformat.split('/')[1] + '/'  + (Number(currentDate.split('/')[2]) + year1Addition);
    this.futureDate2 = tempDateformat.split('/')[0] + '/' + tempDateformat.split('/')[1] + '/'  + (Number(currentDate.split('/')[2]) + year2Addition);
    if (JSON.stringify(this.compareAbleSessionDetails) != JSON.stringify(this.sessionDetailArr.value)) {
      this.hasBeenCalled = true;
    } else {
      this.hasBeenCalled = false;
    }
    // End
  }

  deleteRow(index) {
    if (this.mode == 'view' || this.mode == 'view-logs') {
      return;
    }
    
    this.sessionDetailArr.removeAt(index);
    // this.dataSource = new MatTableDataSource(this.sessionDetailArr.value);
    this.sessionList = this.sessionDetailArr.value;
  }

  addToSessionArray() {
    this.tempSessions = [];

    this.selectedDates.forEach((date)=> {
      this.selectDayForSession(date);
    });
    console.log('umair',this.sessionDetailArr);

    // this.sessionDetailArr.value.sort(function(a, b) {
    //     var dateA = new Date(a.sessionDate);
    //     var dateB = new Date(b.sessionDate);
      
    //     if (dateA < dateB ) {
    //       return -1; 
    //     }
    //     if (dateA > dateB ) {
    //       return 1;
    //     }
    //     return 0;
    // })

    
    this.getOccupancyListAndPopulateTable();

    // this.dataSource = new MatTableDataSource(this.sessionDetailArr.value);
    // this.selectedDates = [];
  }

  getOccupancyListAndPopulateTable() {
    let originalArray = this.tempSessions
    let copyArr = [...originalArray];
    let uniqueArr = [];


    // Code for getting array of unique sessions with no duplicate values of (roomId & day)  
    originalArray.forEach((obj)=> {
       let unique = copyArr.filter((x)=> x.roomId == obj.roomId && x.day == obj.day);
       if (unique && unique.length != 0) {
         if(!uniqueArr.find(x => x.roomId == unique[0].roomId && x.day == unique[0].day)) {
            uniqueArr.push(unique[0]);
         }
       }
    })

    console.log(originalArray);
    console.log(uniqueArr);

    // Creating array of promises
    let promiseArr = [];
    uniqueArr.forEach((x)=> {
      let url = config.base_url_slug + 'view/room/' + x.roomId + '/per-day-per-hour-occupancy?sortOrder=ASC&attributes=[{"key":"day","value":"' + x.day + '"}]';
      // Check if the child has a default room Id
      if (x.roomId) {
        promiseArr.push(this.apiService.get(url));
      }
    });

    if (promiseArr.length != 0) {

      this.loader.setLoading(true);
      // Promise All for sending all api calls at once
      Promise.all(promiseArr).then((responseArr)=> {
         if (responseArr) {
           responseArr.forEach(res => {
             let slots = res.data.listing;
             if (slots.length !== 0) {
              let isExisting = this.responseSlots.find(x => slots[0].roomId == x.roomId && slots[0].day == x.day);
  
              if (!isExisting) {
               this.responseSlots.push({roomId: slots[0].roomId, day: slots[0].day, slots: slots});
              }
             } 
           });
  
           // Stop Loader and Populate Table Data
           this.loader.setLoading(false);
           this.sortList()
          //  this.dataSource = new MatTableDataSource(this.sessionDetailArr.value);
           this.sessionList = this.sessionDetailArr.value;
           this.selectedDates = [];
  
         }
      })
      .catch(()=>{})
    } else {
      this.sortList;
      this.sessionList = this.sessionDetailArr.value;
      this.selectedDates = [];
    }


  }

  sortList() {
    this.sessionDetailArr.value.sort(function(a, b) {
      var dateA = new Date(a.sessionDate);
      var dateB = new Date(b.sessionDate);
    
      if (dateA < dateB ) {
        return -1; 
      }
      if (dateA > dateB ) {
        return 1;
      }
      return 0;
  })
  }

  areFormArraysEqual(
    staticFormArray: FormArray,
    changeAbleFormarray: FormArray
  ): boolean {
    if (staticFormArray.length !== changeAbleFormarray.length) {
      return false;
    }
  
    for (let i = 0; i < staticFormArray.length; i++) {
      const group1 = staticFormArray.at(i) as FormGroup;
      const group2 = changeAbleFormarray.at(i) as FormGroup;
  
      // Compare the values of the FormGroup controls
      if (
        JSON.stringify(group1) !==
        JSON.stringify(group2)
      ) {
        return false;
      }
    }
  
    return true;
  }
  

  isAllSessionEmpty() {
    return this.sessionDetailArr.value.some(x=> !x.startTime);
  }

  openAdvanceSetting() {
    this.advanceDialog.emit(true);
  }

  clearSelectedDates() {
    this.selectedDates = [];
  }

  ngOnDestroy(): void {
    this.sub2.unsubscribe();
  }

}
