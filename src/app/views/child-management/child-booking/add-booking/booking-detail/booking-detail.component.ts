import { ThrowStmt } from '@angular/compiler';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray } from '@angular/forms';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { AlertService, ApiService, CommunicationService, PermissionService, UtilsService } from 'src/app/services';
import { AdvancedSettingsDialogComponent } from 'src/app/shared/advanced-settings-dialog/advanced-settings-dialog.component';
import { BookingPatterenDialogComponent } from 'src/app/shared/booking-patteren/booking-patteren-dialog.component';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { OverrideReccuringDialogComponent } from 'src/app/shared/override-reccuring-dialog/override-reccuring-dialog.component';
import { config } from 'src/config';
import { getSpecieFieldMsg } from '../../../../../shared/field-validation-messages';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-booking-detail',
  templateUrl: './booking-detail.component.html',
  styleUrls: ['/src/app/views/shared-style.scss', './booking-detail.component.scss']
})
export class BookingDetailComponent extends GlobalFormComponent implements OnInit, AfterViewInit {
  @Output() back = new EventEmitter<string>();
  @Input() data: any;
  @Input() bookingDatafromInvoice: any = null;
  @Input() isPopup = false;
  hasBeenCalled: boolean = false;
  sub2: Subscription;

  // footerProps: any;
  sessions: any = [];
  calendar: String = "assets/images/sdn/ic_event_24px.svg"
  childName: String;
  childBookingDetail: FormGroup;
  selectedRoom: any = {};
  monday: FormGroup;
  tuesday: FormGroup;
  wednesday: FormGroup;
  thursday: FormGroup;
  friday: FormGroup;
  isDateDisabled: boolean = true;
  timeVar: any;
  DayNameList: any = []
  isAllSessionsEnabled = true;
  branchId: string;
  prevMinDate
  maxStartDate
  minLeaveDate
  ageYear = 0;
  ageMonth = 0;
  isAttendancePopup = false;
  useCustomeMargin = false;
  minStart = null;
  futureDate1: string;
  futureDate2: string;
  tabIndex: any;
  overrideRecurring = false;
  activeBookings = [];
  isRecurringSessionsEmpty = false;

  // Table variables
  tableConfigAndProps = {};
  tableConfigForActiveBooking: any = {};
  tableConfigForFunding: any = {};
  validityDisable = false;

  dataSource: any;
  activeBookDataSrc = new MatTableDataSource([]);

  columnHeaderForActiveBooking = {
    'id': 'ID', 'room': 'Room', 'booking-type': 'Type', 'joiningDate': 'Start', 'leavingDate': 'End Date', 'validityType': 'Valid', 'sessionFormonday': 'Mon', 'sessionFortuesday': 'Tue',
    'sessionForwednesday': 'Wed', 'sessionForthursday': 'Thu', 'sessionForfriday': 'Fri'
  };

  displayedColumns = ['id', 'room', 'joiningDate', 'leavingDate', 'validityType', 'monday', 'tuesday',
    'wednesday', 'thursday', 'friday']

  columnHeaderForFunding = {
    'typeLabel': 'Funding Type', 'startDateLabel': 'Start Date', 'endDateLabel': 'End Date', 'passCode': 'Passcode', 'stretching': 'Stretched',
  };

  inputData = {
    'actionColumn': 'Stretched',
    'buttonEvent': "output",
    'hasCheckBox': false,
    'Action': 'Stretch',
  }
  bookingType: string = 'recurring_sessions';
  days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  initialState: any;
  initialChildDetail: any;
  initialSessions: any;
  attendanceDate: any;
  isSessionCreated: boolean = false;
  changedKeys = [];
  emptyForm1: any;
  isUnsavedForm: boolean = false;
  tempsessionDetails: any;

