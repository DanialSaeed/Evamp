import { BookingDetailComponent } from 'src/app/views/child-management/child-booking/add-booking/booking-detail/booking-detail.component';
import
  {
    Component,
    OnInit
  } from '@angular/core';
import
  {
    MatDialog
  } from '@angular/material/dialog';
import
  {
    Router,
    ActivatedRoute
  } from '@angular/router';
import
  {
    GlobalListComponent
  } from 'src/app/shared/global-list';
import
  {
    ApiService,
    AlertService,
    PermissionService
  } from 'src/app/services';
import
  {
    MatTableDataSource
  } from '@angular/material/table';
import * as moment from 'moment';
import
  {
    config
  } from 'src/config';
import
  {
    AttendanceDialogComponent
  } from './attendance-dialog/attendance-dialog.component';
import
  {
    Subscription
  } from 'rxjs';
import { threadId } from 'worker_threads';
import { StaffAttendanceDialogComponent } from './staff-attendance-dialog/staff-attendance-dialog.component';
import { AddAttendanceDialogComponent } from './add-attendance-dialog/add-attendance-dialog.component';
@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class AttendanceComponent extends GlobalListComponent implements OnInit
{
  sub: Subscription;
  attendanceType: any;
  tableConfigAndProps = {};
  dataSource = new MatTableDataSource();
  layoutAlign = "start start";
  columnHeader = {};
  public date = moment();
  toggle =  false;
  actionButtonsToggle: any[] = [];
  toggleTriggered = false;
  hasToggle = true;
  isExpand = false;

  headerProps: any = {
    searchConfig: {
      label: 'Enter Child Name',
      key: 'branchId',
      value: '',
      toggleValue: false,
      onLabel: 'Show All',
      offLabel: 'Show Discrepancy'
    },
    builtInFilters: {
      key: 'branchId',
      value: localStorage.getItem('branchId')
    },
    filterArray: [{
      label: 'Select Room',
      type: 'search',
      key: 'roomId',
      selected: 'All',
      options: this.rooms
    },],
  };
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
  // 'buttonEvent': 'output'  on events

  columnHeaderChild = {
    'createdDate': 'Created Date',
    'childName': 'Child Name',
    'age': 'Age',
    'room': 'Room',
    'timeIntoDisplay': 'Time In',
    'timeOuttoDisplay': 'Time Out',
    // 'attendance': 'Status',
    'Actions': 'Actions',
  };

  columnHeaderStaff = {
    // 'id': 'ID',
    'staffName': 'Staff Name',
    'createdDate': 'Day / Date',
    'branchName': 'Branch Name',
    'scheduledTimeInDisplay' : 'Scheduled Sign In',
    'scheduledTimeOutDisplay': 'Scheduled Sign Out',
    'timeIntoDisplay': 'Sign In',
    'breakType': 'Break Type',
    'breakIntoDisplay': 'Break Start',
    'breakOuttoDisplay': 'Break End',
    'timeOuttoDisplay': 'Sign Out',
    // 'attendance': 'Status',
    'Actions': 'Actions',
    'expand': '',
  };

  attendanceHeaderStaff = {
    // 'id': 'ID',
    // 'staffName': 'Staff Name',
    'branchName': 'Branch Name',
    'createdDate': 'Day / Date',
    'timeIntoDisplay': 'Sign In',
    'timeOuttoDisplay': 'Sign Out',
    // 'breakIntoDisplay': 'Break In',
    // 'breakOuttoDisplay': 'Break Out',
    // 'attendance': 'Status',
    // 'breakType': 'Break Type',
    // 'expand': '',
    // 'Actions': 'Actions',
  };

  // headerButtons = [
  // 	{ buttonLabel: "Add New", color: "#E2AF2A", buttonRoute: "additional-items/add", isMultiple: true, firstFormName: 'select-children' },
  // ]
  buttonHeaderProps = {
    headingLabel: "Attendance",
    hasRightLabel: true,
    rightLabel: "date time",
    // ActionButtons: this.headerButtons,
    hasButton: false,
    hasHeading: true,
    labelMargin: '0px',
    float: 'right',
    textclass: 'text-bolder text-color',
    buttonsMargin: '0px 10px 0px',
    margin: '10px',
    // builtInFilters: { key: 'branchId', value: localStorage.getItem('branchId') }
  };

  sortBy = '';
	sortOrder = '';
  
	sortFields:any[] = [
    {asc: false, field: 'id'},
    {asc: false, field: 'createdDate'}, 
    {asc: false, field: 'childName'},
    {asc: false, field: 'age'},
    {asc: false, field: 'room'},
    {asc: false, field: 'timeIntoDisplay'},
    {asc: false, field: 'timeOuttoDisplay'}
    
];
    rangeStart: any;
    rangeEnd: any;

  constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected dialog: MatDialog,
    protected permissionsService: PermissionService)
  {
    super(router, apiService, alertService, permissionsService);
    this.listApi = config.base_url_slug;
    this.sub = this._route.params.subscribe(params =>
    {
      this.attendanceType = params['type'];
      console.log("this.attendanceType", this.attendanceType);
      if (this.attendanceType == 'child')
      {
        this.listApi = this.listApi + 'view/childs/attendance';
        // this.hasToggle = true;
      } else
      {
        this.listApi = this.listApi + 'view/staff/attendance';
        // this.hasToggle = false;
      }
    });

    this.getRoomsforDropdown(localStorage.getItem('branchId'));

    if (this.attendanceType == 'child') {
      this.actionButtons = [
        {
          buttonLabel: "Create",
          type: 'create',
          buttonRoute: "",
          isConditional: true,
          condition:{key: 'timeStatus', value: 'afterTime'},
          visibility: this.permissionsService.getPermissionsBySubModuleName(this.attendanceType == 'child' ? 'Child Management' : 'H.R Management', this.attendanceType == 'child' ? 'Attendance' : 'Staff').read
        },
        {
        buttonLabel: "Edit",
        type: 'edit',
        buttonRoute: "",
        visibility: this.permissionsService.getPermissionsBySubModuleName(this.attendanceType == 'child' ? 'Child Management' : 'H.R Management', this.attendanceType == 'child' ? 'Attendance' : 'Staff').update
      },
      {
        buttonLabel: "View",
        type: 'view',
        buttonRoute: "",
        visibility: this.permissionsService.getPermissionsBySubModuleName(this.attendanceType == 'child' ? 'Child Management' : 'H.R Management', this.attendanceType == 'child' ? 'Attendance' : 'Staff').read,
        // hide: true
      },
      {
        buttonLabel: "Discard",
        type: 'delete',
        buttonRoute: "",
        isConditional: true,
        condition:{key: 'timeStatus', value: 'afterTime'},
        visibility: this.permissionsService.getPermissionsBySubModuleName(this.attendanceType == 'child' ? 'Child Management' : 'H.R Management', this.attendanceType == 'child' ? 'Attendance' : 'Staff').read
      },
        // { buttonLabel: "Delete", type: 'delete', buttonRoute: "" },
      ]
    } else {
      this.actionButtons = [
      //   {
      //   buttonLabel: "Edit",
      //   type: 'edit',
      //   buttonRoute: "",
      //   visibility: this.permissionsService.getPermissionsBySubModuleName(this.attendanceType == 'child' ? 'Child Management' : 'H.R Management', this.attendanceType == 'child' ? 'Attendance' : 'Staff').update
      // },
      // {
      //   buttonLabel: "View",
      //   type: 'view',
      //   buttonRoute: "",
      //   visibility: this.permissionsService.getPermissionsBySubModuleName(this.attendanceType == 'child' ? 'Child Management' : 'H.R Management', this.attendanceType == 'child' ? 'Attendance' : 'Staff').read
      // },
      {
        buttonLabel: "Discard",
        type: 'delete',
        buttonRoute: "",
        isConditional: true,
        condition:{key: 'timeStatus', value: ['beforeTime','afterTime']},
        visibility: this.permissionsService.getPermissionsBySubModuleName(this.attendanceType == 'child' ? 'Child Management' : 'H.R Management', this.attendanceType == 'child' ? 'Attendance' : 'Staff').read
        // { buttonLabel: "Delete", type: 'delete', buttonRoute: "" },
      },
      // {
      //   buttonLabel: "Accept",
      //   type: 'comment',
      //   buttonRoute: "",
      //   isConditional: true,
      //   condition:{key: 'timeStatus', value: ['beforeTime', 'afterTime']},
      //   visibility: this.permissionsService.getPermissionsBySubModuleName(this.attendanceType == 'child' ? 'Child Management' : 'H.R Management', this.attendanceType == 'child' ? 'Attendance' : 'Staff').read
      //   // { buttonLabel: "Delete", type: 'delete', buttonRoute: "" },
      // },
      ]
    }

    this.columnHeader = this.attendanceType == 'child' ? this.columnHeaderChild : this.columnHeaderStaff;

    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: this.dataSource,
    };

    this.headerProps.searchConfig.label = this.attendanceType == 'child' ? 'Enter Child Name' : 'Enter Staff Name';
    this.isExpand = this.attendanceType == 'child' ? false : true;

    this.buttonHeaderProps.rightLabel = moment().format('dddd, DD MMMM');
    this.buttonHeaderProps.headingLabel = this.attendanceType == 'child' ? 'Attendance' : 'Staff Attendance';

    super.ngOnInit();
  }

  afterRoom()
  {
    this.rooms.unshift({label: 'All', value: 'All'});
    this.headerProps = {
      searchConfig: {
        label: this.attendanceType == 'child' ? 'Enter Child Name' : 'Enter Staff Name',
        key: 'branchId',
        value: '',
        toggleValue: false,
        onLabel: 'Show All',
        offLabel: 'Show Discrepancy'
      },
      builtInFilters: {
        key: 'branchId',
        value: localStorage.getItem('branchId')
      },
      filterArray: [{
        label: 'Select Room',
        type: 'search',
        key: 'roomId',
        selected: 'All',
        options: this.rooms
      }]
    };
  }

  afterListResponse(): void
  {
    // this.dataItems.push(this.data);
    this.dataItems.forEach(element =>
    {

     if (this.attendanceType == 'child') {
      element['highlight'] = element.timeStatus == 'afterTime'
      || element['attendance'] == 'present' && element['isBookedDay'] == false ? true  : false;
      if (element['highlight'] == true)
      {
        let rowBackgroundColor = 'rgb(255, 230, 230)'
        element['highlight'] = rowBackgroundColor
      }
      element['age'] = this.getAge(element.child);
     }
      element['timeIntoDisplay'] = element.timeIn == 0 || element.timeIn == null || element.attendance == 'absent' ? '-' : moment(new Date(element.timeIn * 1000)).format("hh:mm A");
      element['timeOuttoDisplay'] = element.timeOut == 0 || element.timeOut == null || element.attendance == 'absent' ? '-' : moment(new Date(element.timeOut * 1000)).format("hh:mm A");

      element['scheduledTimeInDisplay'] = element.scheduledTimeIn == 0 || element.scheduledTimeIn == null || element.attendance == 'absent' ? '-' : moment((element.scheduledTimeIn * 1000 + (new Date(element.scheduledTimeIn * 1000).getTimezoneOffset()*60000))).format("hh:mm A");
      element['scheduledTimeOutDisplay'] = element.scheduledTimeOut == 0 || element.scheduledTimeOut == null || element.attendance == 'absent' ? '-' : moment(element.scheduledTimeOut * 1000 + (new Date(element.scheduledTimeOut * 1000).getTimezoneOffset()*60000)).format("hh:mm A");

      if (this.attendanceType == 'child' && element['child'].dateOfBirth != 0)
      {
        element.dateOfBirth = moment(new Date(element['child'].dateOfBirth)).format(config.cmsDateFormat);
        element['room'] = element.room?.name;
        element['childName'] = element['child'].firstName + " " + element['child'].lastName;
      } else
      {
        element['staffName'] = element['staff'].firstName + " " + element['staff'].lastName;
        element['mobileNumber'] = element['staff'].mobileNumber;
        element['breakIntoDisplay'] = element.breakIn == 0 || element.breakIn == null || element.attendance == 'absent' ? '-' : moment(new Date(element.breakIn * 1000)).format("hh:mm A");
        element['breakOuttoDisplay'] = element.breakOut == 0 || element.breakOut == null || element.attendance == 'absent' ? '-' : moment(new Date(element.breakOut * 1000)).format("hh:mm A");
        element['breakType'] = element.breakType == 'offPremises' ? 'Off Premises' : element.breakType == 'onPremises' ? 'On Premises' : element.breakType == null ? '-' : '-';
      }

      if (element.attendance == 'present')
      {
        element.attendance = 'Present';
      }

      if (element.attendance == 'absent')
      {
        element.attendance = 'Absent';
      }


      if (this.attendanceType == 'staff') {


        let activeBranchId = localStorage.getItem('branchId');

        // Filtering Attendance Logs matching Staff's branch to Loggedin branch
        if(activeBranchId != element.staff.branchId)
        {
          element.staffAttendanceLog = element.staffAttendanceLog.filter(x => x.branchId ==activeBranchId);
        }
        // End


        // Special checks to either keep timeStatus before or After
          if (element.timeStatus != 'beforeTime' && element.todayBreakTimeTakenInMinutes == 0 &&
              element.todayBreakTimeAllowedInMinutes > 0 &&
              element.attendanceStatus == 'timeOut') 
          {
            element.timeStatus = 'beforeTime';
          }

          let difference = element.todayBreakTimeAllowedInMinutes - element.todayBreakTimeTakenInMinutes;

          if (element.timeStatus != 'beforeTime' && difference > 1 && element.attendanceStatus == 'timeOut') {
            element.timeStatus = 'beforeTime';
          }
        // End


        // Highlight row red for discrepancy
        if (element.timeStatus == 'beforeTime') {
          let rowBackgroundColor = 'rgb(255, 230, 230)';
          element['highlight'] = rowBackgroundColor;
        }
        //End

        // Highlight green for discrepancy
        if (element.timeStatus == 'afterTime') {
          let rowBackgroundColor = 'rgba(212, 244, 224, 1)';
          element['highlight'] = rowBackgroundColor;
        }
        //End
        
        element.createdDate = moment(new Date(element.createdDate)).format('dddd') + ' - ' + moment(new Date(element.createdDate)).format(config.cmsDateFormat);
        element['branchName'] = element.staffAttendanceLog.length != 0 ? element.staffAttendanceLog[0]?.branch?.name : '-';
        element['isSingle'] = element.staffAttendanceLog.length < 2 ? true : false;

        // Creating SignIn SignOut for Root Row
        if (element?.staffAttendanceLog?.length != 0) {
          let log = element?.staffAttendanceLog[0];
          // element['timeIntoDisplay'] = log.timeIn == 0 || log.timeIn == null || log.attendance == 'absent' ? '-' : moment(new Date(log.timeIn * 1000)).format("hh:mm A");
          // element['timeOuttoDisplay'] = log.timeOut == 0 || log.timeOut == null || log.attendance == 'absent' ? '-' : moment(new Date(log.timeOut * 1000)).format("hh:mm A");
          element['matTimeIn'] = log.timeIn ? (log.timeIn * 1000) + (new Date(log.timeIn * 1000).getTimezoneOffset()*60000) : null;
          element['matTimeOut'] = log.timeOut ? (log.timeOut * 1000) + (new Date(log.timeOut * 1000).getTimezoneOffset()*60000) : null;

          element['timeIntoDisplay'] = log.timeIn && log.attendance != 'absent' ? moment((log.timeIn * 1000) + (new Date(log.timeIn * 1000).getTimezoneOffset()*60000)).format("hh:mm A") : '-';
          element['timeOuttoDisplay'] = log.timeOut && log.attendance != 'absent' ? moment((log.timeOut * 1000) + (new Date(log.timeOut * 1000).getTimezoneOffset()*60000)).format("hh:mm A") : '-';
        }
        //End

        // Creating BreakIn BreakOut for Root Row
        if (element?.staffAttendanceLog?.length != 0 && element?.staffAttendanceLog[0]?.staffAttendanceBreaksLog?.length != 0) {
          let log = element?.staffAttendanceLog[0]?.staffAttendanceBreaksLog[0];
          // element['breakIntoDisplay'] =  log.breakIn == 0 || log.breakIn == null || log.attendance == 'absent' ? '-' : moment(new Date(log.breakIn * 1000)).format("hh:mm A");
          // element['breakOuttoDisplay'] = log.breakOut == 0 || log.breakOut == null || log.attendance == 'absent' ? '-' : moment(new Date(log.breakOut * 1000)).format("hh:mm A");
          element['matBreakIn'] = log.breakIn ? ((log.breakIn * 1000) + (new Date(log.breakIn * 1000).getTimezoneOffset()*60000)/1000) : null;
          element['matBreakOut'] = log.breakOut ? ((log.breakOut * 1000) + (new Date(log.breakOut * 1000).getTimezoneOffset()*60000)/1000) : null;
          console.log(log.breakIn);
          
          element['breakIntoDisplay'] = log.breakIn && log.attendance != 'absent' ? moment((log.breakIn * 1000) + (new Date(log.breakIn * 1000).getTimezoneOffset()*60000)).format("hh:mm A") : '-';
          element['breakOuttoDisplay'] = log.breakOut && log.attendance != 'absent' ? moment((log.breakOut * 1000) + (new Date(log.breakOut * 1000).getTimezoneOffset()*60000)).format("hh:mm A") : '-';
          element['breakType'] = log.breakType == 'offPremises' ? 'Off Premises' : log.breakType == 'onPremises' ? 'On Premises' : log.breakType == null ? '-' : '-';
        }
        //End

        let secondaryRows = [];

        element.staffAttendanceLog.forEach((log,i) => {
          // log['timeIntoDisplay'] = log.timeIn == 0 || log.timeIn == null || log.attendance == 'absent' ? '-' : moment(new Date(log.timeIn * 1000)).format("hh:mm A");
          // log['timeOuttoDisplay'] = log.timeOut == 0 || log.timeOut == null || log.attendance == 'absent' ? '-' : moment(new Date(log.timeOut * 1000)).format("hh:mm A");
          log['matTimeIn'] = log.timeIn ? (log.timeIn * 1000) + (new Date(log.timeIn * 1000).getTimezoneOffset()*60000) : null;
          log['matTimeOut'] = log.timeOut ? (log.timeOut * 1000) + (new Date(log.timeOut * 1000).getTimezoneOffset()*60000) : null;

          log['timeIntoDisplay'] = log.timeIn && log.attendance != 'absent' ? moment((log.timeIn * 1000) + (new Date(log.timeIn * 1000).getTimezoneOffset()*60000)).format("hh:mm A") : '-';
          log['timeOuttoDisplay'] = log.timeOut && log.attendance != 'absent' ? moment((log.timeOut * 1000) + (new Date(log.timeOut * 1000).getTimezoneOffset()*60000)).format("hh:mm A") : '-';
          log.createdDate = moment(new Date(log.createdDate)).format('dddd') + ' - ' + moment(new Date(log.createdDate)).format(config.cmsDateFormat);

          log['staffName'] = element['staff'].firstName + " " + element['staff'].lastName;
          log['mobileNumber'] = element['staff'].mobileNumber;
          
          // log['breakIntoDisplay'] = log.breakIn == 0 || log.breakIn == null || log.attendance == 'absent' ? '-' : moment(new Date(log.breakIn * 1000)).format("hh:mm A");
          // log['breakOuttoDisplay'] = log.breakOut == 0 || log.breakOut == null || log.attendance == 'absent' ? '-' : moment(new Date(log.breakOut * 1000)).format("hh:mm A");
          log['matBreakIn'] = log.breakIn ? (log.breakIn * 1000) + (new Date(log.breakIn * 1000).getTimezoneOffset()*60000) : null;
          log['matBreakOut'] = log.breakOut ? (log.breakOut * 1000) + (new Date(log.breakOut * 1000).getTimezoneOffset()*60000) : null;

          log['breakIntoDisplay'] = log.breakIn && log.attendance != 'absent' ? moment((log.breakIn * 1000) + (new Date(log.breakIn * 1000).getTimezoneOffset()*60000)).format("hh:mm A") : '-';
          log['breakOuttoDisplay'] = log.breakOut && log.attendance != 'absent' ? moment((log.breakOut * 1000) + (new Date(log.breakOut * 1000).getTimezoneOffset()*60000)).format("hh:mm A") : '-';
          log['breakType'] = log.breakType == 'offPremises' ? 'Off Premises' : log.breakType == 'onPremises' ? 'On Premises' : log.breakType == null ? '-' : '-';
          log['branchName'] = log['branch'].name;

      
          // Looping over Break Logs

          if (log.staffAttendanceBreaksLog.length == 0) {
            log['isFirst'] = true;
            log['breakIntoDisplay'] = '-';
            log['breakOuttoDisplay'] = '-';
            log['breakType'] = '-';

            secondaryRows.push({...log});
          } else {
            log['staffAttendanceBreaksLog'].forEach((br,i) => {

              log['isFirst'] = i == 0 ? true:  false;
              // log['breakIntoDisplay'] = br.breakIn == 0 || br.breakIn == null || br.attendance == 'absent' ? '-' : moment(new Date(br.breakIn * 1000)).format("hh:mm A");
              // log['breakOuttoDisplay'] = br.breakOut == 0 || br.breakOut == null || br.attendance == 'absent' ? '-' : moment(new Date(br.breakOut * 1000)).format("hh:mm A");
              br['matBreakIn'] = br.breakIn ? (br.breakIn * 1000) + (new Date(br.breakIn * 1000).getTimezoneOffset()*60000) : null;
              br['matBreakOut'] = br.breakOut ? (br.breakOut * 1000) + (new Date(br.breakOut * 1000).getTimezoneOffset()*60000) : null;

              log['breakIntoDisplay'] = br.breakIn && br.attendance != 'absent' ? moment((br.breakIn * 1000) + (new Date(br.breakIn * 1000).getTimezoneOffset()*60000)).format("hh:mm A") : '-';
              log['breakOuttoDisplay'] = br.breakOut && br.attendance != 'absent' ? moment((br.breakOut * 1000) + (new Date(br.breakOut * 1000).getTimezoneOffset()*60000)).format("hh:mm A") : '-';
              log['breakType'] = br.breakType == 'offPremises' ? 'Off Premises' : br.breakType == 'onPremises' ? 'On Premises' : br.breakType == null ? '-' : '-';
  
              secondaryRows.push({...log});
            });
          }

          // secondaryRows.shift();

          //End
          
          if (log.attendance == 'present')
          {
            log.attendance = 'Present';
          }
    
          if (log.attendance == 'absent')
          {
            log.attendance = 'Absent';
          }
        });
        secondaryRows.shift();
        element['secondaryData'] = secondaryRows;

      } else {
        element.createdDate = moment(new Date(element.createdDate)).format(config.cmsDateFormat);
      }

    });

    // if (this.toggleTriggered) {
    //   this.columnHeader = {
    //     'createdDate': 'Created Date',
    //     'childName': 'Child Name',
    //     'age': 'Age',
    //     'room': 'Room',
    //     'timeIntoDisplay': 'Time In',
    //     'timeOuttoDisplay': 'Time Out',
    //     // 'attendance': 'Status',
    //     'Actions': 'Actions',
    //   }

    // } else {
    //   this.columnHeader = this.attendanceType == 'child' ? this.columnHeaderChild : this.columnHeaderStaff;
    // }
    console.log(this.pagination);
    
    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: new MatTableDataSource(this.dataItems),
      pagination: this.pagination
    };

  }

  getBrekType(input)
  {
    let br = '';
    switch (input.breakType)
    {
      case 'offPremises':
        br = 'Off Premises';
        break;
      case 'onPremises':
        br = 'On Premises';
        break;
      case null:
        br = input.attendance;
        break;
    }
    return br;
  }

  actionButtonOutput(event)
  {
    console.log('actionButtonOutput ==> ', event);
    // if (this.attendanceType != 'child')
    // 	{
    //   return;
    // 	}
    if (event.item.type === "view")
    {
      let id = this.attendanceType == 'child' ? event.row.childId : event.row.staffId;
      let url = '';
      if(this.attendanceType == 'child')
      {
         url = '/main/attendance-detail/' + id + '/' + this.attendanceType;
      }
      else
      {
         url = '/main/staff-attendance-detail/' + id + '/' + this.attendanceType;
      }
      this.router.navigateByUrl(url);
    } else if (event.item.type === "edit")
    {
      if (event.row.attendance === "Absent")
      {
        this.alertService.alertError('WARNING', 'You are not allowed to edit this record.');
        return;
      }
      this.openDialog(event);
    } else if (event.item.type === "delete" || event.item.type == "comment") {
      this.removeDecrepancy(event.row.id, event.item.type, event.row);
    } else if (event.item.type === "create") {
      // dialog booking
      console.log(event);
      this.openBookingDialog(event);
    }
    else
    {
      this.openDialog(event);
    }
  }

  removeDecrepancy(id, popupType?,Data?) {

    let title = popupType == 'delete' ? 'CONFIRMATION' : 'YOUR COMMENT HERE';
    let message = popupType == 'delete' ? 'Reason for Discrepancy Removal ?' : '';
    let reqType = this.attendanceType == 'child' ? 'post': 'patch';
    let textData = popupType == 'comment' ? Data.note : ''; 
    let data;
    let url;
    
    this.alertService.alertAsk(title, message, 'Submit', 'Cancel',true, textData).then((res: any)=>{
      console.log(res);
      if (res) {
        // let data = {attendaceIds: [{id: id, note: res }]};

        if (this.attendanceType == 'child') {
          data = {attendaceIds: [{id: id, note: res }]};
          url = config.base_url_slug + `remove/child/attendance/discrepancy`;
        } else {
          data =  {note: res, type: popupType == 'delete' ? 'discrepancyRemoved': 'comment'}
          url = config.base_url_slug + `update/staff-member/attendance-addnote/${id}`;
        } 

        this.apiService[reqType](url,data).then((res)=> {
          console.log(res);
          if (res.code == 200 || res.code == 201) {
            let msg = popupType == 'delete' ? 'Discrepancy Successfully Removed' : 'Comment Added Successfully'
            this.alertService.alertSuccess('SUCCESS', msg);
            this.getList(this.filterUrl);
          }
        })
        .catch(err => console.log(err));
      }
      })
  }

  openBookingDialog(event) {
    const dialogRef = this.dialog.open(BookingDetailComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      width: '70%',
    });

    let child = event.row.child;
    dialogRef.componentInstance.isAttendancePopup = true;
    dialogRef.componentInstance.type = 'new';
    dialogRef.componentInstance.data = {id: child.id,  name: event.row.childName, roomId: event.row.roomId, dateOfBirth: child.dateOfBirth};

    dialogRef.afterClosed().subscribe(result =>
    {
      // if (result && result.status == "success")
      // {
      //   if (result.type == "edit")
      //   {
          this.getList(this.filterUrl);
      //   }
      // }
    });
  }

  openDialog(event): void
  {
    let dialogComp: any = this.attendanceType == 'child' ? AttendanceDialogComponent : StaffAttendanceDialogComponent;
    const dialogRef = this.dialog.open(dialogComp, {
      autoFocus: false,
      maxHeight: '90vh',
      width: this.attendanceType == 'child' ? '30%' : '75%',
      data: {
        event: event,
        type: this.attendanceType
      }
    });

    dialogRef.afterClosed().subscribe(result =>
    {
      if (result && result.status == "success")
      {
        if (result.type == "edit")
        {
          this.getList(this.filterUrl);
        }
      }
    });
  }

  openAddAttendanceDialog() {
    
    const dialogRef = this.dialog.open(AddAttendanceDialogComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      width: '75%',
      data: {
        event: event,
        type: this.attendanceType
      }
    });

    dialogRef.afterClosed().subscribe(result =>
    {
      if (result && result.status == "success")
      {
        if (result.type == "edit")
        {
          this.getList(this.filterUrl);
        }
      }
    });
    
  }

  filnalFilters(event): void
  {
    let filterUrl = '';
    console.log(event);
    
    event.filter.forEach((element) =>
    {
      if (element.key == 'branchId')
      {
        filterUrl = filterUrl + element.key + '=' + element.value;
      }
      else
      {
        filterUrl = filterUrl + '&' + element.key + '=' + element.value;
      }
    });
    if (event.range)
    {
      filterUrl = filterUrl + event.range;

      console.log(event);

       this.rangeStart = moment(event.startDateValue).format(config.cmsDateFormat);
       this.rangeEnd = moment(event.endDateValue).format(config.cmsDateFormat);

       if(this.attendanceType == 'staff')
       {
        // this.buttonHeaderProps.rightLabel =   moment(this.rangeStart).format('dddd, DD MMMM') + ' - ' + moment( this.rangeEnd).format('dddd, DD MMMM');
        this.buttonHeaderProps.rightLabel =  this.rangeStart + ' - ' + this.rangeEnd;
       }

    }
    else
    {
      let startDate = this.date.startOf('day').format(config.serverDateFormat);
      let endDate = this.date.endOf('day').format(config.serverDateFormat);

      filterUrl = filterUrl + '&startDate=' + startDate + '&endDate=' + endDate;

      this.buttonHeaderProps.rightLabel = moment().format('dddd, DD MMMM');
    }
    if (event.search)
    {
      filterUrl = filterUrl + event.search;
    }
    if (event.date)
    {
      filterUrl = filterUrl + event.date;
    }

    if (event.toggle)
    {
      filterUrl = filterUrl + '&timeStatus=' + (this.attendanceType == 'child' ? 'afterTime' : 'beforeTime');
      this.toggleTriggered = true;
    } else {
      this.toggleTriggered = false;
    }

    console.log('filnalFilters', event, filterUrl);
    this.getList(filterUrl);
  }

  discrepancyHandle(event) {
    console.log(event);
    this.toggle = event;

    // this.listApi = '';
    // if (this.attendanceType == 'child')
    // {
    //   this.listApi = config.base_url_slug + 'view/childs/attendance';
    // } else
    // {
    //   this.listApi = config.base_url_slug + 'view/staff/attendance';
    // }
    // let param = '';
    // switch (this.toggle) {
    //   case true:
    //      param = '&timeStatus=aftertime';
    //   break;

    //   default:
    //     param = '';
    //   break;
    // }

    this.getList(this.filterUrl);
  }

  getAge(element) {
    if (element.dateOfBirth)
    {
      var currentMoment = moment(new Date());
      var dobMoment = moment(new Date(element.dateOfBirth));
      
      let years = currentMoment.diff(dobMoment, 'years');
      dobMoment.add(years, 'years')

      let months = currentMoment.diff(dobMoment, 'months');
      dobMoment.add(months, 'months');

      // var days = currentMoment.diff(dobMoment, 'days');

      // console.log("days", days);
      
      let y = years != 0 && !isNaN(years) ? years + ' year(s)' : '';
      let m = months != 0 && !isNaN(months) ? months + ' month(s)' : '';
      // let d = days != 0 && !isNaN(days) ? days + ' day(s)' : '';
      
      let age = y == '' && m == '' ? '-' : y + ' ' + m;
      // let dob = moment(new Date(element.dateOfBirth)).format(config.cmsDateFormat);
      // element.dateOfBirth = dob == 'Invalid date' ? '-' : dob;
      return age;
    }
  }

  sortColumn(e) {

		this.sortBy = e.field;

    if (e.field == 'childName') {
			this.sortBy = 'firstName';
		}

		if (e.field == 'room') {
			this.sortBy = 'roomId';
		}

    if (e.field == 'age') {
			this.sortBy = 'dateOfBirth';
		}

    if (e.field == 'timeIntoDisplay') {
			this.sortBy = 'timeIn';
		}

    if (e.field == 'timeOuttoDisplay') {
			this.sortBy = 'timeOut';
		}
		  
		this.sortUrl = `&sortBy=${this.sortBy}&sortOrder=${e.order}`;
		this.getList(this.filterUrl);
	}

  ngOnDestroy(): void
  {
    this.sub.unsubscribe();
  }
}
