import { Component, OnInit, ViewChild } from '@angular/core';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { config } from 'src/config';

@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class HolidaysComponent extends GlobalListComponent implements OnInit {
  tableConfigAndProps = {};
  type = "present"
  year = "2021"
  currentHolidays = [
    { "backColor": "#00D1004D", "borderColor": "#00D100", "date": "01 Jan 2021", "description": "New Year Holiday" },
    { "backColor": "#00AFBB1A", "borderColor": "#00AFBB", "date": "02 April 2021", "description": "25 Dec 2021 - 01 Jan 2022" },
    { "backColor": "#ECD4FF", "borderColor": "#A73DF9", "date": "25 Dec 2021 - 01 Jan 2022", "description": "Christmas Holidays" }
  ];

  dataSource = new MatTableDataSource();
  viewDate: Date = new Date();
  inputData = {
    'imageColumn': 'profilePicture',
    'actionColumn': 'Actions',
    'roundedTable': false,
    'hasPreCircle': true,
    'buttonEvent': "output",
    'preCircleCol': 'date',
    'hasTitle':true
  }

  columnHeader = {
    'dateDisplay': 'Date',
    'description': 'Description',
    'Actions': 'Actions',
  };

  yearColumnHeader = {
    'date': 'Date', 'description': 'Description'
  };

  constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected pmSrv: PermissionService)
  {
    super(router, apiService, alertService, pmSrv);
    // { buttonLabel: "Edit", buttonRoute: "" },
    this.actionButtons = [
      { buttonLabel: "Delete", type: 'delete', buttonRoute: "event", visibility: this.pmSrv.getPermissionsBySubModuleName(config.md_hr_m, config.sub_md_hr_calendar).delete }
    ];

    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData, columnHeader: this.columnHeader, dataSource: new MatTableDataSource(this.currentHolidays),
    };

    this.listApi = config.base_url_slug +'view/events';
    let filterUrl = 'timeStatus=present&attributes=[{"key": "branchId","value": "' + localStorage.getItem('branchId') + '" }]&otherAttributes=[{"key": "view","value": "list" }]'
    // this.getList(filterUrl)
    super.ngOnInit();
  }

  // onClick(type) {
  //   if (type == "current") {
  //     this.onYearClick('present');
  //   } elseif (type == "future") {
  //     this.onYearClick('2020');
  //   }
  //   this.type = type;
  // }

  onYearClick(type) {
    this.year = type;
    this.type = type;

    let filterUrl = 'timeStatus=' + type + '&attributes=[{"key": "branchId","value": "' + localStorage.getItem('branchId') + '" }]&otherAttributes=[{"key": "view","value": "list" }]'
    this.getList(filterUrl);
    // this.tableConfigAndProps = {
    //   ActionButtons: this.Actionbuttons,
    //   inputData: this.inputData, columnHeader: this.yearColumnHeader,  dataSource: new MatTableDataSource(this.currentHolidays),
    // };
  }

  getList(filterUrl ? : any): void {
    let url = this.listApi + '?';
    this.filterUrl = '';

    if (filterUrl) {
      url = url + filterUrl;
      this.filterUrl = filterUrl;
    }

    if (this.paginationUrl) {
      url = url + this.paginationUrl;
    }

    this.apiService.get(url).then(result => {
      if (result.code === 200) {
        if (result.data.hasOwnProperty('listing')) {
          this.dataItems = result.data.listing;
        } else {
          this.dataItems = result.data;
        }

        this.pagination = result.data.pagination;
        this.afterListResponse();
      } else {
        this.dataItems = [];
        this.alertService.alertError(result.status, result.message);
      }
    });
  }

  afterListResponse(): void {
    // this.title = "Project Listing"
    this.dataItems.forEach(element => {
      if (element.type == "bankHolidays") {
        element.backColor = "#FF9F1059";
        element.borderColor = "#FF9F10";
      } else if (element.type == "midTermHolidays") {
        element.backColor = "#ECD4FF";
        element.borderColor = "#A73DF9";
      } else if (element.type == "endTermHolidays") {
        element.backColor = "#DBACFF";
        element.borderColor = "#A73DF9";
      } else {
        element.backColor = "#ff9a8e";
        element.borderColor = "#ca1818";
      }

      element.startDate = this.setDateHours(element.startDate);
      element.endDate = this.setDateHours(element.endDate);
      element.dateDisplay = element.startDate == element.endDate ? moment(element.startDate).format('D MMMM YYYY'): moment(element.startDate).format('D MMMM YYYY')+ " - " + moment(element.endDate).format('D MMMM YYYY');
    });
    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: new MatTableDataSource(this.dataItems),
      pagination: this.pagination
    };
    // this.title = this.title + " (" + this.pagination.count + ")"
  }

  setDateHours(input) {
		let date = new Date(input);
		return new Date(date.valueOf() + date.getTimezoneOffset() * 60000);
  }
}