  // End
  constructor(protected router: Router,
    protected _route: ActivatedRoute,
    protected alertService: AlertService,
    protected apiService: ApiService,
    protected formbuilder: FormBuilder,
    protected dialog: MatDialog,
    protected utilsService: UtilsService,
    protected permissionService: PermissionService,
    protected communicationService: CommunicationService,
    protected dialogRef: MatDialogRef<BookingDetailComponent>,
  ) {
    super(router, _route, alertService, apiService, formbuilder, dialog, permissionService);
    this.Form.addControl('childId', new FormControl(null));
    this.Form.addControl('id', new FormControl(null));
    this.childBookingDetail = this.formbuilder.group({
      'branchId': localStorage.getItem('branchId'),
      'branchName': localStorage.getItem('branchName'),
      'roomId': new FormControl(null, [Validators.required]),
      'joiningDate': new FormControl(null, [Validators.required]),
      'leavingDate': new FormControl(null),
      'matjoiningDate': new FormControl(null, [Validators.required]),
      'matleaveDate': new FormControl(null),
      // 'type': new FormControl(null, [Validators.required]),
      'validityType': new FormControl(null, [Validators.required]),
      'bookingType': new FormControl(null, [Validators.required]),
      'changeFrequency': new FormControl(false),
      'repeatPeriod': new FormControl(null),
      'repeatEvery': new FormControl(null),
      "updateAllocatedRoom": new FormControl(false),
      'overrideRecurringSession': new FormControl(false),
      'overrideRecurringSessionId': new FormControl([]),
      'invoiceSplittingDetails': new FormControl([]),
    });
    this.Form.addControl('childBookingDetail', new FormControl(this.childBookingDetail.value));
    this.Form.addControl('sessionDetail', new FormArray([], Validators.required));

    this.isMultiple = false;
    this.editPermit = this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Booking Manager').update;
    this.emptyForm1 = this.childBookingDetail.value;
    // Table initialization
    console.log("Opened from ", window.history);

    this.dataSource = new MatTableDataSource([]);

    this.tableConfigForActiveBooking = {
      ActionButtons: [],
      inputData: this.inputData,
      columnHeader: this.columnHeaderForActiveBooking,
      dataSource: this.dataSource,
    };

    this.tableConfigForFunding = {
      ActionButtons: [],
      inputData: this.inputData,
      columnHeader: this.columnHeaderForFunding,
      dataSource: this.dataSource,

    };

    // Set validators on change frequency checkbox
    this.childBookingDetail.get('changeFrequency').valueChanges.subscribe(value => {
      if (value) {
        this.childBookingDetail.get('repeatPeriod').setValidators(Validators.required);
        this.childBookingDetail.get('repeatEvery').setValidators(Validators.required);
      } else {
        this.childBookingDetail.get('repeatPeriod').clearValidators();
        this.childBookingDetail.get('repeatEvery').clearValidators();
      }
      this.childBookingDetail.get('repeatPeriod').updateValueAndValidity();
      this.childBookingDetail.get('repeatEvery').updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    console.log('TESTING update');
    let time = this.isCurrentTimeDST();
    console.log(time);
    let off = new Date().getTimezoneOffset();
    let t = new Date(1695974400 * 1000);
    console.log(off);
    console.log(t);


    super.ngOnInit();
    var x = new Date();
    x.setDate(1);
    x.setMonth(x.getMonth() - 1);
    this.prevMinDate = new Date(x);

    // this.footerProps = {
    // 	'subButtonLabel': "Save Info",
    // 	'hasSubButton': true,
    // 	'hasbackButton': true,
    // 	'backButtonLabel': 'Cancel',
    // 	'type': 'output'
    //   };
    this.branchId = localStorage.getItem('branchId');
    // let day = '';
    // let noOfDays = this.bookingType == 'adhoc_session' ? 1 : 5;

    // for (let i = 0; i < noOfDays; i++)
    // {
    //   switch (i)
    //   {
    //     case 0:
    //       day = 'monday';
    //       break;
    //     case 1:
    //       day = 'tuesday';
    //       break;
    //     case 2:
    //       day = 'wednesday';
    //       break;
    //     case 3:
    //       day = 'thursday';
    //       break;
    //     case 4:
    //       day = 'friday';
    //       break;
    //   }
    //   let fg = this.formbuilder.group({
    //     "day": day,
    //     "startTime": new FormControl(0, [Validators.required]),
    //     "endTime": new FormControl(0, [Validators.required]),
    //     "sessionId": new FormControl(0, [Validators.required]),
    //     "disable": new FormControl(true),
    //     "category": new FormControl(null),
    //     "slots": new FormControl([])
    //   });

    //   fg.disable();
    //   (<FormArray>this.Form.get('sessionDetail')).push(fg); //add day form to form array session detail
    //   this.childBookingDetail.controls['matjoiningDate'].valueChanges.subscribe(value =>
    //   {
    //     if (value != null)
    //     {
    //       this.isDateDisabled = false
    //       this.minDate = new Date(value)
    //       this.minLeaveDate = this.minDate
    //       // this.getDaysBetweenRange();


    //     }
    //   })
    //   this.childBookingDetail.controls['matleaveDate'].valueChanges.subscribe(value =>
    //   {
    //     if (value != null)
    //     {
    //       this.maxStartDate = new Date(value)
    //     }
    //     // this.getDaysBetweenRange();

    //   })
    // }

    if (this.type == 'new') {
      this.getSessions(this.branchId);
    }
    console.log(this.data);
    this.bookingType = this.data?.bookingType ? this.data?.bookingType : this.bookingType;

    if (this.isPopup) {

      // var booking = JSON.parse(localStorage.getItem('booking'));
      var child_id = this.data?.id;
      console.log("id is ", child_id);

      this.childName = this.data?.name;
      if (child_id != null) {
        this.Form.controls['childId'].setValue(child_id);
      }

      this.type = 'view';
      this.formDetail = this.bookingDatafromInvoice;
      this.bookingType = this.bookingDatafromInvoice.bookingType;

      // this.formDetail.childBookingSessions = this.formDetail.invoiceChildBookingSessionDetail;
      this.Form.patchValue(this.formDetail);

      if (this.bookingType != 'multiple_sessions') {
        this.childBookingDetail.get('roomId').setValue(this.formDetail.room.id);
      }
      // this.Form.get('childBookingDetail').get('matleaveDate').setValue('2022-01-03');
      console.log(this.Form);
      console.log(this.formDetail);

      this.childBookingDetail.disable();

      this.disableInput = true

      this.afterDetail();

    } else {

      var child_id = this.data?.id;
      console.log("id is ", child_id);

      this.childName = this.data?.name;
      // this.bookingType = this.data?.bookingType ? this.data?.bookingType : this.bookingType;
      this.childBookingDetail.get('bookingType').setValue(this.bookingType);
      if (this.data?.attendanceId) {
        this.Form.addControl('attendanceId', new FormControl(this.data.attendanceId, [Validators.required]));
      }
      this.getSessions(this.branchId);
      console.log(this.bookingType);


      if (child_id != null) {
        this.Form.controls['childId'].setValue(child_id);
      }

      this.sub = this._route.params.subscribe(params => {
        this.id = params['id'];

        if (this.isAttendancePopup) {
          this.id = 'add';
          this.type = 'new';
          this.childBookingDetail.get('roomId').setValue(this.data.roomId);
          if (this.attendanceDate) {
            this.createSessions();
            this.isSessionCreated = true;
            this.childBookingDetail.get('matjoiningDate').setValue(this.attendanceDate)
            this.childBookingDetail.get('joiningDate').setValue(this.attendanceDate)
            this.dateChangeStatic(this.childBookingDetail, 'joiningDate', this.childBookingDetail.get('matjoiningDate').value)
          }
          console.log(this.Form.get('childId').value);
          console.log(this.data);
          console.log(this.childId);
          console.log(this.childName);



          // this.sub2 = this.childBookingDetail.valueChanges.subscribe((val) => {
          //   if (val) {
          //     this.detectFormChanges(val);
          //   }
          // })

        }

        if (this.id == 'add') {
          switch (this.bookingType) {
            case 'adhoc_session':

              this.formApi = config.base_url_slug + "add/child/adhoc-session";
              break;

            case 'recurring_sessions':
              this.formApi = config.base_url_slug + "add/child/session-booking";
              break;

            case 'multiple_sessions':
              this.formApi = config.base_url_slug + "add/child/multiple-session";
              this.removeValidationsForMultipleSession();
              break;

            default:
              break;
          }

          console.log(this.formApi);
          // this.getActiveBookings();
          this.getFunding();

          let validity = localStorage.getItem('operationalPeriod');
          if (validity) {
            this.childBookingDetail.get('validityType').setValue(validity == 'all_year' ? 'fullYear' : 'termOnly');
            this.validityDisable = validity == 'term_time' ? true : false;
          }
        }
        else {
          this.Form.controls['id'].setValue(this.id);

          if (this.type == "view-logs") {
            this.detailApi = config.base_url_slug + 'view/child/session-booking-log/' + this.id;
          }
          else {
            this.detailApi = config.base_url_slug + 'view/child/session-booking/' + this.id;

          }
          this.getDetail();
        }
        // Check for form changes for unsaved
        this.sub2 = this.childBookingDetail.valueChanges.subscribe((val) => {
          if (JSON.stringify(this.emptyForm1) != JSON.stringify(this.childBookingDetail.value)) {
            this.communicationService.unSavedForm.next(true);
          } else {
            this.communicationService.unSavedForm.next(false);
          }
        });
      });
    }

    this.getRoomsforDropdown(this.branchId);
    // this.detectFormChanges();
  }

  ngAfterViewInit(): void {

    if (this.type == 'new' && !this.isSessionCreated) {
      this.createSessions();
    }

  }

  createSessions() {

    if (this.bookingType == 'multiple_sessions') return;

    let day = '';
    let noOfDays = this.bookingType == 'adhoc_session' ? 1 : 5;

    for (let i = 0; i < noOfDays; i++) {
      switch (i) {
        case 0:
          day = 'monday';
          break;
        case 1:
          day = 'tuesday';
          break;
        case 2:
          day = 'wednesday';
          break;
        case 3:
          day = 'thursday';
          break;
        case 4:
          day = 'friday';
          break;
      }
      let fg = this.formbuilder.group({
        "day": day,
        "startTime": new FormControl(0, [Validators.required]),
        "endTime": new FormControl(0, [Validators.required]),
        "matStartTime": new FormControl(0, [Validators.required]),
        "matEndTime": new FormControl(0, [Validators.required]),
        "sessionId": new FormControl(0, [Validators.required]),
        "disable": new FormControl(true),
        "category": new FormControl(null),
        "slots": new FormControl([]),
        "addOnsIds": new FormControl([]),
        "allowFunding": new FormControl('yes'),
        "allowDiscount": new FormControl('yes')
      });

      if (this.bookingType == 'adhoc_session' && i == 0) {
        fg.addControl('overrideRecurring', new FormControl(false));
        fg.get('day').setValue('Select date');
      }

      fg.disable();
      (<FormArray>this.Form.get('sessionDetail')).push(fg); //add day form to form array session detail
      this.childBookingDetail.controls['matjoiningDate'].valueChanges.subscribe(value => {
        if (value != null) {
          this.isDateDisabled = false
          this.minDate = new Date(value)
          this.minLeaveDate = this.minDate
          // this.getDaysBetweenRange();


        }
      })
      this.childBookingDetail.controls['matleaveDate'].valueChanges.subscribe(value => {
        if (value != null) {
          this.maxStartDate = new Date(value)
        }
        // this.getDaysBetweenRange();

      })
    }

  }

  afterRoom() {
    console.log("after rooms are ", this.rooms);
    if (this.type == 'new' && this.data.defaultRoomId) {
      this.childBookingDetail.get('roomId').setValue(this.data.defaultRoomId);
    }
    this.selectedRoom = this.rooms.find(rm => rm.value === this.childBookingDetail.controls['roomId'].value);
  }

  get sessionDetail(): FormArray {
    return this.Form.get('sessionDetail') as FormArray;
  }

  getErrorMessage(field: any): any {
    return getSpecieFieldMsg[field];
  }

  checkValidations() {
    if (this.childBookingDetail.invalid) {
      return false;
    }
    return true;
  }

  checkType() {
    console.log(this.type);

    if (this.type != "") {
      if (this.type === 'view' || this.type === 'view-logs') {
        // this.Form.controls['sessionDetail'].value
        //   .forEach(control =>
        //   {
        //     control.disable();
        //   })
        if (this.sessionDetail.controls.length != 0) {
          this.sessionDetail.controls.forEach(c => c.disable());
        }

        this.title = "View " + this.title;

        this.onlyImage = true;
        this.childBookingDetail.disable();
        this.disableInput = true
      }
      else if (this.type === 'edit') {
        this.footerProps = {
          'buttonLabel': "Update Info",
          'hasbackButton': true,
          'backButtonLabel': 'Cancel',
          'hasButton': true,
          'hasSubButton': false,
          'removeUnsavedForm':true

        };
        this.childBookingDetail.enable();
        this.hasBeenCalled = false;
        this.disableInput = false;
        this.onlyImage = false;
        this.title = "Update " + this.title;
        // Set minimum for Joining Date
        this.minStart = new Date(this.childBookingDetail.controls['joiningDate'].value);

        // if (this.bookingType == 'recurring_sessions')      Commented out by Ahmed Jamil
        // {
        //   this.childBookingDetail.get('matjoiningDate').setValue(moment(new Date()));
        // }

        //End

        // Set value of validity type based on operationalPeriod
        let validity = localStorage.getItem('operationalPeriod');
        if (validity) {
          this.validityDisable = validity == 'term_time' ? true : false;
        }
        // End

        // this.getInfoForInvoice();
        this.setMinimumForStartdate();
      }
      else {
        this.footerProps = {
          'buttonLabel': "Save Info",
          'hasbackButton': true,
          'backButtonLabel': 'Cancel',
          'hasButton': true,
          'hasSubButton': false,
        }

        if (this.isAttendancePopup) {
          this.footerProps['isPopup'] = true;
        }
        this.onlyImage = false;
        this.title = "Add New " + this.title;

        if (!this.isPopup) {
          this.setChildAge();
        }

      }
    }
  }

  afterDetail(): void {
    console.log(this.formDetail.child);

    this.childBookingDetail.patchValue(this.formDetail);

    if (this.formDetail.joiningDate) {
      this.childBookingDetail.controls['matjoiningDate'].setValue(new Date(this.formDetail.joiningDate));
      this.minLeaveDate = this.formDetail.joiningDate;
    }

    if (this.formDetail.leavingDate) {
      this.childBookingDetail.controls['matleaveDate'].setValue(new Date(this.formDetail.leavingDate));
    }

    this.childName = this.formDetail.child.firstName + " " + this.formDetail.child.lastName;
    this.Form.controls['childBookingDetail'].setValue(this.childBookingDetail);
    this.bookingType = this.formDetail.bookingType ? this.formDetail.bookingType : this.bookingType;

    if (!this.formDetail.bookingType) {
      this.childBookingDetail.get('bookingType').setValue('recurring_sessions');
    }

    this.createSessions();


    if (this.type == "view-logs" && this.bookingType != 'multiple_sessions') {
      this.Form.controls['sessionDetail'].patchValue(this.formDetail?.childBookingSessionDetailLogs);
    }
    else {
      if (this.bookingType != 'multiple_sessions') {
        this.Form.controls['sessionDetail'].patchValue(this.formDetail?.childBookingSessions);
        this.tempsessionDetails = this.formDetail?.childBookingSessions
        if (this.bookingType == 'adhoc_session' && this.formDetail?.childBookingSessions.length !== 0) {
          this.childBookingDetail.get('overrideRecurringSessionId').setValue(this.formDetail?.childBookingSessions[0].overrideRecurringSessionId);
        }
      } else {
        this.patchSessionsForMultiple()
      }
    }

    if (this.formDetail?.room) {
      this.selectedRoom = this.formDetail?.room;
    }

    if (this.bookingType != 'multiple_sessions') {

      this.Form.controls['sessionDetail']['controls'].forEach(element => {
        this.previousDaysArr.push(element.controls['sessionId'].value)
        console.log("previous Days :", this.previousDaysArr)
        if (element.controls['sessionId'].value) {
          element.controls['disable'].setValue(false)
          var session = this.sessions.filter(obj => {
            return obj.id === element.controls['sessionId'].value
          });
          if (session && session[0]) {
            element.controls['category'].setValue(session[0].category);
          }
        }
        else {
          element.controls['disable'].setValue(true)
        }

        if (element.controls['endTime'].value != 0 && element.controls['startTime'].value != 0) {
          // Setting start and end time for Uk timezone
          element.controls['matStartTime'].setValue(moment((element.controls['startTime'].value * 1000) + (new Date(element.controls['startTime'].value * 1000).getTimezoneOffset() * 60000)));
          element.controls['matEndTime'].setValue(moment((element.controls['endTime'].value * 1000) + (new Date(element.controls['endTime'].value * 1000).getTimezoneOffset() * 60000)));

          if (this.type == 'view' || this.type == 'view-logs') {
            this.isDateDisabled = true;
            (<FormGroup>element).disable();
          }
          else {
            element.controls['disable'].setValue(false);
            (<FormGroup>element).enable();
          }
          this.getDayOccupancy(element, element.controls['day'].value);
        }
      });
    }

    switch (this.bookingType) {
      case 'adhoc_session':
        this.formApi = config.base_url_slug + 'update/child/adhoc-session/' + this.Form.get('id').value;
        this.overrideRecurring = this.childBookingDetail.get('overrideRecurringSession').value;
        this.getSessionsCount();
        break;

      case 'recurring_sessions':
        this.formApi = config.base_url_slug + 'update/child/session-booking/' + this.Form.get('id').value;
        this.getDaysBetweenRange();
        break;

      case 'multiple_sessions':
        this.formApi = config.base_url_slug + 'update/child/multiple-session/' + this.Form.get('id').value;
        this.removeValidationsForMultipleSession();
        break;

      default:
        break;
    }

    //Find Age of child
    let a = moment(this.formDetail.child.dateOfBirth);
    let b = moment();

    this.ageYear = b.diff(a, 'year');

    let months = b.diff(a, 'months');

    this.ageMonth = months - (this.ageYear * 12);
    console.log(this.childBookingDetail);

    // this.sub2 = this.childBookingDetail.valueChanges.subscribe((val) => {
    //   if (val) {
    //     this.detectFormChanges(val);
    //   }
    // })

    if (!this.hasBeenCalled) {
      // Set initial form on patch
      this.emptyForm1 = this.childBookingDetail.value;

      // Check form states once after patch
      if (JSON.stringify(this.emptyForm1) != JSON.stringify(this.childBookingDetail.value)) {
        this.communicationService.unSavedForm.next(true);
      } else {
        this.communicationService.unSavedForm.next(false);
      }
    }

    this.setChildAge();
    // this.getActiveBookings();
    this.getSessions(this.branchId);
    this.getFunding();
  }

  getSessions(branchId: any): any {
    let url = config.base_url_slug + 'view/sessions?sortBy=name&sortOrder=DESC&fetchType=dropdown&attributes=[{"key": "branchId","value": "' + branchId + '" }]';

    this.apiService.get(url).then(res => {
      if (res.code == 200) {
        this.sessions = res.data;
        // this.sessions.forEach(element => {
        //   let start = (element.startTime * 1000 ) + (new Date().getTimezoneOffset()*60000);
        //   let end = (element.endTime * 1000 ) + (new Date().getTimezoneOffset()*60000);
        //   element['startTime'] = element.startTime ? (start/1000) : 0;
        //   element['endTime'] = element.endTime ? (end/1000) : 0;
        // });
        console.log(this.sessions);

        this.getActiveBookings();
      }
      else {
        this.sessions = [];
      }
    });
  }

  selectDay(sessionForm) {
    let day = sessionForm.controls['day'].value.charAt(0).toUpperCase() + sessionForm.controls['day'].value.slice(1)
    if (this.type == 'view' || this.type == 'view-logs') {
      return;
    }
    if (!this.DayNameList.includes(day)) {
      this.alertService.alertError('WARNING', day + ' is not Present in Date Range ');
      return
    }
    if (this.childBookingDetail.controls['roomId'].value == null) {
      this.alertService.alertError('WARNING', 'Please select the room first.');
      return;
    }

    if (sessionForm.controls['disable'].value == false) {
      // sessionForm.disable();
      sessionForm.controls['disable'].setValue(true);
    }
    else {
      sessionForm.enable();
      sessionForm.controls['disable'].setValue(false);
    }

    if (!sessionForm.controls['disable'].value) {
      this.getDayOccupancy(sessionForm, sessionForm.controls['day'].value);
    }
    else {
      sessionForm.controls['startTime'].setValue(0);
      sessionForm.controls['endTime'].setValue(0);
      sessionForm.controls['matStartTime'].setValue(0);
      sessionForm.controls['matEndTime'].setValue(0);
      sessionForm.controls['sessionId'].setValue(null);
      sessionForm.controls['category'].setValue(null);
      sessionForm.controls['slots'].setValue([]);
    }
    console.log(this.Form.value);

  }

  onSessionChange(event, sessionForm) {
    console.log("session details :::::::", this.Form.value);

    var result = this.sessions.filter(obj => {
      return obj.id === event.value
    });

    if (sessionForm) {
      sessionForm.controls['category'].setValue(result[0].category);
    }

    if (result && result['category'] != 'hourly') {
      let start = result[0].startTime ? (result[0].startTime * 1000) + (new Date(result[0].startTime * 1000).getTimezoneOffset() * 60000) : 0;
      let end = result[0].endTime ? (result[0].endTime * 1000) + (new Date(result[0].endTime * 1000).getTimezoneOffset() * 60000) : 0;

      sessionForm.controls['matStartTime'].setValue(start ? start / 1000 : 0);
      sessionForm.controls['matEndTime'].setValue(end ? end / 1000 : 0);
      sessionForm.controls['startTime'].setValue(result[0].startTime);
      sessionForm.controls['endTime'].setValue(result[0].endTime);

    }
    if (JSON.stringify(this.Form.value.sessionDetail) != JSON.stringify(this.tempsessionDetails)) {
      this.communicationService.unSavedForm.next(true);
    }
  }

  getChangesInDays() {
    this.Form.controls['sessionDetail']['controls'].forEach(element => {
      var day = element.get('day').value
      // element.reset()
      element.get('day').setValue(day);
      console.log("day :"
        , day)
    });
  }

  clearForm() {
    this.childBookingDetail.reset();
    this.childBookingDetail.get('branchId').setValue(localStorage.getItem('branchId'))
    this.childBookingDetail.get('branchName').setValue(localStorage.getItem('branchName'))

    this.Form.controls['sessionDetail']['controls'].forEach(element => {
      var day = element.get('day').value
      element.reset()
      element.get('day').setValue(day);
      console.log("day :"
        , day)
    });

  }

  onRoomChange(event) {

    console.log(event);

    // debugger
    let heading = 'Confirmation';
    let message =
      'Are you sure you want to change the default room for this child ?';
    let rightButton = 'Yes';
    let leftButton = 'No';

    let roomId = this.type == 'new' ? this.data.defaultRoomId : this.formDetail.child.DefaultRoomId;
    let currentDefaultRoom = this.type == 'new' ? this.data.defaultRoomId : this.formDetail.child.DefaultRoomId;
    if (this.childBookingDetail.get('roomId').value != roomId) {
      this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then((result) => {
        if (result) {
          this.childBookingDetail.get('updateAllocatedRoom').setValue(true);
        } else {
          this.childBookingDetail.get('updateAllocatedRoom').setValue(false);
        }
      });
    }

    this.selectedRoom = this.rooms.find(rm => rm.value === event.value);
    this.Form.controls['sessionDetail']['controls'].forEach(element => {
      if (!element.controls['disable'].value) {
        this.getDayOccupancy(element, element.controls['day'].value);
      }
    });
  }

  onFrequencyChange() {
    if (!this.childBookingDetail.get('changeFrequency').value) {
      this.childBookingDetail.get('repeatEvery').setValue(null);
      this.childBookingDetail.get('repeatPeriod').setValue(null);
    }
  }

  // changeDefaultRoom() {
  //   this.Form.get('updateAllocatedRoom').setValue(true);
  // }

  getDayOccupancy(Form, day: String): void {
    // console.log("getDayOccupancy ",Form.value , day)
    let roomId = this.bookingType == 'multiple_sessions' ? Form.controls['roomId'].value : this.childBookingDetail.controls['roomId'].value;
    let url = config.base_url_slug + 'view/room/' + roomId + '/per-day-per-hour-occupancy?sortOrder=ASC&attributes=[{"key":"day","value":"' + day + '"}]';
    this.apiService.get(url).then(result => {
      if (result.code === 200 && result.data) {
        let data = result.data.listing;
        // data.forEach(element => {
        //   element['startTime'] = (element.startTime * 1000) + (new Date().getTimezoneOffset()*60000);
        //   element['endTime'] = (element.endTime * 1000) + (new Date().getTimezoneOffset()*60000); 
        // });
        Form.controls['slots'].setValue(data);
      }
      else {
        Form.controls['slots'].setValue([]);
      }
    });
  }

  afterSuccessfullyAdd() {
    // localStorage.removeItem("booking")
    // this.router.navigateByUrl('/main/child-booking');
  }

  onSetTime(event, sessionForm, idx): void {
    console.log("onSetTime", event, sessionForm);
    //debugger;
    if (sessionForm.controls['sessionId'].value == null) {
      this.alertService.alertError('WARNING', 'Please fill the required data.');
    }
    this.timeVar = event.timeInMili;

    let offset = new Date().getTimezoneOffset();
    const startTime = new Date(event.startTime * 1000); // Multiply by 1000 to convert seconds to milliseconds
    const endTime = new Date(event.endTime * 1000); // Multiply by 1000 to convert seconds to milliseconds
    startTime.setMinutes(startTime.getMinutes() - offset);
    endTime.setMinutes(endTime.getMinutes() - offset);
    const startTimeAdjusted = startTime.getTime() / 1000; // Divide by 1000 to convert milliseconds to seconds
    const endTimeAdjusted = endTime.getTime() / 1000; // Divide by 1000 to convert milliseconds to seconds


    sessionForm.get('startTime').setValue(startTimeAdjusted);
    sessionForm.get('endTime').setValue(endTimeAdjusted);
    sessionForm.get('matStartTime').setValue(event.startTime);
    sessionForm.get('matEndTime').setValue(event.endTime);

    // this.sessionDetail.controls[idx].get('startTime').setValue(event.startTime);
    // this.sessionDetail.controls[idx].get('endTime').setValue(event.endTime);

    console.log(sessionForm);

  }

  getTimeWithStaticDate(timeInSec) {
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

  validateSessionDetails() {
    let valid = true;
    this.Form.controls['sessionDetail']['controls'].forEach(element => {
      if (!element.controls['disable'].value && (element.controls['startTime'].value == 0 || element.controls['endTime'].value == 0)) {
        valid = false;
      }
    })
    return valid;
  }
  previousDaysArr: any = []
  nullSessionId = '';
  hasChangesOccured() {
    let currentDaysArr = []
    this.Form.controls['sessionDetail']['controls'].forEach(element => {
      currentDaysArr.push(element.controls['sessionId'].value)
    })
    if (currentDaysArr.every((val, i, arr) => (val === arr[0] && val === null) || val === 0)) //for checking all session ids are null in array?
    {
      this.nullSessionId = 'null'
    }
    else {
      this.nullSessionId = 'notAllNull'
    }
    for (var i = 1; i < currentDaysArr.length; i++) {
      for (var j = 1; j < this.previousDaysArr.length; j++) {
        if (currentDaysArr[i] != this.previousDaysArr[j]) {
          // this.childBookingDetail.controls['matjoiningDate'].setValue(new Date());
        }
      }
    }
  }

  beforeSubmit() {
    console.log('djkdjksd')

    if (this.bookingType == 'adhoc_session') {
      this.beforeSubmitForAdhoc();
    }

    if (this.bookingType == 'multiple_sessions') {
      this.beforeSubmitForMultiple();
    }

    console.log(this.Form.value);

    this.isAllSessionsEnabled = true;
    if (this.checkValidations() == true) {
      console.log('222222')
      this.hasChangesOccured();
      // this.childBookingDetail.controls['joiningDate'].patchValue(moment(new Date(this.childBookingDetail.controls['matjoiningDate'].value)).format(config.serverDateFormat))
      this.Form.controls['childBookingDetail'].setValue(this.childBookingDetail.value);
      this.Form.controls['sessionDetail']['controls'].forEach(element => {
        if (element.controls['disable'].value) {
          this.isAllSessionsEnabled = false;
          // (<FormGroup>element).enable();
          element.controls['sessionId'].setValue(null);
        }
        else {
          if (element.controls['startTime'].value != 0 && element.controls['endTime'].value != 0) {
            element.controls['startTime'].setValue(this.getTimeWithStaticDate(element.controls['startTime'].value));
            element.controls['endTime'].setValue(this.getTimeWithStaticDate(element.controls['endTime'].value));
          }
        }
        // element.controls['day'].setValue(element.controls['day'].value.toLowerCase());
        if (this.isPopup) {
          // this.formApi = config.base_url_slug + 'update/child/session-booking/' + this.bookingDatafromInvoice.childBookingId;
          // this.Form.get('id').setValue(this.bookingDatafromInvoice.childBookingId);
          element.controls['day'].setValue(element.controls['day'].value.toLowerCase());
          var session = this.sessions.filter(obj => {
            return obj.id === element.controls['sessionId'].value
          });
          if (session && session[0]) {
            element.controls['category'].setValue(session[0].category);
          }
        }
      });
    }
    else {
      this.Form.setErrors({ 'invalid': true });
    }

    let invalid = this.findInvalidControls(this.Form);
  }

  onSubmit(): void {
    this.beforeSubmit();
    let invalid = this.findInvalidControls(this.childBookingDetail);

    if (this.bookingType == 'multiple_sessions' && this.hasExactMatchingValues(this.sessionDetail.value)) {
      this.alertService.alertError('ERROR', 'Remove duplicate sessions');
      return;
    }
    if (invalid.length > 0 && invalid[0] == "matjoiningDate") {
      this.alertService.alertError('WARNING', 'Start date is not valid.');
      return;
    }
    if (this.Form.invalid && this.isAllSessionsEnabled || this.nullSessionId === 'null') {
      this.alertService.alertError('WARNING', 'Please fill the required data.');
      return;
    }
    if (!this.validateSessionDetails()) {
      this.alertService.alertError('WARNING', 'Please provide session details.');
      return;
    }
    if ((this.childBookingDetail.get('joiningDate').value == this.childBookingDetail.get('leavingDate').value) && this.bookingType == 'recurring_sessions') {
      this.alertService.alertError('WARNING', 'Please create an Adhoc booking for single sessions');
      return;
    }

    let childCurrent = JSON.stringify(this.childBookingDetail.value);
    let sessionCurrent = JSON.stringify(this.sessionDetail.value);
    let childInitial = JSON.stringify(this.initialChildDetail);
    let sessionInitial = JSON.stringify(this.initialSessions);
    console.log(this.initialSessions);
    console.log(this.sessionDetail.value);

    // let equal = true;
    // for (let i = 0; i < this.sessionDetail.value.length; i++) {
    //   for (const prop in this.sessionDetail.value[i]) {
    //     if (this.sessionDetail.value[i][prop] !== this.initialSessions[i][prop]) {
    //       equal = false;
    //       break;
    //     }
    //   }
    // }

    if (this.bookingType == 'recurring_sessions' && this.type == 'edit' && (this.checkifChanged() || (sessionInitial != sessionCurrent))) {
      let dialogRef = this.dialog.open(BookingPatterenDialogComponent, {
        autoFocus: false,
        maxHeight: '90vh',
        width: '70%',
        data: {}
      });

      console.log(this.initialSessions);
      console.log(this.sessionDetail.value);


      dialogRef.componentInstance.form = this.Form;
      dialogRef.componentInstance.changedKeys = this.changedKeys;
      dialogRef.componentInstance.sessions = this.sessions;
      dialogRef.componentInstance.rooms = this.rooms;
      dialogRef.componentInstance.childDetail = this.childBookingDetail.value;
      dialogRef.componentInstance.initialChildDetail = this.initialChildDetail;
      dialogRef.componentInstance.initialSessions = this.initialSessions;

      dialogRef.componentInstance.childId = this.Form.get('childId').value;


      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.onSubmitDatatoApi()
        } else {
          return;
        }
      })
    } else {
      this.onSubmitDatatoApi();
    }


    // leave date mention show alert
    // if (this.type == 'new') {
    //   this.onSubmitDatatoApi();
    // } else {
    //   let startDate = new Date(this.childBookingDetail.controls['joiningDate'].value);
    // if (this.childBookingDetail.controls['leavingDate'].value)
    // {
    //   let leavedate = new Date(this.childBookingDetail.controls['leavingDate'].value);

    //   if (leavedate > new Date() && this.bookingType !== 'multiple_sessions')
    //   {
    //     let heading = 'Confirmation';
    //     let message = 'You have changed your booking pattern. The new booking pattern will be from ' + moment(startDate).format(config.cmsDateFormat) + ' - ' + moment(leavedate).format(config.cmsDateFormat) + '.<br> Are you sure you want to proceed?';
    //     let rightButton = 'Yes';
    //     let leftButton = 'No';
    //     this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then(result =>
    //     {
    //       console.log(result);
    //       if (!result)
    //       {
    //         return;
    //       }
    //       else
    //       {
    //         this.onSubmitDatatoApi();
    //       }
    //     })
    //   }
    //   else
    //   {
    //     this.onSubmitDatatoApi();
    //   }
    // }
    // else
    // {

    //   // Dialog here
    //   if (this.bookingType !== 'multiple_sessions') {
    //     let heading = 'Confirmation'; // Update message here
    //     let message = 'You have changed your booking pattern. The new booking pattern will be from ' + moment(startDate).format(config.cmsDateFormat) + ' - onward .<br> Are you sure you want to proceed?';
    //     let rightButton = 'Yes';
    //     let leftButton = 'No';
    //     this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then(result =>
    //     {
    //       console.log(result);
    //       if (!result)
    //       {
    //         return;
    //       }
    //       else
    //       {
    //         this.onSubmitDatatoApi();
    //       }
    //     })
    //   } else {
    //     this.onSubmitDatatoApi();
    //   }

    //   // this.onSubmitDatatoApi();
    // }
    // }

  }

