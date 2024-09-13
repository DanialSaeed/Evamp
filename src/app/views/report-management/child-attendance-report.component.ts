import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { config } from 'src/config';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { AttendanceDialogComponent } from '../child-management/attendance/attendance-dialog/attendance-dialog.component';

@Component({
    selector: 'app-child-attendance-report.component',
    templateUrl: './child-attendance-report.component.html',
    styleUrls: ['./child-attendance-report.component.scss', '/src/app/views/shared-style.scss']
})
export class ChildAttendanceReportComponent extends GlobalListComponent implements OnInit {
    tableConfigAndProps = {};
    dataSource = new MatTableDataSource();
    layoutAlign = "start start";
    columnHeader = {};
    buttonHeaderProps: any;

    headerProps = {
      searchConfig: {
        label: 'Enter Child Name',
        key: 'branchId',
        value: ''
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
      }, ],
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
    public date = moment();

    constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected dialog: MatDialog,
      protected permissionsService: PermissionService) {
      super(router, apiService, alertService, permissionsService);

      this.listApi = config.base_url_slug+ 'view/childs/attendance';
      this.getRoomsforDropdown(localStorage.getItem('branchId'));

      this.headerButtons = [
    	{ buttonLabel: "Preview Pdf", color: "#E2AF2A", buttonRoute: "additional-items/add", isMultiple: true, firstFormName: 'select-children', visibility: true },
    ];
    this.buttonHeaderProps = {
      headingLabel: "Children Attendance",
      hasRightLabel: false,
      rightLabel: "date time",
      // ActionButtons: this.headerButtons,
      hasButton: true,
      hasHeading: true,
      labelMargin: '0px',
      float: 'right',
      textclass: 'text-bolder text-color',
      buttonsMargin: '0px 10px 0px',
      margin: '10px',
      // builtInFilters: { key: 'branchId', value: localStorage.getItem('branchId') }
    };
      this.actionButtons = [
        {
          buttonLabel: "Edit",
          type: 'edit',
          buttonRoute: "",
          visibility: this.permissionsService.getPermissionsBySubModuleName('H.R Management', 'Attendance').update
        },
        {
          buttonLabel: "View",
          type: 'view',
          buttonRoute: "",
          visibility: this.permissionsService.getPermissionsBySubModuleName('H.R Management', 'Attendance').read
        },
      ]

      this.columnHeader = {
        'id': 'ID',
        'childName': 'Child Name',
        'dateOfBirth': 'DOB',
        'age': 'Age',
        'room': 'Room',
        'timeIntoDisplay': 'Time In',
        'timeOuttoDisplay': 'Time Out',
        // 'session': 'Session',
        'createdDate': 'Date',
        'Actions': 'Actions',
      };

      this.tableConfigAndProps = {
        ActionButtons: this.actionButtons,
        inputData: this.inputData,
        columnHeader: this.columnHeader,
        dataSource: this.dataSource,
      };

      this.headerProps.searchConfig.label = 'Search by Name';

      super.ngOnInit();
    }

    afterRoom() {
      this.rooms.unshift({label: 'All', value: 'All'});
      this.headerProps = {
        searchConfig: {
          label:'Enter Child Name',
          key: 'branchId',
          value: ''
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

    afterListResponse(): void {
      this.dataItems.forEach(element => {

        element['highlight'] = element.timeStatus == 'afterTime'
        || element['attendance'] == 'present' && element['isBookedDay'] == false ? true : false;
        if (element['highlight'] == true)
        {
          let rowBackgroundColor = 'rgb(255, 230, 230)'
          element['highlight'] = rowBackgroundColor
        }
        element['timeIntoDisplay'] = element.timeIn == 0 || element.timeIn == null || element.attendance == 'absent' ? '-' : moment(new Date(element.timeIn * 1000)).format("hh:mm A");
        element['timeOuttoDisplay'] = element.timeOut == 0 || element.timeOut == null || element.attendance == 'absent' ? '-' : moment(new Date(element.timeOut * 1000)).format("hh:mm A");

        element['room'] = element.room?.name;
        element['childName'] = element['child'].firstName + " " + element['child'].lastName;

        if (element['child'].dateOfBirth != 0)
        {
            var currentMoment = moment(new Date());
            var dobMoment = moment(new Date(element['child'].dateOfBirth));

            let years = currentMoment.diff(dobMoment, 'years');
            dobMoment.add(years, 'years');

            let months = currentMoment.diff(dobMoment, 'months');
            dobMoment.add(months, 'months');

            let y = years != 0 && !isNaN(years) ? years + ' year(s)' : '';
            let m = months != 0 && !isNaN(months) ? months + ' month(s)' : '';
            element['age'] = y == '' && m == '' ? '-' : y + ' ' + m;
        }

        element.dateOfBirth = moment(new Date(element['child'].dateOfBirth)).format(config.cmsDateFormat);
        element.createdDate = moment(new Date(element.createdDate)).format(config.cmsDateFormat);

        if (element.attendance == 'present') {
          element.attendance = 'Present';
        }

        if (element.attendance == 'absent') {
          element.attendance = 'Absent';
        }
      });

      this.tableConfigAndProps = {
        ActionButtons: this.actionButtons,
        inputData: this.inputData,
        columnHeader: this.columnHeader,
        dataSource: new MatTableDataSource(this.dataItems),
        pagination: this.pagination
      };
    }

    getBrekType(input) {
      let br = '';
      switch (input.breakType) {
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

    actionButtonOutput(event) {
      console.log('actionButtonOutput ==> ', event);
      if (event.item.type === "view") {
        let id = event.row.childId;
        let url = '/main/attendance-detail/' + id + '/child';
        this.router.navigateByUrl(url);
      } else if (event.item.type === "edit") {
        if (event.row.attendance === "Absent") {
          this.alertService.alertError('WARNING', 'You are not allowed to edit this record.');
          return;
        }
        this.openDialog(event);
      } else {
        // this.openDialog(event);
      }
    }

    openDialog(event): void {
      const dialogRef = this.dialog.open(AttendanceDialogComponent, {
        autoFocus: false,
        maxHeight: '90vh',
        width: '30%',
        data: {
          event: event,
          type: 'child'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && result.status == "success") {
          if (result.type == "edit") {
            this.getList(this.filterUrl);
          }
        }
      });
    }

    filnalFilters(event): void {
      let filterUrl = '';
      // move branch id in otherAttributes
      // let _otherAttributes = [];
      // if (event.date) {
      //   const urlParams = new URLSearchParams(event.date);
      //   const dt = urlParams.get('date');
      //   event.filter.push({
      //     'key': 'createdDate',
      //     'value': dt
      //   });
      // } else {
      //   event.filter.push({
      //     'key': 'createdDate',
      //     'value': moment(new Date).format(config.serverDateFormat)
      //   });
      // }

      // let _attributes = [];
      // event.filter.forEach((element) => {
      //   if (element.key == 'branchId' || element.key == 'createdDate' || element.key == 'roomId') {
      //     _attributes.push(element);
      //   }
      // })

      // filterUrl = "&attributes=" + JSON.stringify(_attributes);
      event.filter.forEach((element) => {
        if (element.key == 'branchId') {
          filterUrl = filterUrl + element.key+'='+element.value;
        }
        else
        {
          filterUrl = filterUrl +'&'+element.key+'='+element.value;
        }
      });
      if (event.sort) {
        filterUrl = filterUrl + event.sort;
      }

      if (event.range) {
        filterUrl = filterUrl + event.range;
      }
      else
      {
        let startDate = this.date.startOf('day').format(config.serverDateFormat);
        let endDate = this.date.endOf('day').format(config.serverDateFormat);
        filterUrl = filterUrl + '&startDate='+startDate+'&endDate='+endDate;
      }

      if (event.search) {
        filterUrl = filterUrl + event.search;
      }

      if (event.date) {
        filterUrl = filterUrl + event.date;
      }

      // filterUrl = filterUrl + "&otherAttributes=" + JSON.stringify(_otherAttributes);
      this.getList(filterUrl);
    }
  }
