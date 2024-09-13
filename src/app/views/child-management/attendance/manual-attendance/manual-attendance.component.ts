import { BookingDetailComponent } from 'src/app/views/child-management/child-booking/add-booking/booking-detail/booking-detail.component';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { config } from 'src/config';

import { Subscription } from 'rxjs';
import { AddManualAttendanceDialogComponent } from './add-manual-attendance-dialog/add-manual-attendance-dialog.component';
import { ChildAttendanceDialogComponent } from './child-attendance-dialog/child-attendance-dialog.component';
@Component({
  selector: 'app-manual-attendance',
  templateUrl: './manual-attendance.component.html',
  styleUrls: ['./manual-attendance.component.scss']
})
export class ManualAttendanceComponent extends GlobalListComponent implements OnInit
{
  sub: Subscription;
  attendanceType: any = 'child';
  tableConfigAndProps = {};
  dataSource = new MatTableDataSource();
  layoutAlign = "start start";
  columnHeader = {};
  public date = moment();
  toggle = false;
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
    // 'createdAt': 'Created Date',
    'childName': 'Child Name',
    'age': 'Age',
    'room': 'Room',
    'session': 'Session',
    'timeIntoDisplay': 'Time In',
    'timeOuttoDisplay': 'Time Out',
    'note': 'Note',
    'attendanceStatus': 'Status',
    'discrepancy': 'Discrepancy',
    'Actions': 'Actions',
    'expand': '',
  };


  attendanceHeaderChild = {
    'room': 'Room',
    'session': 'Session',
    'timeIn': 'Time In',
    'timeOut': 'Time Out',
    'attendanceStatus': 'Status',
    'discrepancy': 'Discrepancy',
    'Actions': 'Actions',
  };
  buttonHeaderProps = {
    headingLabel: "Attendance",
    hasRightLabel: true,
    rightLabel: "date time",
    hasButton: false,
    hasHeading: true,
    labelMargin: '0px',
    float: 'right',
    textclass: 'text-bolder text-color',
    buttonsMargin: '0px 10px 0px',
    margin: '10px',
  };

  sortBy = '';
  sortOrder = '';
  rangeStart: any;
  rangeEnd: any;
  attributes: any;
  defaultAttributes: any;
  attendanceDate: any;
  roomId: any;
  isClearAllFilters: boolean = false;
  constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected dialog: MatDialog,
    protected permissionsService: PermissionService)
  {
    super(router, apiService, alertService, permissionsService);
    this.listApi = config.base_url_slug;
    this.sortBy = 'firstName';
    this.sortOrder = 'ASC'
    this.sub = this._route.params.subscribe(params =>
    {
      if (params['type'])
      {
        this.attendanceType = params['type'];
      }
      let attendanceDate = moment(new Date()).format(config.serverDateFormat)
      this.attributes = `[{"key": "attendanceDate", "value": "${attendanceDate}"}, {"key": "platform","value": "web" },{"key": "branchId","value": ${localStorage.getItem('branchId')} }]`
      this.listApi = `${config.base_url_slug}view/child/attendance?attributes=${this.attributes}&sortBy=${this.sortBy}&sortOrder=${this.sortOrder}`;
      this.defaultAttributes = this.attributes;
    });

    this.getRoomsforDropdown(localStorage.getItem('branchId'));
    this.getSessionsForDropdown(localStorage.getItem('branchId'));

    if (this.attendanceType == 'child')
    {
      this.actionButtons = [
        // {
        //   buttonLabel: "Create",
        //   type: 'create',
        //   buttonRoute: "",
        //   isConditional: true,
        //   condition: { key: 'timeStatus', value: 'afterTime' },
        //   visibility: this.permissionsService.getPermissionsBySubModuleName(this.attendanceType == 'child' ? 'Child Management' : 'H.R Management', this.attendanceType == 'child' ? 'Attendance' : 'Staff').read
        // },
        {
          buttonLabel: "Add Attendance",
          type: 'add',
          buttonRoute: "",
          visibility: this.permissionsService.getPermissionsBySubModuleName(this.attendanceType == 'child' ? 'Child Management' : 'H.R Management', this.attendanceType == 'child' ? 'Attendance' : 'Staff').update
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
          condition: { key: 'isDiscrepantRow', value: true },
          visibility: this.permissionsService.getPermissionsBySubModuleName(this.attendanceType == 'child' ? 'Child Management' : 'H.R Management', this.attendanceType == 'child' ? 'Attendance' : 'Staff').read
        },
        {
          buttonLabel: "Create", type: 'create', isConditional: true,
          condition: { key: 'isAbletoCreateSession', value: true }, buttonRoute: "", visibility: this.permissionsService.getPermissionsByModuleName('Session Management').create
        },
        {
          buttonLabel: "View Note", type: 'note', isConditional: true,
          condition: { key: 'isNotePresent', value: true }, buttonRoute: "", visibility: true
        },
        // { buttonLabel: "Delete", type: 'delete', buttonRoute: "" },
      ]
    }

    this.columnHeader = this.columnHeaderChild;

    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: this.dataSource,
    };

    this.headerProps.searchConfig.label = 'Enter Child Name';

    this.buttonHeaderProps.rightLabel = moment().format('dddd, DD MMMM');
    this.buttonHeaderProps.headingLabel = 'Attendance';

    super.ngOnInit();
    // this.openDialog("Testing");
  }

  afterRoom()
  {
    this.rooms.unshift({ label: 'All', value: 'All' });
    this.headerProps = {
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
      },
      {
        label: 'Select Session',
        type: 'search',
        key: 'sessionId',
        selected: 'All',
        options: this.sessions
      }]
    };
  }

  afterSession(): void
  {
    this.headerProps.filterArray[1].options = this.sessions;
    this.sessions.unshift({ label: 'All', value: 'All' });
  }

  afterListResponse(): void
  {
    this.dataItems.forEach(element =>
    {
      element['isSingle'] = element.Attendance.length < 2 ? true : false;
      element['isDiscrepantRow'] = false;
      element['isAbletoCreateSession'] = false;
      element['isNotePresent'] = false;
      element['longNote'] = false;

      if (this.attendanceType == 'child' && element.dateOfBirth != 0)
      {
        element['age'] = this.getAge(element);
        element.dateOfBirth = moment(new Date(element.dateOfBirth)).format(config.cmsDateFormat);
        element['room'] = element.room?.name;
        element['childName'] = element.firstName + " " + element.lastName;
      }

      // Creating BreakIn BreakOut for Root Row
      if (element?.Attendance?.length != 0)
      {
        let attendance = element?.Attendance[0];
        element['room'] = attendance.room?.name;
        element['discrepancy'] = attendance.discrepancy
        element['attendanceStatus'] = attendance.attendance ? attendance.attendance.charAt(0).toUpperCase() + attendance.attendance.slice(1) : '-';
        let endTime = attendance.session ? moment(attendance.session.endTime * 1000 + new Date(attendance.session.endTime * 1000).getTimezoneOffset()*60000).format("hh:mm A") : ''
        let startTime = attendance.session ? moment(attendance.session.startTime * 1000 + new Date(attendance.session.startTime * 1000).getTimezoneOffset()*60000).format("hh:mm A") : ''
        element['session'] = attendance.session?.name;
        element['sessionTime'] = startTime ? '(' + startTime + '-' + endTime + ')' : '';
        element['timeIntoDisplay'] = attendance.timeIn ? moment((attendance.timeIn * 1000 + new Date(attendance.timeIn * 1000).getTimezoneOffset()*60000)).format("hh:mm A") : '-';
        element['timeOuttoDisplay'] = attendance.timeOut ? moment((attendance.timeOut * 1000 + new Date(attendance.timeOut * 1000).getTimezoneOffset()*60000)).format("hh:mm A") : '-';
        // element['discrepancy'] = attendance.discrepancy ? attendance.discrepancy : '-';
        element['createdAt'] = attendance.createdDate != null ? moment(new Date(attendance.createdDate)).format(config.cmsDateFormat) : moment(new Date()).format(config.cmsDateFormat);
        element['oldDate'] = attendance.createdDate != null ? attendance.createdDate : moment(new Date()).format(config.serverDateFormat);
        element['discrepancyNote'] = attendance.discrepancyNote
        if (attendance.note)
        {
          element['isNotePresent'] = true;
          if (attendance.note.length > 30)
          {
            element['showNote'] = attendance.note
            element['note'] = attendance.note.substring(0, 17) + '...';
            element['longNote'] = true;
          }
          else
          {
            element['note'] = attendance.note;
          }
        }
        this.attendanceDate = element.createdDate

      }
      else
      {
        element['createdDate'] = moment(new Date()).format(config.cmsDateFormat);
        element['oldDate'] = moment(new Date()).format(config.serverDateFormat);
        this.attendanceDate = element.oldDate
      }
      //End
      if (element.discrepancy && element.discrepancy != "Discarded")
      {
        let rowBackgroundColor = 'rgb(255, 230, 230)'
        element['highlight'] = rowBackgroundColor;
        element['isDiscrepantRow'] = true
        if (!element.session)
        {
          element['isAbletoCreateSession'] = true;
        }
      }
      if (element.discrepancy && element.discrepancy == "Came Early")
      {
        element['discrepancy'] = "Early Drop-off"
      }
      let secondaryRows = [];

      element.Attendance.forEach((log, i) =>
      {
        log['longNote'] = false;
        log['isNotePresent'] = false;
        if (log.note)
        {
          log['isNotePresent'] = true;
          if (log.note.length > 30)
          {
            log['showNote'] = log.note
            log['note'] = log.note.substring(0, 17) + '...';
            log['longNote'] = true
          }
        }
        log['isDiscrepantRow'] = false;
        log['isAbletoCreateSession'] = false;
        log['attendanceStatus'] = log.attendance ? log.attendance.charAt(0).toUpperCase() + log.attendance.slice(1) : '-';
        if (log.discrepancy && log.discrepancy != "Discarded")
        {
          let rowBackgroundColor = 'rgb(255, 230, 230)'
          log['highlight'] = rowBackgroundColor
          log['isDiscrepantRow'] = true
          if (!log.session)
          {
            log['isAbletoCreateSession'] = true;
          }
        }
        if (log.discrepancy && log.discrepancy == "Came Early")
        {
          log['discrepancy'] = "Early Drop-off"
        }
        log['dob'] = element.dateOfBirth;
        log['room'] = log.room?.name;
        // log['session'] = log.session?.name;
        let endTime = log.session ? moment(log.session.endTime * 1000 + new Date(log.session.endTime * 1000).getTimezoneOffset()*60000).format("hh:mm A") : ''
        let startTime = log.session ? moment(log.session.startTime * 1000 + new Date(log.session.startTime * 1000).getTimezoneOffset()*60000).format("hh:mm A") : ''
        log['session'] = log.session?.name;
        log['sessionTime'] = startTime ? '(' + startTime + '-' + endTime + ')' : false
        log['timeIntoDisplay'] = log.timeIn ? moment((log.timeIn * 1000 + new Date(log.timeIn * 1000).getTimezoneOffset()*60000)).format("hh:mm A") : '-';
        log['timeOuttoDisplay'] = log.timeOut ? moment((log.timeOut * 1000 + new Date(log.timeOut * 1000).getTimezoneOffset()*60000)).format("hh:mm A") : '-';
        // log['discrepency'] = "Late arrive";
        log['oldDate'] = log.createdDate != null ? moment(new Date(log.createdDate)).format(config.serverDateFormat) : moment(new Date()).format(config.serverDateFormat);
        log['createdDate'] = log.createdDate != null ? moment(new Date(log.createdDate)).format(config.cmsDateFormat) : moment(new Date()).format(config.cmsDateFormat);
        log['ChildName'] = element.firstName + " " + element.lastName;
        this.attendanceDate = log.oldDate;

        secondaryRows.push(log);

      })

      // if (element.attendance == 'present')
      // {
      //   element.attendance = 'Present';
      // }

      // if (element.attendance == 'absent')
      // {
      //   element.attendance = 'Absent';
      // }
      secondaryRows.shift();
      element['secondaryData'] = secondaryRows;
      // element.createdDate = moment(new Date(element.createdDate)).format(config.cmsDateFormat);
    });

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

    if (event.item.type === "view")
    {
      let id = event.row.id ? event.row.id : event.row.childId;
      let url = '';
      if (this.attendanceType == 'child')
      {
        url = '/main/attendance-detail/' + id + '/' + this.attendanceType + '?attendanceDate=' + this.attendanceDate;
      }
      this.router.navigateByUrl(url);
    } else if (event.item.type === "edit")
    {
      if (event.row.attendance === "Absent")
      {
        this.alertService.alertError('WARNING', 'You are not allowed to edit this record.');
        return;
      }
      if (event.row.Attendance)
      {
        let singleAttendance = event.row.Attendance[0];
        event.row.Attendance = [singleAttendance];
        this.openDialog(event);
      }
      else
      {
        this.openDialog(event);
      }
    }
    else if (event.item.type === 'add')
    {
      let singleAttendance = event.row.Attendance ? event.row.Attendance[0] : event.row;
      if (event.row.Attendance)
      {
        event.row.Attendance = [singleAttendance];
      }
      this.openAddAttendanceDialog(event);
    }
    else if (event.item.type === "delete" || event.item.type == "comment")
    {
      let id = event.row?.Attendance?.length > 0 ? event.row?.Attendance[0].attendanceId : event.row.attendanceId
      this.removeDecrepancy(id, event.item.type, event.row);
    } else if (event.item.type === "create")
    {
      this.openBookingDialog(event);
    }
    else if (event.item.type === "note")
    {
      let note = event.row.note ? event.row.note : event.row.Attendance[0].note
      this.alertService.alertInfo("Note", note);
    }
    else
    {
      this.openDialog(event);
    }
  }

  removeDecrepancy(id, popupType?, Data?)
  {

    let title = popupType == 'delete' ? 'CONFIRMATION' : 'YOUR COMMENT HERE';
    let message = popupType == 'delete' ? 'Reason for Discrepancy Removal ?' : '';
    let reqType = this.attendanceType == 'child' ? 'post' : 'patch';
    let textData = popupType == 'comment' ? Data.note : '';
    let data;
    let url;

    this.alertService.alertAsk(title, message, 'Submit', 'Cancel', true, textData).then((res: any) =>
    {
      if (res)
      {
        if (this.attendanceType == 'child')
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
            // let attendanceDate = moment(new Date()).format(config.serverDateFormat)
            this.attributes = `[{"key": "attendanceDate", "value": "${this.attendanceDate}"}, {"key": "platform","value": "web" },{"key": "branchId","value": ${localStorage.getItem('branchId')} }]`
            this.listApi = `${config.base_url_slug}view/child/attendance?attributes=${this.attributes}&sortBy=${this.sortBy}&sortOrder=${this.sortOrder}`;
            this.getList();
          }
        })
          .catch(err => console.log(err));
      }
    })
  }

  openBookingDialog(event)
  {
    const dialogRef = this.dialog.open(BookingDetailComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      width: '70%',
    });

    let child = event.row;
    let dateOfBirth = child.dob ? child.dob : child.dateOfBirth
    let childName = event.row.ChildName ? event.row.ChildName : event.row.childName
    let childId = child.childId ? child.childId : child.id
    let attendanceId = child.attendanceId ? child.attendanceId : child.Attendance[0].attendanceId

    dialogRef.componentInstance.isAttendancePopup = true;
    dialogRef.componentInstance.useCustomeMargin = false;
    dialogRef.componentInstance.attendanceDate = child.oldDate;
    dialogRef.componentInstance.type = 'new';
    dialogRef.componentInstance.data = { id: childId, name: childName, roomId: event.row.roomId, dateOfBirth: dateOfBirth, bookingType: 'adhoc_session', attendanceId: attendanceId };

    dialogRef.afterClosed().subscribe(result =>
    {
      this.getList(this.filterUrl);
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
        type: this.attendanceType
      }
    });

    dialogRef.afterClosed().subscribe(result =>
    {
      // if (result && result.status == "success")
      // {
      if (result.type == "edit")
      {
        this.getList(this.filterUrl);
      }
      // }
    });
  }

  openAddAttendanceDialog(event?)
  {
    const dialogRef = this.dialog.open(AddManualAttendanceDialogComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      width: '75%',
      data: {
        event: event,
        type: this.attendanceType
      }
    });
    this.roomId = event?.row?.Attendance ? event.row.Attendance[0].roomId : event?.row?.roomId ? event.row.roomId : this.roomId;
    if (this.roomId)
    {
      dialogRef.componentInstance.roomId = this.roomId
    }
    if (this.attendanceDate)
    {
      dialogRef.componentInstance.attendanceDate = this.attendanceDate
    }
    if (event)
    {
      dialogRef.componentInstance.disbaledFields = true
    }

    dialogRef.afterClosed().subscribe(result =>
    {
      this.getList(this.filterUrl);
    });

  }

  filnalFilters(event): void
  {
    let filterUrl = '';
    if (this.isClearAllFilters)
    {
      this.attributes = this.defaultAttributes;
      this.roomId = '';
    }
    else
    {
      let roomId, childName, date, discrepancyValue, sessionId;
      let attr = JSON.parse(this.attributes);

      let roomSelected = event.filter.filter(el => el.key == "roomId")
      let roomInAttributes = attr.filter(e => e.key === 'roomId')
      let sessionSelected = event.filter.filter(el => el.key == "sessionId")
      let sessionInAttributes = attr.filter(e => e.key === 'sessionId')
      console.log("roomSelected", roomSelected);

      if (roomSelected.length > 0 && roomInAttributes.length == 0)
      {
        let object = { "key": "roomId", "value": roomSelected[0].value }
        attr.push(object)
      }
      else
      {
        if (roomSelected.length > 0)
        {
          roomId = roomSelected[0].value
        }
      }

      //for adding or removing session filter in attributes
      if (sessionSelected.length > 0 && sessionInAttributes.length == 0)
      {
        let object = { "key": "sessionId", "value": sessionSelected[0].value }
        attr.push(object)
      }
      else
      {
        if (sessionSelected.length > 0)
        {
          sessionId = sessionSelected[0].value
        }
      }

      // for adding or removing childName Attribute
      let found = attr.filter(e => e.key === 'childName')
      if (found.length > 0)
      {
        if (event.searchValue != '')
        {
          childName = event.searchValue;
        }
        else
        {
          attr.splice(attr.findIndex(e => e.key === 'childName'), 1);
        }
      }
      else
      {
        if (event.searchValue)
        {
          let object = { "key": "childName", "value": event.searchValue }
          attr.push(object)
        }
      }

      event.filter.forEach((element) =>
      {
        if (element.key == "roomId")
        {
          roomId = element.value;
        }
        if (element.key == "sessionId")
        {
          sessionId = element.value;
        }
        if (element.key != 'branchId' && element.key != "roomId" && element.key != "sessionId")
        {
          filterUrl = filterUrl + '&' + element.key + '=' + element.value;
        }
      });
      if (event.range)
      {
        filterUrl = filterUrl + event.range;

        this.rangeStart = moment(event.startDateValue).format(config.cmsDateFormat);
        this.rangeEnd = moment(event.endDateValue).format(config.cmsDateFormat);
      }
      else
      {
        this.buttonHeaderProps.rightLabel = moment().format('dddd, DD MMMM');
      }
      if (event.search)
      {
      }
      if (event.date)
      {
        date = event.date.substring(6);
        this.buttonHeaderProps.rightLabel = moment(new Date(date)).format('dddd, DD MMMM');
      }

      // for adding or removing discrepancy from attributes
      let foundDiscrepancy = attr.filter(e => e.key === 'discrepancy')
      if (foundDiscrepancy.length > 0)
      {
        if (event.toggle)
        {
          discrepancyValue = event.toggle;
        }
        else
        {
          attr.splice(attr.findIndex(e => e.key === 'discrepancy'), 1);
        }
      }
      else
      {
        if (event.toggle)
        {
          let object = { "key": "discrepancy", "value": event.toggle }
          attr.push(object)
        }
      }

      attr.forEach(el =>
      {
        if (el.key == "attendanceDate")
        {
          el.value = date ? date : moment(new Date()).format(config.serverDateFormat);
          this.attendanceDate = date ? date : moment(new Date()).format(config.serverDateFormat);
        }
        if (el.key == "childName")
        {
          el.value = childName ? childName : event.searchValue;
        }
        if (el.key == "roomId")
        {
          if (roomSelected.length != 0)
          {
            el.value = roomId;
            this.roomId = roomId;
          } else
          {
            attr.splice(attr.findIndex(e => e.key === 'roomId'), 1);
          }
        }

        if (el.key == "sessionId")
        {
          if (sessionSelected.length != 0)
          {
            el.value = sessionId;
          } else
          {
            attr.splice(attr.findIndex(e => e.key === 'sessionId'), 1);
          }
        }
        if (el.key == "discrepancy")
        {
          el.value = discrepancyValue ? discrepancyValue : event.toggle;
        }
      });

      this.attributes = JSON.stringify(attr);
    }
    this.listApi = `${config.base_url_slug}view/child/attendance?attributes=${this.attributes}&sortBy=${this.sortBy}&sortOrder=${this.sortOrder}`;
    this.getList(filterUrl);
    this.isClearAllFilters = false;
  }

  discrepancyHandle(event)
  {
    this.toggle = event;
    this.getList(this.filterUrl);
  }

  getAge(element)
  {
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

  ngOnDestroy(): void
  {
    this.sub.unsubscribe();
  }
  clearAllFilters(event: any)
  {
    console.log("clear all ", event);
    this.isClearAllFilters = true;
    this.buttonHeaderProps.rightLabel = moment().format('dddd, DD MMMM');
  }
}