  onSubmitDatatoApi() {
    if (this.type == "view" || this.type == "view-logs") {
    }
    else {
      let formData = this.Form.getRawValue();
      if (this.formValueChanged) {
        formData = this.otherForm;
      }

      if (this.type == 'edit') {
        this.apiService.patch(this.formApi, formData, this.hasFile).then(response => {
          if (response.code == 200 || response.code == 201) {
            this.responseData = response.data
            if (this.showSuccess) {
              this.alertService.alertSuccess(response.status, response.message).then(result => {
                if (!this.isMultiple) {
                  this.onLocationBack();
                }
              });
            }
            this.afterSuccessfullyAdd();
          }
          // else if (response.code == 201) {
          //   this.alertService.alertAsk('SUCCESS', response.message, 'Yes', 'No',false).then(result => {
          //     if (result) {
          //       this.router.navigate(['main/finance/allInvoice']);
          //     }
          //   })
          // }
          else {
            this.alertService.alertError(response.status, response.message);
          }
        })
        // this.alertService.alertError("Please", "Don't touch that button again.");
      }
      else {
        this.apiService.post(this.formApi, formData, this.hasFile).then(response => {
          if (response.code == 201 || response.code == 200) {
            this.responseData = response.data
            // console.log(this.responseData, "this is data in response")
            if (this.showSuccess) {
              this.alertService.alertSuccess(response.status, response.message).then(result => {
                if (!this.isMultiple && !this.isAttendancePopup) {
                  this.onLocationBack();
                }
                else {
                  this.dialogRef.close();
                }
              });
            }
            this.afterSuccessfullyAdd();
          }
          else {
            this.alertService.alertError(response.status, response.message);
          }
        })
        // this.alertService.alertError("Please", "Don't touch that button again.");
      }
    }
  }

