import { Component, OnInit, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';
import { ShiftPatternDialogComponent } from '../shift-pattern-dialog/shift-pattern-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { config } from 'src/config';

@Component({
	selector: 'app-active-pattern',
	templateUrl: './active-pattern.component.html',
	styleUrls: ['/src/app/views/shared-style.scss']
})
export class ActivePatternComponent extends GlobalListComponent implements OnInit
{
	tableConfigAndProps = {};
	dataSource = new MatTableDataSource();
	@Input() idToSend: any;
	@Input() type: any;
	@Input() patternTosend: any;
	@Output() onDeleteShift: EventEmitter<any> = new EventEmitter<any>();
	@Output() onUpdateShift: EventEmitter<any> = new EventEmitter<any>();
	patternListData = [];

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
	Actionbuttons = [
		{ buttonLabel: "Edit", type: 'output', buttonRoute: "" },
		{ buttonLabel: "View", type: 'output', buttonRoute: "" },
	]
	columnHeader = {
		'staffId': 'ID',
		'branch': 'Nursery',
		'room': 'Room',
		'monday': 'Monday',
		'tuesday': 'Tuesday',
		'wednesday': 'Wednesday',
		'thursday': 'Thursday',
		'friday': 'Friday',
		'Actions': 'Actions',

	};

	constructor(private dialog: MatDialog, protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected permissionsService: PermissionService,)
	{
		super(router, apiService, alertService, permissionsService);
		// 'buttonEvent': 'output'  on events


		// this.columnHeader = {
		// 	'staffId': 'ID', 'branch': 'Nursery', 'room': 'Room', 'monday': 'Monday', 'tuesday': 'Tuesday',
		// 	'wednesday': 'Wednesday', 'thursday': 'Thursday', 'friday': 'Friday', 'Actions': 'Actions',
		// };
	}

	ngOnInit(): void
	{
		if (this.type == 'view')
		{
			this.actionButtons = [
				{ buttonLabel: "View", type: 'output', buttonRoute: "", visibility: this.permissionsService.getPermissionsBySubModuleName('H.R Management', 'Staff').read },
			]
		}
		else
		{
			this.actionButtons = [
				{ buttonLabel: "Edit", type: 'output', buttonRoute: "", visibility: this.permissionsService.getPermissionsBySubModuleName('H.R Management', 'Staff').update },
				{ buttonLabel: "View", type: 'output', buttonRoute: "", visibility: this.permissionsService.getPermissionsBySubModuleName('H.R Management', 'Staff').read },
			]
		}

		this.tableConfigAndProps = {
			ActionButtons: this.actionButtons,
			inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
		};

		this.detailApi = config.base_url_slug + 'view/staff-member/' + this.idToSend;
		this.getDetail()
		super.ngOnInit();
	}

	afterDetail(): void
	{
		let dataToSend = [];
		let dataObject = {};

		if (this.formDetail?.staffShiftPatternLog)
		{

			// var size = 5; var arrayOfArrays = [];
			// for (var i = 0; i < this.formDetail.staffShiftPatternLogDetails.length; i += size)
			// {
			// 	arrayOfArrays.push(this.formDetail.staffShiftPatternLogDetails.slice(i, i + size));
			// }
		}

		if (this.formDetail?.staffShiftPattern?.length != 0)
		{
			this.formDetail?.staffShiftPattern.forEach(element => {
				element['room'] = element?.room?.name;

				element?.staffShiftPatternDetails.forEach(pattern => {
					this.filterData(pattern);
					element[pattern.day] = this.getDateString(pattern);
				});
			});

			//***************** Single Shift Patern Old Code **************//

			// var element = this.formDetail?.staffShiftPattern;
			// this.filterData(element);			
			// dataObject['branchId'] = element[0].branchId
			// dataObject['roomId'] = element[0].roomId
			// dataObject['branch'] = element[0].branch
			// dataObject['room'] = element[0].room
			// dataObject['staffId'] = element[0].staffId
			// element?.staffShiftPatternDetails.forEach(pattern =>
			// {
			// 	dataObject[pattern.day] = this.getDateString(pattern)
			// });
			// dataToSend.push(dataObject)

			//***************** End **************//

			dataToSend = this.formDetail?.staffShiftPattern;
			this.patternListData = this.formDetail?.staffShiftPattern;
		}
		this.tableConfigAndProps = {
			ActionButtons: this.actionButtons,
			inputData: this.inputData,
			columnHeader: this.columnHeader,
			dataSource: new MatTableDataSource(dataToSend),
			pagination: this.pagination
		};
	}

	filterData(el)
	{
		// element.forEach(element =>
		// {
			// element['startShowDate'] = this.converMiliToTime(element['startDate']);
			// element['endShowDate'] = this.converMiliToTime(element['endDate']);

			// element['breakDeduction'] = element['breakDeduction'].toString()
			// element['branch'] = element.branch?.name
			// element['room'] = element.room?.name

			// element.staffShiftPatternDetails.forEach(el => {
				el['startShowDate'] = this.converMiliToTime(el['startDate']);
				el['endShowDate'] = this.converMiliToTime(el['endDate']);

				el['breakDeduction'] = el['breakDeduction'].toString()
		// 	});

		// });
	}

	getDateString(element)
	{
		return element['startShowDate'] + ' - ' + element['endShowDate'];
	}

	converMiliToTime(element)
	{
		if (element != 0)
		{
			var date = moment((element * 1000) + (new Date(element * 1000).getTimezoneOffset()*60000))
			return moment(date).format("hh:mm A");
		}
		else 
		{
			return "";
		}
	}

	openDialog(e?)
	{
		if (this.patternListData.length == 0) return;
		let event =  e ? e : this.patternListData[0];
		event['patternArray'] = this.formDetail?.staffShiftPattern[0].staffShiftPatternDetails
		event['patternKpi'] = this.patternTosend

		event['startDate'] = this.formDetail?.staffContractDetail?.employmentStartDate;
        event['endDate'] = this.formDetail?.staffContractDetail?.employmentEndDate;
		if (!e) {
			event['row'] = this.patternListData[0];
			event['item'] = this.actionButtons[0];
		}
		// if (this.type == 'view')
		// {
		// 	event['type'] = this.type;
		// }
		event['staffName'] = this.formDetail?.firstName + ' ' + this.formDetail?.lastName;
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
			if (result.status == "success")
			{
				if (result.type == "delete")
				{
					this.deleteShift(result.staffId);
				}
				else if (result.type == "edit")
				{
					this.getDetail();
					this.onUpdateShift.emit()
				}
			}
		})
	}

	deleteShift(id)
	{
		var url = config.base_url_slug + "remove/staff-member/shift-patterns/" +  id; 
		let heading = 'Delete Item?';
		let message = 'Are you sure you want to end this shift ?';
		let rightButton = 'Delete';
		let leftButton = 'Cancel';
		this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then(result =>
		{
			if (result)
			{
				this.apiService.delete(url).then(result =>
				{
					if (result.code == 200)
					{
						this.getDetail()
						this.alertService.alertSuccess(result.status, result.message);
						this.onDeleteShift.emit()
					}
					else
					{
						this.alertService.alertError(result.status, result.message);
					}
				});
			}
		})

	}


}