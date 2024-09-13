import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { fromEvent, Observable } from 'rxjs';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { config } from 'src/config';
import { AttendanceDialogComponent } from '../../child-management/attendance/attendance-dialog/attendance-dialog.component';

import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';
import { FormControl } from '@angular/forms';
import {map, startWith, tap} from 'rxjs/operators';
import { type } from 'os';
import * as momentTz from 'moment';

@Component({
  selector: 'app-staff-attendance-report',
  templateUrl: './staff-attendance-report.component.html',
  styleUrls: ['./staff-attendance-report.component.scss', '/src/app/views/shared-style.scss']
})
export class StaffAttendanceReportComponent extends GlobalListComponent implements OnInit, AfterViewInit {

  tableConfigAndProps = {};
    // dataSource = new MatTableDataSource();
    layoutAlign = "start start";
    columnHeader = {};
    buttonHeaderProps: any;
    public date = moment();

    // Mat chips variables
    filteredStaff: Observable<any[]>;
    selectedStaffs: string[] = [];
    allFruits: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];
    allStaffList: any[] = [];
    @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto') matAutocomplete: MatAutocomplete;
    @ViewChild(MatAutocompleteTrigger, {static: false}) trigger: MatAutocompleteTrigger;
    visible = true;
    selectable = true;
    removable = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    chipValue: any;
    fruitCtrl = new FormControl();
    //End

    startDate: any;
    endDate: any;
    isSelectAll = false;
    timeZone = momentTz().tz(moment.tz.guess()).format('Z');
    
    headerProps = {
      searchConfig: {
        label: 'Search by Name',
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
  staffList: any;
    // 'buttonEvent': 'output'  on events
    // public date = moment();

    constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected dialog: MatDialog,
      protected permissionsService: PermissionService) {
      super(router, apiService, alertService, permissionsService);

      this.listApi = config.base_url_slug+ 'view/childs/attendance';
      this.getRoomsforDropdown(localStorage.getItem('branchId'));
      this.getStafforDropdown();

    //   this.headerButtons = [
    // 	{ buttonLabel: "Preview Pdf", color: "#E2AF2A", buttonRoute: "additional-items/add", isMultiple: true, firstFormName: 'select-children', visibility: true },
    // ];

    this.headerButtons = [
      // { buttonLabel: "Export as CSV", color: "#E2AF2A", buttonRoute: "", type: "output", visibility: false },
      { buttonLabel: "Download CSV", color: "#00AFBB", buttonRoute: "", type: "output", isMultiple: false, firstFormName: 'select-child', visibility: true },
      { buttonLabel: "Download Pdf", color: "#E2AF2A", buttonRoute: "", type: "output", isMultiple: false, firstFormName: 'select-child', visibility: true },
    ];


    this.buttonHeaderProps = {
      headingLabel: "Staff Attendance",
      hasRightLabel: false,
      rightLabel: "date time",
      ActionButtons: this.headerButtons,
      hasButton: true,
      hasHeading: true,
      labelMargin: '0px',
      float: 'right',
      textclass: 'text-bolder text-color',
      buttonsMargin: '0px 10px 0px',
      margin: '10px',
      // builtInFilters: { key: 'branchId', value: localStorage.getItem('branchId') }
    };

      this.headerProps.searchConfig.label = 'Search by Name';

      // Filtering Initialized
      this.filteredStaff = this.fruitCtrl.valueChanges.pipe(
        startWith(null),
        map((text: any) => text ? this._filter(text) : this.allStaffList.slice()));
      //End

      super.ngOnInit();
    }

    ngAfterViewInit() {
      // fromEvent(this.fruitInput.nativeElement, 'click')
      //   .pipe(
      //     tap(() => {
      //       this.trigger.openPanel()
      //     })
      //   ).subscribe()
    }

    afterRoom() {
      this.headerProps = {
        searchConfig: {
          label:'Search by Name',
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

      // this.tableConfigAndProps = {
      //   ActionButtons: this.actionButtons,
      //   inputData: this.inputData,
      //   columnHeader: this.columnHeader,
      //   dataSource: new MatTableDataSource(this.dataItems),
      //   pagination: this.pagination
      // };
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

    // Mat chips functions
    add(event: MatChipInputEvent): void {
      // const input = event.input;
      // const value = event.value;
  
      // if ((value || '').trim()) {
      //   this.fruits.push(value.trim());
      // }
  
      // if (input) {
      //   input.value = '';
      // }      
  
    }
  
    remove(fruit: string): void {
      const index = this.selectedStaffs.indexOf(fruit);
  
      if (index >= 0) {
        this.selectedStaffs.splice(index, 1);
      }
    }
  
    selected(event: MatAutocompleteSelectedEvent): void {

      let isExisting = this.selectedStaffs.filter((x: any) => x.id == event?.option?.value?.id).length != 0;

      if (isExisting) {
        return;
      }

      this.selectedStaffs.push(event.option.value);
      this.fruitInput.nativeElement.value = '';
      console.log(this.selectedStaffs);

      // Focus Out
      // this.fruitInput.nativeElement.blur();
      //End

      // Filtering Refreshed
      this.filteredStaff = this.fruitCtrl.valueChanges.pipe(
        startWith(null),
        map((text: any) => text ? this._filter(text) : this.allStaffList.slice()));
      //End
      
    }

    loadData() {
      this.fruitInput.nativeElement.blur();
      this.fruitInput.nativeElement.focus();
      this.filteredStaff = this.fruitCtrl.valueChanges.pipe(
        startWith(null),
        map((text: any) => text ? this._filter(text) : this.allStaffList.slice()));
    }
  
    private _filter(val: any): string[] {
      console.log(val);
      
      const filterValue = (typeof(val) == 'string') ? val.toLowerCase() : val.name.toLowerCase();
  
      return this.allStaffList.filter(fruit => fruit.name.toLowerCase().indexOf(filterValue) === 0);
    }

    checkforValue(event) {
      console.log(event);
      
    }
    //End

    getStafforDropdown() {
      let data = [];
      let url = config.base_url_slug +'view/staff-members?fetchType=dropdown&attributes=[{"key": "branchId", "value": "' + localStorage.getItem('branchId') + '" }]';
      this.apiService.get(url).then(res =>
      {
        if (res.code == 200)
        { 
          this.allStaffList = res.data;
          this.allStaffList.forEach((el)=> {
           el['name'] = (el.firstName || '' ) + ' ' + (el.lastName || '' );
          })

          // Filtering Initialized
          this.filteredStaff = this.fruitCtrl.valueChanges.pipe(
          startWith(null),
          map((text: any) => text ? this._filter(text) : this.allStaffList.slice()));
          //End
        }
        else
        {
          this.rooms = [];
        }
      });
    }

    valueChanged2(): void {
      console.log(this.startDate);
      console.log(this.endDate);
    }

    onClosed(): void {

    }

    submitData(type) {
      let url = config.base_url_slug + 'generate/staff-member/report';
      let staffIds = this.isSelectAll ? this.allStaffList.map((x: any) => x.id) : this.selectedStaffs.map((x: any) => x.id);
      let start, end;

      if (this.startDate && this.endDate) {
        start =  moment(new Date(this.startDate)).format(config.serverDateFormat);
        end =  moment(new Date(this.endDate)).format(config.serverDateFormat);
      } 

      let data = {
        staffIds: staffIds,
        type: type,
        startDate: start,
        endDate: end,
        timeZone: this.timeZone
      }

      if (!start || !end || staffIds.length == 0) 
      {
        this.alertService.alertError('WARNING', 'Please fill required filters');
        return;
      }
    
      this.apiService.post(url, data).then((res)=> {
         if (res.code == 200) {
          this.downloadFile(res.data.url);
          this.onClear();
         }
      });
    } 

    downloadFile(url) {
      let link = document.createElement('a');
      link.href = url;
      link.download = url.substr(url.lastIndexOf('/') + 1);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    onClear() {
      this.startDate = null;
      this.endDate = null;
      this.selectedStaffs = [];
    }

    checkAllStaff() {
      if (this.isSelectAll) {
        this.selectedStaffs = [];
      } 
    }

    headerOutputAction(event) {
      console.log(event);
  
      if (event.buttonLabel == 'Download Pdf') {
        this.submitData('pdf');
      }
  
      if (event.buttonLabel == 'Download CSV') {
        this.submitData('csv');
      } 
    }
}