  onEndBooking(): void {
    let url = config.base_url_slug + 'remove/child/session-booking/' + this.formDetail.id;
    this.apiService.delete(url).then(response => {
      if (response.code == 200 || response.code == 201) {
        this.alertService.alertSuccess(response.status, response.message).then(result => {
          this.onLocationBack();
        });
      }

      // if (response.code == 201) {
      //   this.alertService.alertAsk('SUCCESS', response.message, 'Yes', 'No',false).then(result => {
      //     if (result) {
      //       this.router.navigate(['main/finance/allInvoice']);
      //     } else {
      //       this.onLocationBack();
      //     }
      //   })
      // }
      else {
        this.alertService.alertError(response.status, response.message);
      }
    });
  }

  getOccupencyColor(slot) {
    let color = 'hour-box-disabled';
    if (slot.occupiedCapacity >= this.selectedRoom.totalCapacity) {
      //available 0
      color = 'hour-box-not-available';
    }
    if ((slot.occupiedCapacity < this.selectedRoom.totalCapacity) && (slot.occupiedCapacity > this.selectedRoom.totalCapacity / 2)) {
      // available 1 to 49
      color = 'hour-box-limited';
    }
    if (slot.occupiedCapacity <= this.selectedRoom.totalCapacity / 2) {
      // available > 50
      color = 'hour-box-available';
    }
    return color;
  }

