import { Component, OnInit, ViewChild } from '@angular/core';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { config } from 'src/config';
import * as momentTz from 'moment-timezone';

@Component({
	selector: 'app-session-list',
	templateUrl: './session-list.component.html',
	styleUrls: ['/src/app/views/shared-style.scss']
})
export class SessionListComponent extends GlobalListComponent implements OnInit
{
	tableConfigAndProps = {};
	dataSource = new MatTableDataSource();
	buttonHeaderProps : any;

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

	constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected permissionsService: PermissionService)
	{
		super(router, apiService, alertService, permissionsService);
		this.actionButtons =
		[
			{ buttonLabel: "Edit", buttonRoute: "session", visibility: this.permissionsService.getPermissionsByModuleName('Session Management').update },
			{ buttonLabel: "View", buttonRoute: "session", visibility: this.permissionsService.getPermissionsByModuleName('Session Management').read },
			{ buttonLabel: "Delete", type: 'delete', buttonRoute: "session", visibility: this.permissionsService.getPermissionsByModuleName('Session Management').delete },
		]
		this.headerButtons = [
			{ buttonLabel: "Create Session", color: "#E2AF2A", buttonRoute: "session/add", isMultiple: false, firstFormName: 'session-info', visibility: this.permissionsService.getPermissionsByModuleName('Session Management').create  },
		]
		this.columnHeader = {
			'id': 'ID', 'name': 'Name', 'startTime': 'Start Time', 'endTime': 'End Time', 'category': 'Pricing Profile', 'Actions': 'Actions',
		};
		this.tableConfigAndProps = {
			ActionButtons: this.actionButtons,
			inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
		};

		this.buttonHeaderProps = {
			headingLabel: "Session ",
			ActionButtons: this.headerButtons,
			hasButton: true,
			hasHeading: true,
			labelMargin: '10px',
			textclass: 'text-bolder text-color',
			margin: '0px',
			hasFilters: true,
			searchConfig: { label: 'Search', key: 'branchId', value: '' },
			builtInFilters: { key: 'branchId', value: localStorage.getItem('branchId') }
		};

		this.listApi = config.base_url_slug +'view/sessions';
		// this.getList()
		super.ngOnInit();

		this.isMultiple = false;
		this.firstFormName = 'session-info';
	}

	afterListResponse(): void
	{
		this.dataItems.forEach(element =>
		{
			// element['startTime'] = element.startTime == 0 || element.startTime == null ? '-' : moment(new Date(element.startTime * 1000)).format("hh:mm A");
			// element['endTime'] = element.endTime == 0 || element.endTime == null ? '-' : moment(new Date(element.endTime * 1000)).format("hh:mm A");

			element['startTime'] = element.startTime ? moment((element.startTime * 1000) + (new Date(element.startTime * 1000).getTimezoneOffset()*60000)).format("hh:mm A") : null;
			element['endTime'] = element.endTime ? moment((element.endTime * 1000) + (new Date(element.endTime * 1000).getTimezoneOffset()*60000)).format("hh:mm A") : null;
			
			if (element['category'] == 'standard')
			{
				element['category'] = 'Standard';
			}

			if (element['category'] == 'hourly')
			{
				element['category'] = 'Hourly';
			}
		});

		this.tableConfigAndProps = {
			ActionButtons: this.actionButtons,
			inputData: this.inputData,
			columnHeader: this.columnHeader,
			dataSource: new MatTableDataSource(this.dataItems),
			pagination: this.pagination,
			onlyDelete: true
		};
		// this.title = this.title + " (" + this.pagination.count + ")"
	}

	getOffSetForLondon() {
	    // Input UTC offset string (e.g., "+01:00")

        let utcoffset = momentTz.tz('Europe/London').format('Z');

		// Split the input string into hours and minutes
		const [sign, hours, minutes] = utcoffset.match(/^([+-])(\d{2}):(\d{2})$/).slice(1);

		// Convert hours and minutes to an offset in minutes
		const offsetInMinutes = (sign === '+' ? 1 : -1) * (parseInt(hours, 10) * 60 + parseInt(minutes, 10));

		return offsetInMinutes;
	}
}
