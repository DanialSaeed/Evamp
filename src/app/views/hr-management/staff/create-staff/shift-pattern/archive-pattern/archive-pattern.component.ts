import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';
import { ShiftPatternDialogComponent } from '../shift-pattern-dialog/shift-pattern-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { config } from 'src/config';
@Component({
	selector: 'app-archive-pattern',
	templateUrl: './archive-pattern.component.html',
	styleUrls: ['/src/app/views/shared-style.scss']
})
export class ArchivePatternComponent extends GlobalListComponent implements OnInit
{
	tableConfigAndProps = {};
	dataToSend = []
	dataObject = {}
	dataSource = new MatTableDataSource();
	arrayOfArrays = [];
	@Input() idToSend: any;
	@Input() type: any;

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

	constructor(private dialog: MatDialog, protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected permissionsService: PermissionService,)
	{
		super(router, apiService, alertService, permissionsService);
			// 'buttonEvent': 'output'  on events

		this.actionButtons =
		[
			{ buttonLabel: "View", buttonRoute: "", visibility: this.permissionsService.getPermissionsBySubModuleName('H.R Management', 'Staff').read },
		]

		this.columnHeader = {
			staffId: 'Staff ID',
			branch: 'Nursery',
			room: 'Room',
			joiningDate: 'Joining Date',
			leavingDate: 'Leaving Date',
			monday: 'Monday',
			tuesday: 'Tuesday',
			wednesday: 'Wednesday',
			thursday: 'Thursday',
			friday: 'Friday',
			// start: 'Start Date',
			// end: 'End Date',
			Actions: 'Actions',
		};

		this.tableConfigAndProps = {
			ActionButtons: this.actionButtons,
			inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
		};
	}
	ngOnInit(): void
	{
		this.detailApi = config.base_url_slug +'view/staff-member/' + this.idToSend;
		this.getDetail()
		super.ngOnInit();
	}

	afterDetail(): void
	{
		console.log(this.formDetail);
		if (this.formDetail?.staffShiftPatternLog)
		{
			// var size = 5;
			// for (var i = 0; i < this.formDetail?.staffShiftPatternLog?.length; i += size)
			// {
			// 	this.arrayOfArrays.push(this.formDetail?.staffShiftPatternLog?.staffShiftPatternLogDetails.slice(i, i + size));
			// }

			// this.arrayOfArrays.forEach((element, index) =>
			// {
			// 	this.filterData(element, index);
			// });

			this.formDetail?.staffShiftPatternLog.forEach(element => {
				element['room'] = element?.room?.name;

				element?.staffShiftPatternDetailsLog.forEach(pattern => {
					this.filterData(pattern);
					element[pattern.day] = this.getDateString(pattern);
				});
			});

			this.dataToSend = this.formDetail?.staffShiftPatternLog

			this.tableConfigAndProps = {
				ActionButtons: this.actionButtons,
				inputData: this.inputData,
				columnHeader: this.columnHeader,
				dataSource: new MatTableDataSource(this.dataToSend),
				pagination: this.pagination
			};

		}
	}

	// filterData(element, index)
	// {
	// 	this.dataObject = {};

	// 	element.forEach(element =>
	// 	{
	// 		element['startShowDate'] = this.converMiliToTime(element['startDate']);
	// 		element['endShowDate'] = this.converMiliToTime(element['endDate']);

	// 		element['breakDeduction'] = element['breakDeduction'].toString();
	// 		element['branch'] = element.branch?.name;
	// 		element['room'] = element.room?.name;

	// 		this.dataObject['branchId'] = element.branchId;
	// 		this.dataObject['roomId'] = element.roomId;
	// 		this.dataObject['branch'] = element.branch;
	// 		this.dataObject['room'] = element.room;
	// 		this.dataObject['staffId'] = element.staffId;

	// 		this.dataObject['start'] = moment(new Date(element.createdTime * 1000)).format(config.cmsDateFormat);
	// 		this.dataObject['end'] = moment(new Date(element.updatedTime * 1000)).format(config.cmsDateFormat);
	// 		this.dataObject[element?.day] = this.getDateString(element);
	// 	});
	// 	console.log(element);
		

	// 	this.dataObject['id'] = index;
	// 	this.dataToSend.push(this.dataObject);
	// }

	filterData(el)
	{
		el['startShowDate'] = this.converMiliToTime(el['startDate']);
		el['endShowDate'] = this.converMiliToTime(el['endDate']);
		el['breakDeduction'] = el['breakDeduction'].toString();
	}

	getDateString(element)
	{
		return element['startShowDate'] + ' - ' + element['endShowDate'];
	}

	converMiliToTime(element)
	{
		if (element != 0)
		{
			var date = new Date(element * 1000)
			return moment(date).format("hh:mm A")
		}
		else
		{
			return ""
		}
	}

	openDialog(event)
	{
		var index = event?.row?.id
		event['patternArray'] = this.formDetail?.staffShiftPatternLog[0].staffShiftPatternDetailsLog;
		event['staffName'] = this.formDetail?.firstName;

		event['startDate'] = this.formDetail?.staffContractDetail?.employmentStartDate;
        event['endDate'] = this.formDetail?.staffContractDetail?.employmentEndDate;

		// if(this.type == 'view')
		// {
		// 	event['type'] = this.type;
		// }
		let dialogRef = this.dialog.open(ShiftPatternDialogComponent, {
			autoFocus: false,
			maxHeight: '90vh',
			width: '70%',
			data: {
				event: event,
			}

		});
		dialogRef.afterClosed().subscribe(result =>
		{

			// this.router.navigateByUrl('/main/staff-list');
		})
	}
}