  getDaysBetweenRange() {

    // if (this.type === 'edit')
    // {
    //   this.minLeaveDate = new Date().setHours(0,0,0,0)
    // }
    if (this.minLeaveDate && this.childBookingDetail.controls.matleaveDate.value) {
      this.DayNameList = [];
      var getDaysArray = function (start, end) {
        console.log(start);
        console.log(end);

        for (var arr = [], dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
          arr.push(new Date(dt));
        }
        return arr;
      };
      console.log(this.minLeaveDate);
      var daylist = getDaysArray(new Date(this.minLeaveDate), new Date(this.childBookingDetail.controls.matleaveDate.value));
      daylist.map((v) => v.toISOString().slice(0, 10)).join("")
      daylist.forEach(Day => {
        let nameOfDay = moment(Day).format('dddd');
        if (this.DayNameList.includes(nameOfDay)) { }
        else {
          this.DayNameList.push(nameOfDay)
        }
      })
      console.log('DayNameList', this.DayNameList)
    }
    else if (this.minLeaveDate && !this.childBookingDetail.controls.matleaveDate.value) {
      this.DayNameList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    }
    this.Form.controls['sessionDetail']['controls'].forEach(element => {
      var dayName = element.get('day').value;
      let day = dayName.charAt(0).toUpperCase() + dayName.slice(1)
      var disable = element.get('disable').value;
      if (!disable) {
        if (this.DayNameList.includes(day)) { }
        else {
          this.DayNameList.push(day);
          element.controls['startTime'].setValue(0);
          element.controls['endTime'].setValue(0);
          element.controls['matStartTime'].setValue(0);
          element.controls['matEndTime'].setValue(0);
          element.controls['sessionId'].setValue(null);
          element.controls['category'].setValue(null);
          element.controls['slots'].setValue([]);
          element.controls['disable'].setValue(true);
          element.disable();
        }
      }
    });
    console.log(this.DayNameList);

  }

  //Overiding method

  dateChangeStatic(Form, controlName, event: MatDatepickerInputEvent<Date>) {
    let control = controlName == 'joiningDate' ? 'matjoiningDate' : 'matleaveDate';
    let date = Form.get(control).value;

    if (moment(date).format('dddd') == 'Saturday' || moment(date).format('dddd') == 'Sunday') {
      Form.get(control).setValue(null);
      Form.get(controlName).setValue(null);
      this.alertService.alertInfo('Warning', 'Selection not allowed on Saturday and Sunday');
      return;
    }

    if (controlName == 'leavingDate' && Form.get('matleaveDate').value == null) {
      Form.get('leavingDate').setValue(null);
    } else {
      let formattedDate;
      if (event.value) {
        formattedDate = moment(new Date(event.value)).format(config.serverDateFormat);
      }
      else {
        formattedDate = event;
      }
      Form.get(controlName).setValue(formattedDate);

      if (this.bookingType == 'adhoc_session') {
        this.Form.controls['sessionDetail']['controls'][0].get('day').setValue(moment(date).format('dddd').toLowerCase());
        this.Form.controls['sessionDetail']['controls'].forEach((element) => {
          element.enable();
          // if (element.controls['day'].value == moment(date).format('dddd').toLowerCase()) {
          element.controls['disable'].setValue(false);
          this.overrideRecurring = false;
          this.childBookingDetail.get('overrideRecurringSessionId').setValue([]);
          console.log(this.childBookingDetail.value);

          // } else {
          //   element.controls['disable'].setValue(true);
          //   element.controls['startTime'].setValue(0);
          //   element.controls['endTime'].setValue(0);
          //   element.controls['sessionId'].setValue(null);
          // }
          this.getDayOccupancy(element, element.controls['day'].value);
        })

        this.getSessionsCount();
      }
    }

    this.getDaysBetweenRange();
    console.log(controlName);
  }

