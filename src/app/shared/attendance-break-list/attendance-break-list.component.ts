import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { config } from 'src/config';
import { GlobalListComponent } from '../global-list';

@Component({
  selector: 'app-attendance-break-list',
  templateUrl: './attendance-break-list.component.html',
  styleUrls: ['./attendance-break-list.component.scss']
})
export class AttendanceBreakListComponent extends GlobalListComponent implements OnInit {

  tableConfigAndProps = {};
	dataSource = new MatTableDataSource();
	buttonHeaderProps : any;
  listData: any;

  columnHeader = {
    'id': 'ID',
    // 'staffName': 'Staff Name',
    // 'createdDate': 'Day / Date',
    // 'timeIntoDisplay': 'Time In',
    // 'timeOuttoDisplay': 'Time Out',
    'breakIntoDisplay': 'Break In',
    'breakOuttoDisplay': 'Break Out',
    // 'attendance': 'Status',
    'breakType': 'Break Type',
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

  constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected dialog: MatDialog,
    protected permissionsService: PermissionService)
  {
    super(router, apiService, alertService, permissionsService);
    this.listData = [];
    // this.listApi = config.base_url_slug;

  }

  ngOnInit(): void {

    this.listData.forEach(log => {
      log['timeIntoDisplay'] = log.timeIn == 0 || log.timeIn == null || log.attendance == 'absent' ? '-' : moment(new Date(log.timeIn * 1000)).format("hh:mm A");
      log['timeOuttoDisplay'] = log.timeOut == 0 || log.timeOut == null || log.attendance == 'absent' ? '-' : moment(new Date(log.timeOut * 1000)).format("hh:mm A");
      log.createdDate = moment(new Date(log.createdDate)).format('dddd') + ' - ' + moment(new Date(log.createdDate)).format(config.cmsDateFormat);
      log['breakIntoDisplay'] = log.breakIn == 0 || log.breakIn == null || log.attendance == 'absent' ? '-' : moment(new Date(log.breakIn * 1000)).format("hh:mm A");
      log['breakOuttoDisplay'] = log.breakOut == 0 || log.breakOut == null || log.attendance == 'absent' ? '-' : moment(new Date(log.breakOut * 1000)).format("hh:mm A");
      log['breakType'] = log.breakType == 'offPremises' ? 'Off Premises' : log.breakType == 'onPremises' ? 'On Premises' : log.breakType == null ? '-' : log.breakType;
      
      if (log.attendance == 'present')
      {
        log.attendance = 'Present';
      }

      if (log.attendance == 'absent')
      {
        log.attendance = 'Absent';
      }
    });

    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: new MatTableDataSource(this.listData),
      pagination: this.pagination
    };
  }

}
