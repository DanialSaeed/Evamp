import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { config } from 'src/config';

@Component({
    selector: 'app-discrepancy-history',
    templateUrl: './discrepancy-history.component.html',
    styleUrls: ['/src/app/views/shared-style.scss']
})
export class DiscrepancyHistoryComponent extends GlobalListComponent implements OnInit
{
    // sub: Subscription;
    // attendanceType: any;
    tableConfigAndProps = {};
    dataSource = new MatTableDataSource();
    layoutAlign = "start start";
    public date = moment();

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
        'buttonEvent': "output",
        'hasViewMore': false
    }

    columnHeaders = {
        'id': 'ID',
        'childName': 'Child Name',
        'room': 'Room',
        'timeIntoDisplay': 'Time In',
        'timeOuttoDisplay': 'Time Out',
        'sessionDisplay': 'Session',
        'discrepancyRemovalDate': 'Created Date',
        'discrepancyNote': 'Note',
        // 'attendance': 'Status',
        // 'Actions': 'Actions',
    };

    buttonHeaderProps = {
        headingLabel: "Discrepancy History",
        hasRightLabel: true,
        rightLabel: moment().format('dddd D MMM'),
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

	sortFields:any[] = [
        {asc: false, field: 'id'},
		{asc: false, field: 'createdDate'},
		{asc: false, field: 'childName'},
		{asc: false, field: 'age'},
		{asc: false, field: 'room'},
        {asc: false, field: 'timeIntoDisplay'},
        {asc: false, field: 'timeOuttoDisplay'},
        {asc: false, field: 'discrepancyRemovalDate'},

	];

    constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected dialog: MatDialog,
        protected permissionsService: PermissionService)
    {
        super(router, apiService, alertService, permissionsService);
        this.listApi = config.base_url_slug + 'view/childs/attendance';

        this.getRoomsforDropdown(localStorage.getItem('branchId'));

        this.tableConfigAndProps = {
            ActionButtons: this.actionButtons,
            inputData: this.inputData,
            columnHeader: this.columnHeaders,
            dataSource: this.dataSource,
        };

        super.ngOnInit();
    }

    filnalFilters(event): void
    {
        let filterUrl = '';
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
        }
        else
        {
            let startDate = this.date.startOf('day').format(config.serverDateFormat);
            let endDate = this.date.endOf('day').format(config.serverDateFormat);
            filterUrl = filterUrl + '&startDate=' + startDate + '&endDate=' + endDate;
        }
        if (event.search)
        {
            filterUrl = filterUrl + event.search;
        }
        if (event.date)
        {
            filterUrl = filterUrl + event.date;
        }

        filterUrl += '&discrepancy=Discarded';

        this.getList(filterUrl);
    }

    afterRoom()
    {
        this.headerProps.filterArray[0].options = this.rooms;
        this.rooms.unshift({label: 'All', value: 'All'});
    }

    afterListResponse()
    {

        this.dataItems.forEach(element =>
        {
            element['timeIntoDisplay'] = element.timeIn == 0 || element.timeIn == null || element.attendance == 'absent' ? '-' : moment((element.timeIn * 1000) + (new Date(element.timeIn * 1000).getTimezoneOffset()*60000)).format("hh:mm A");
            element['timeOuttoDisplay'] = element.timeOut == 0 || element.timeOut == null || element.attendance == 'absent' ? '-' : moment((element.timeOut * 1000) + (new Date(element.timeOut * 1000).getTimezoneOffset()*60000)).format("hh:mm A");
            element['room'] = element.room?.name;
            element['childName'] = element['child'].firstName + " " + element['child'].lastName;
            element['discrepancyRemovalDate'] = element.discrepancyRemovalDate != null ? moment(new Date(element.discrepancyRemovalDate)).format(config.cmsDateFormat) : '-';
            element['longNote'] = false;
            if (element.discrepancyNote && element.discrepancyNote.length > 30)
              {
                element['showNote'] = element.discrepancyNote
                element['discrepancyNote'] = element.discrepancyNote.substring(0, 30) + '...';
                element['longNote'] = true;
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

}