  onValidityChange() {
    this.sessionDetail.controls.forEach(control => {
      control.get('allowFunding').setValue(this.childBookingDetail.get('validityType').value == 'nonTerm' ? 'no' : 'yes');
    });
  }

  checkifChanged() {
    this.changedKeys = [];

    if (this.initialChildDetail.roomId != this.childBookingDetail.value.roomId) { this.changedKeys.push('roomId'); return true };
    if (this.initialChildDetail.validityType != this.childBookingDetail.value.validityType) { this.changedKeys.push('validityType'); return true };
    if (this.initialChildDetail.joiningDate != this.childBookingDetail.value.joiningDate) { this.changedKeys.push('joiningDate'); return true };
    if (this.initialChildDetail.leavingDate != this.childBookingDetail.value.leavingDate) { this.changedKeys.push('leavingDate'); return true };
    if (this.initialChildDetail.changeFrequency != this.childBookingDetail.value.changeFrequency) { this.changedKeys.push('changeFrequency'); return true };
    if (this.initialChildDetail.repeatEvery != this.childBookingDetail.value.repeatEvery) { this.changedKeys.push('repeatEvery'); return true };
    if (this.initialChildDetail.repeatPeriod != this.childBookingDetail.value.repeatPeriod) { this.changedKeys.push('roomId'); return true };
    if (this.initialChildDetail.invoiceSplittingDetails.length != this.childBookingDetail.value.invoiceSplittingDetails.length) return true;
    if (this.compareArrays(this.initialChildDetail.invoiceSplittingDetails, this.childBookingDetail.value.invoiceSplittingDetails)) return true;

    return false;
  }

  compareArrays(arr1, arr2) {
    let result = false;
    arr1.forEach(initial => {
      arr2.forEach(current => {
        if (initial['amountPaidPercentage'] != parseFloat(current['amountPaidPercentage'] || initial.guardian != current.guardian)) {
          result = true;
        }
      });
    });

    return result;
  }

  openOverrideRecurringDialog(val) {
    if (!val) {
      return;
    }
    let dialogRef = this.dialog.open(OverrideReccuringDialogComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      width: '60%',
      data: {}
    });

    dialogRef.componentInstance.sessionIds = this.childBookingDetail.get('overrideRecurringSessionId').value;
    dialogRef.componentInstance.joiningDate = this.childBookingDetail.get('joiningDate').value;
    dialogRef.componentInstance.childId = this.Form.get('childId').value;
    dialogRef.componentInstance.type = this.type;
    dialogRef.componentInstance.bookingId = this.Form.get('id').value;

    //  dialogRef.componentInstance.invoiceData = this.formDetail;
    //  dialogRef.componentInstance.dialog = dialogRef;



    dialogRef.afterClosed().subscribe(result => {
      if (result.status) {
        this.childBookingDetail.get('overrideRecurringSessionId').setValue(result.sessionIds);
        console.log(this.childBookingDetail.value);
      }

      if (result.sessionIds.length == 0 || (!result.status && this.childBookingDetail.get('overrideRecurringSessionId').value.length == 0)) {
        this.overrideRecurring = false;
      }

      // else if (!result.status && result.sessionIds.length == 0) {
      //   this.overrideRecurring = false;
      // }
    })
  }

  openAdvanceSettingsDialog() {
    let dialogRef = this.dialog.open(AdvancedSettingsDialogComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      width: '80%',
      data: {}
    });

    let sessions = _.cloneDeep(this.sessionDetail.value);
    let sessionsToSend = sessions.filter(x => x.startTime && x.endTime);

    sessionsToSend.forEach(element => {
      let room = this.rooms.find(x => x.value == this.childBookingDetail.get('roomId').value);
      let sessionName = this.sessions.find(x => element.sessionId == x.id);
      element['sessionName'] = sessionName ? sessionName.name : '';

      if (this.bookingType != 'multiple_sessions') {
        element['roomName'] = room ? room.label : '';
        element['sessionDate'] = this.childBookingDetail.get('joiningDate').value;
      } else {
        let room = this.rooms.find(x => x.value == element.roomId);
        element['roomName'] = room ? room.label : '';
      }
    });

    dialogRef.componentInstance.selectedSessions = sessionsToSend;
    dialogRef.componentInstance.invoiceSplittingDetails = this.childBookingDetail.get('invoiceSplittingDetails').value;
    dialogRef.componentInstance.joiningDate = this.childBookingDetail.get('joiningDate').value;
    dialogRef.componentInstance.childId = this.Form.get('childId').value;
    dialogRef.componentInstance.type = this.type;
    dialogRef.componentInstance.validityType = this.childBookingDetail.get('validityType').value;
    dialogRef.componentInstance.bookingType = this.childBookingDetail.get('bookingType').value;

    dialogRef.afterClosed().subscribe(result => {
      if (result && result?.status) {
        
        this.childBookingDetail.get('invoiceSplittingDetails').setValue(result.data.invoiceSplittingDetails);
        let sessions = result.data.sessionDetails;
        if (sessions.length != 0) {
          if (this.bookingType != 'multiple_sessions') {
            this.sessionDetail.controls.forEach((x) => {
              sessions.forEach(session => {
                if (session.day == x.get('day').value) {
                  x.patchValue(session);
                }
              });
            })
          } else {
            this.sessionDetail.patchValue(result.data.sessionDetails);
          }

        }
        this.communicationService.unSavedForm.next(false);
      } else if (!result?.status && result?.sessionIds?.length == 0) {
        this.overrideRecurring = false;
        this.communicationService.unSavedForm.next(false);
      }

      else {
        if (JSON.stringify(this.emptyForm1) != JSON.stringify(this.childBookingDetail.value)) {
          this.communicationService.unSavedForm.next(true);
        } else {
          this.communicationService.unSavedForm.next(false);
        }
      }
    })
  }

  isPatternConfirmPopup() {
    let dialogRef = this.dialog.open(BookingPatterenDialogComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      width: '70%',
      data: {}
    });

    console.log(this.initialSessions);
    console.log(this.sessionDetail.value);

    dialogRef.componentInstance.form = this.Form;
    // dialogRef.componentInstance.changedKeys = this.changedKeys;
    dialogRef.componentInstance.sessions = this.sessions;
    dialogRef.componentInstance.rooms = this.rooms;
    dialogRef.componentInstance.childDetail = this.childBookingDetail.value;
    dialogRef.componentInstance.initialChildDetail = this.initialChildDetail;
    dialogRef.componentInstance.initialSessions = this.initialSessions;

    dialogRef.componentInstance.childId = this.Form.get('childId').value;


    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        return true;
      } else {
        return false;
      }
    })
  }

  getDayForJoiningDate() {
    let date = this.childBookingDetail.get('matjoiningDate').value;
    return moment(date).format('dddd').toLowerCase();
  }

  check() {
    console.log(this.childBookingDetail);
  }

  getTooltip(slot) {
    let st = slot.startTime ? moment((slot.startTime * 1000) + (new Date(slot.startTime * 1000).getTimezoneOffset() * 60000)).format(config.cmsTimeFormat) : null;
    let et = slot.endTime ? moment((slot.endTime * 1000) + (new Date(slot.endTime * 1000).getTimezoneOffset() * 60000)).format(config.cmsTimeFormat) : null;
    // let d = new Date(slot.startTime * 1000);
    // let current = new Date();
    // current.setHours(d.getHours());
    // console.log(d.getHours());
    // current.setMinutes(d.getMinutes());
    // current.setSeconds(0);

    // let st = slot.startTime ? moment(1695974400 * 1000 + (new Date().getTimezoneOffset()*60000)).format("hh:mm A") : null;
    // let et = slot.endTime ? moment(1695978000 * 1000 + (new Date().getTimezoneOffset()*60000)).format("hh:mm A") : null;

    return st + " to " + et + " - " + slot.occupiedCapacity + "/" + this.selectedRoom.totalCapacity;
  }

  getDateString(element) {
    return element['startTime'] + ' - ' + element['endTime']
  }

  filterData(element) {
    element['startTime'] = this.converMiliToTime(element['startTime']);
    element['endTime'] = this.converMiliToTime(element['endTime']);
  }

  converMiliToTime(element) {
    if (element != 0) {
      // var date = new Date(element * 1000)
      // return moment(date).format("hh:mm A")
      var date = moment((element * 1000) + (new Date().getTimezoneOffset() * 60000))
      return moment(date).format("hh:mm A");
    }
    else {
      return ""
    }
  }
  // goBack()
  // {
  //   this.back.emit();
  // }

  closePopup() {
    this.dialogRef.close();
  }

  clearDate(controlName) {
    if (this.type != 'view') {
      let control = controlName == 'joiningDate' ? 'matjoiningDate' : 'matleaveDate';
      this.childBookingDetail.get(control).setValue(null);
      this.childBookingDetail.get(controlName).setValue(null);
      controlName == 'leavingDate' ? this.maxStartDate = null : this.minDate = null
    }
  }

  getInfoForInvoice() {

    let url = config.base_url_slug + 'child/booking-invoice/validation/' + this.id;
    this.apiService.get(url).then(res => {
      if (res.code == 200) {
        this.minStart = new Date();
      }
      else {
        // Set first day of Current month
        this.minStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      }

    });
  }

  getSessionsCount() {

    let endpoint = `${config.base_url_slug}view/childs/adhoc-override-recurring-dates?attributes=[{"key": "childId", "value": "${this.Form.get('childId').value}"}, {"key": "joiningDate", "value": "${this.childBookingDetail.get('joiningDate').value}"}, {"key": "method", "value": "${this.type == 'new' ? 'add' : 'update'}"} ${this.type != 'new' ? `, {"key":"BookingId","value": ${this.Form.get('id').value} }` : ''}]`;

    this.apiService.get(endpoint).then((res) => {

      // Patch listing values for table
      let sessions = res.data.RecurringSessions;
      this.isRecurringSessionsEmpty = sessions.length == 0 ? true : false;

    })
      .catch(err => {
        this.alertService.alertError(err.error.status, err.error.message).then(result => {
          // this.getList(this.filterUrl);
        })
      })
  }

  setMinimumForStartdate() {
    let lastInvoiceDate = this.formDetail.lastInvoicedDate || this.formDetail.lastInvoiceDateGuardian1 || this.formDetail.lastInvoiceDateGuardian2;
    if (this.bookingType === 'adhoc_session'){
      this.minStart = this.formDetail.joiningDate;
    }
    else if (this.formDetail.leavingDate && this.formDetail.leavingDate < moment().format('YYYY-MM-DD')) {

      if (!lastInvoiceDate && this.formDetail.iterationNumber == 1) {
        this.childBookingDetail.get('matjoiningDate').setValue(moment(new Date(this.formDetail.joiningDate)));
        // this.minLeaveDate = new Date(this.formDetail.joiningDate);
        // this.minStart =  new Date(this.childBookingDetail.controls['matjoiningDate'].value);//new Date(this.formDetail.joiningDate);
        this.minStart = null;

      }
      else if (!lastInvoiceDate && this.formDetail.iterationNumber > 1) {
        this.childBookingDetail.get('matjoiningDate').setValue(moment(new Date(this.formDetail.joiningDate)));
        // this.minLeaveDate = new Date(this.formDetail.joiningDate);
        // this.minStart =  new Date(this.childBookingDetail.controls['matjoiningDate'].value);//new Date(this.formDetail.joiningDate);
        this.minStart = new Date(this.formDetail.joiningDate);

      }
      else {
        // let nextMonthStartDate = moment(lastInvoiceDate).add(1, 'month').startOf('month').format('YYYY-MM-DD')

        // if (nextMonthStartDate <= this.formDetail.leavingDate)
        // {
        //   this.minStart = moment(this.formDetail.lastInvoicedDate).add(1, 'month').startOf('month').toDate();
        //   this.childBookingDetail.get('matjoiningDate').setValue(moment(new Date(this.minStart)));

        // }

      }
      this.hasBeenCalled = false;

    }

    //else if (this.formDetail.iterationNumber > 1 && this.formDetail.joiningDate >= moment().startOf('month').format('YYYY-MM-DD')) {
    else if (this.formDetail.iterationNumber > 1 && !lastInvoiceDate) {
      // this.minStart = this.formDetail.joiningDate.toDate();
      this.minStart = new Date(this.formDetail.joiningDate);
    }
    else if (!lastInvoiceDate) {
      this.minStart = null;
    }
    else {
      let nextMonthStartDate = moment(lastInvoiceDate).add(1, 'month').startOf('month')
      console.log('=== >> this.formDetail.lastInvoicedDate 2.0== > ', this.formDetail.lastInvoicedDate)

      console.log('=== >> nextMonthStartDate 2.0 == > ', nextMonthStartDate)

      let currentDate = moment()

      if (currentDate > nextMonthStartDate) {
        this.minStart = nextMonthStartDate.toDate();
      }
      // else
      // {
      //   this.minStart = new Date();
      // }
    }


    if (!this.formDetail.leavingDate) {
      this.minStart = moment(lastInvoiceDate).add(1, 'month').startOf('month').toDate();
    }
  }

  showLeaveDateCondition() {

    if (this.bookingType == 'multiple_sessions' || this.bookingType == 'adhoc_session') {
      return false;
    }

    if (this.type == 'view' || this.type == 'new') {
      return true;
    } else {
      return !this.formDetail?.lastInvoicedDate ? true : false;
    }
  }

  hasValue(controlName) {
    return this.childBookingDetail.get(controlName).value && this.type != 'view' ? true : false;
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

    if (new Date(currentDate.split('/')[2] + '-' + tempDateformat.split('/')[1] + '-' + tempDateformat.split('/')[0]) > new Date()) {
      year1Addition = 0;
      year2Addition = 1;
    } else {
      year1Addition = 1;
      year2Addition = 2;
    }

    this.futureDate1 = tempDateformat.split('/')[0] + '/' + tempDateformat.split('/')[1] + '/' + (Number(currentDate.split('/')[2]) + year1Addition);
    this.futureDate2 = tempDateformat.split('/')[0] + '/' + tempDateformat.split('/')[1] + '/' + (Number(currentDate.split('/')[2]) + year2Addition);

    // End
  }

  getNumberWithSuffix() {
    return this.utilsService.addNumberSuffix(this.childBookingDetail.get('repeatEvery').value);
  }

  setTabIndex(a, b) { }

  beforeSubmitForAdhoc() {
    // Set value of override checkbox from sesiondetail array to childbooking control.
    this.childBookingDetail.get('overrideRecurringSession').setValue(this.overrideRecurring);
    if (this.childBookingDetail.get('joiningDate').value) {
      this.childBookingDetail.get('leavingDate').setValue(this.childBookingDetail.get('joiningDate').value);
    }
  }

  beforeSubmitForMultiple() {

    let smallest;
    let largest;
    let dates = this.sessionDetail.value.map(x => new Date(x.sessionDate));

    const smallestDate = new Date(Math.min.apply(null, dates));
    const largestDate = new Date(Math.max.apply(null, dates));

    this.childBookingDetail.get('joiningDate').setValue(moment(new Date(smallestDate)).format(config.serverDateFormat));
    this.childBookingDetail.get('leavingDate').setValue(moment(new Date(largestDate)).format(config.serverDateFormat));
  }

  hasExactMatchingValues(arr) {
    // Iterate over each object in the array
    for (let i = 0; i < arr.length; i++) {
      // Iterate over each object after the current object
      for (let j = i + 1; j < arr.length; j++) {
        // Check if the current object and the next object have exact matching values
        if (arr[i].sessionDate === arr[j].sessionDate && arr[i].sessionId === arr[j].sessionId) {
          return true; // If there's a match, return true
        }
      }
    }
    return false; // If no match was found, return false
  }

  goToEdit() {
    if (this.bookingType === 'adhoc_session'){
      this.minStart = this.formDetail.joiningDate;
    }
    // this.router.navigateByUrl(`/main/enrolment/${this.id}/edit`);
    else if (this.formDetail.lastInvoicedDate || this.formDetail.lastInvoiceDateGuardian1 || this.formDetail.lastInvoiceDateGuardian2) {
      let lastInvoiceDate = this.formDetail.lastInvoicedDate || this.formDetail.lastInvoiceDateGuardian1 || this.formDetail.lastInvoiceDateGuardian2;
      let nextMonthStartDate = moment(lastInvoiceDate).add(1, 'month').startOf('month').format('YYYY-MM-DD')
      if (nextMonthStartDate > this.formDetail.leavingDate) {
        let monthName = moment(this.formDetail.lastInvoicedDate, "YYYY-MM-DD").format("MMMM");
        let msg = `You cannot edit this booking. The invoice has been generated and approved already for the month of ${monthName}`;
        this.alertService.alertInfo('Warning', msg);
        return false
      }
      else {
        this.childBookingDetail.get('matjoiningDate').setValue(moment(nextMonthStartDate));
        this.childBookingDetail.get('joiningDate').setValue(moment(nextMonthStartDate));
        this.minStart = moment(lastInvoiceDate).add(1, 'month').startOf('month').toDate();
      }
    }
    this.hasBeenCalled = false;
    this.type = 'edit';
    this.checkType();
    console.log(this.Form);

    this.Form.controls['sessionDetail']['controls'].forEach(element => {
      element.enable();
    })

    // Setting initials to compare with updated form
    this.initialState = { ...this.Form.value };
    this.initialChildDetail = { ...this.childBookingDetail.value }
    // this.initialSessions = [...this.sessionDetail.value];
    this.initialSessions = _.cloneDeep(this.sessionDetail.value);
    this.initialSessions.forEach(element => {
      element['startTime'] = element['startTime'] ? this.getTimeWithStaticDate(element['startTime']) : element['startTime'];
      element['endTime'] = element['endTime'] ? this.getTimeWithStaticDate(element['endTime']) : element['endTime'];
    });

    // Set initial form on patch
    this.emptyForm1 = this.childBookingDetail.value;

    // Check form states once after patch
    if (JSON.stringify(this.emptyForm1) != JSON.stringify(this.childBookingDetail.value)) {
      this.communicationService.unSavedForm.next(true);
    } else {
      this.communicationService.unSavedForm.next(false);
    }
    // End
  }

  patchSessionsForMultiple() {

    let sessionKey = this.type == 'view-logs' ? 'childBookingSessionDetailLogs' : 'childBookingSessions';

    this.formDetail[sessionKey].forEach((element) => {
      let session = this.formbuilder.group({
        "day": new FormControl(null, [Validators.required]),
        "sessionDate": new FormControl(null, [Validators.required]),
        "startTime": new FormControl(null, [Validators.required]),
        "endTime": new FormControl(null, [Validators.required]),
        "matStartTime": new FormControl(null, [Validators.required]),
        "matEndTime": new FormControl(null, [Validators.required]),
        "sessionId": new FormControl(null, [Validators.required]),
        "disable": new FormControl(false),
        "category": new FormControl(null),
        "roomId": new FormControl(null),
        "slots": new FormControl([]),
        "addOnsIds": new FormControl([]),
        "allowFunding": new FormControl('yes'),
        "allowDiscount": new FormControl('yes')
      });

      session.patchValue(element);

      session.get('matStartTime').setValue((element.startTime * 1000) + (new Date(element.startTime * 1000).getTimezoneOffset() * 60000));
      session.get('matEndTime').setValue((element.endTime * 1000) + (new Date(element.endTime * 1000).getTimezoneOffset() * 60000));

      let currentSession = this.sessions.filter(obj => obj.id == element.sessionId);
      if (currentSession && currentSession[0]) {
        session.controls['category'].setValue(currentSession[0].category);
      }


      (<FormArray>this.Form.get('sessionDetail')).push(session);
    })
    console.log("this.Form.get('sessionDetail')", this.Form.get('sessionDetail'));

  }

  removeValidationsForMultipleSession() {
    this.childBookingDetail.get('joiningDate').clearValidators();
    this.childBookingDetail.get('matjoiningDate').clearValidators();
    this.childBookingDetail.get('joiningDate').updateValueAndValidity();
    this.childBookingDetail.get('matjoiningDate').updateValueAndValidity();
    this.childBookingDetail.get('roomId').clearValidators();
    this.childBookingDetail.get('roomId').updateValueAndValidity();
  }

  isAllSessionEmpty() {
    return this.sessionDetail.value.every(x => !x.startTime) || this.sessionDetail.value.some(x => !x.startTime && !x.disable);
  }

  getActiveBookings() {

    let childId = this.Form.get('childId').value;
    let endpoint = `${config.base_url_slug}view/childs/active-session-booking?page=1&sortOrder=DESC&attributes=[{"key": "childId","value": ${childId} }]&perPage=10`;
    // let invoiceIds = [item.row.id];
    let data = {};
    this.apiService.get(endpoint).then((res) => {

      // Patch listing values for table

      this.activeBookings = res.data.active_child_bookings;

      this.activeBookings.forEach((element) => {
        element['validityType'] = element?.validityType == 'fullYear' ? 'Full Year' : element?.validityType == 'nonTerm' ? 'Non Term' : element?.validityType == 'termOnly' ? 'Term Only' : '-';
        let room = this.rooms.find(x => x.value == element.roomId);
        element['room'] = (element.bookingType == 'multiple_sessions' && !element.roomName) ? 'Multiple Rooms' : element.roomName
        element['joiningDate'] = element.joiningDate != null ? moment(new Date(element.joiningDate)).format(config.cmsDateFormat) : '-';
        element['leavingDate'] = element.leavingDate != null ? moment(new Date(element.leavingDate)).format(config.cmsDateFormat) : '-';
        element['booking-type'] = this.getBookingTypeName(element?.bookingType)


        // create day columns initialized with dash
        this.days.forEach(x => element[x] = '-');
        this.days.forEach(x => element['sessionFor' + x] = { day: '-', sessionName: '' });

        // create day columns initialized with dash
        this.days.forEach(x => element[x] = '-');
        this.days.forEach(x => element['sessionFor' + x] = { day: '-', sessionName: '' });


        element.sessionDetails?.forEach(session => {
          this.filterData(session);
          let sessionName = this.sessions.find(x => session.sessionId == x.id);
          element[session.day] = !session.startTime ? '-' : this.getDateString(session);
          element['sessionFor' + session.day] = { day: element.bookingType != 'multiple_sessions' ? element[session.day] : '-', sessionName: (sessionName && element.bookingType != 'multiple_sessions') ? sessionName.name : '' };
        });
      });
      console.log(this.activeBookings);


      this.tableConfigForActiveBooking.dataSource = new MatTableDataSource(this.activeBookings);
      this.activeBookDataSrc = new MatTableDataSource(this.activeBookings)
      this.tableConfigForActiveBooking.pagination = res.data.pagination;

    })
      .catch(err => {
        // this.alertService.alertError(err.error.status, err.error.message).then(result => {
        // this.getList(this.filterUrl);
        // })
      })
  }

  getFunding() {

    let childId = this.Form.get('childId').value;
    let endpoint = `${config.base_url_slug}view/child/finance-information?childId=${childId}&branchId=${this.branchId}&page=1&perPage=20`;
    // let invoiceIds = [item.row.id];
    let data = {};
    this.apiService.post(endpoint, {}).then((res) => {

      // Patch listing values for table
      let fundings = res.data.listing;

      fundings.forEach(element => {
        element['startDateLabel'] = element.startDate != null ? moment(new Date(element.startDate)).format(config.cmsDateFormat) : '-';
        element['endDateLabel'] = element.endDate != null ? moment(new Date(element.endDate)).format(config.cmsDateFormat) : '-';
        element['typeLabel'] = this.getFundingType(element.fundingId);
        element['passCode'] = element.passCode || '-';
        // element.stretch = element.stretch ? 'check_circle': '-';
        element['stretching'] = { stretch: element.stretch ? 'check_circle' : '-', tooltip: element.stretch ? 'Selected Stretched Government Funded hours ' + element.stretchedHours.toFixed(2) : '' };

      });

      this.tableConfigForFunding.dataSource = new MatTableDataSource(fundings);
      this.tableConfigForFunding.pagination = res.data.pagination;

    })
      .catch(err => {
        this.alertService.alertError(err.error.status, err.error.message).then(result => {
          // this.getList(this.filterUrl);
        })
      })
    this.hasBeenCalled = true;
  }

  isMultipleConditionTrue() {
    if (this.formDetail) {
      let x = this.formDetail.lastInvoicedDate != null && this.formDetail.bookingType == 'multiple_sessions';
      return x;
    }
    return true;
  }

  getBookingTypeName(type) {
    let val = 'Recurring';
    switch (type) {
      case 'adhoc_session':
        val = 'Adhoc'
        break;
      case 'multiple_sessions':
        val = 'Multiple'
        break;

      default:
        break;
    }

    return val;
  }

  getFundingType(id) {

    let type = '';
    switch (id) {
      case 1:
        type = 'Not Funded';
        break;

      case 2:
        type = 'Free 15 hours 2 years old';
        break;

      case 3:
        type = 'Free 15 hours 3/4 years old';
        break;

      case 4:
        type = 'Free 30 hours 3/4 years old';
        break;

      case 5:
        type = 'Custom Funding';
        break;

      case 6:
        type = '5+ years old';
        break;

      default:
        type = '-'
        break;
    }

    return type;

  }

  isCurrentTimeDST() {

    const currentDate = moment('2023-10-29');
    const currentYear = currentDate.year();

    // Find the last Sunday of March
    const lastMarchSunday = moment(`${currentYear}-03-31`).day('Sunday');

    while (lastMarchSunday.day() !== 0) {
      lastMarchSunday.subtract(1, 'day');
    }

    // Find the last Sunday of October
    const lastOctoberSunday = moment(`${currentYear}-10-31`).day('Sunday');

    while (lastOctoberSunday.day() !== 0) {
      lastOctoberSunday.subtract(1, 'day');
    }

    // Check if the current date is between the two Sundays
    return currentDate.isBetween(lastMarchSunday, lastOctoberSunday, null, '[]');

  }
  detectFormChanges(form) {

    if (!this.hasBeenCalled) {
      this.emptyForm1 = form;
    }

    if (JSON.stringify(this.emptyForm1) != JSON.stringify(form)) {
      this.communicationService.unSavedForm.next(true);
    }
    this.hasBeenCalled = true;
  }

  ngOnDestroy(): void {
    this.sub2.unsubscribe();
  }


  weekendFilter = (d: moment.Moment): boolean => {
    const day = d.day().toString();
    // Prevent Saturday and Sunday from being selected.
    return day !== "6" && day !== "0";
  }
}
