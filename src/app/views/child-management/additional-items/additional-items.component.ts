import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AdditionalDialogComponent } from './additional-dialog/additional-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { config } from 'src/config';
@Component({
	selector: 'app-additional-items',
	templateUrl: './additional-items.component.html',
	styleUrls: ['/src/app/views/shared-style.scss']
})
export class AdditionalItemsComponent extends GlobalListComponent implements OnInit
{
	tableConfigAndProps = {};
	dataSource = new MatTableDataSource();
	layoutAlign="start start"
	buttonHeaderProps: any;

	headerProps = {
		searchConfig: { label: 'Enter Child Name', key: 'branchId', value: '' },
		builtInFilters: { key: 'branchId', value: localStorage.getItem('branchId') },
		filterArray: [{
			label: 'Select Room', type: 'search', key: 'roomId', selected: 'All',
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

	sortBy = '';
	sortOrder = '';
  
	sortFields:any[] = [
		{asc: false, field: 'id'}, 
		{asc: false, field: 'room'},
		{asc: false, field: 'childName'},
		{asc: false, field: 'itemName'},
		{asc: false, field: 'matDate'},
		{asc: false, field: 'rateLabel'}, 
	];

	constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected dialog: MatDialog,
	protected permissionsService: PermissionService)
	{
		super(router, apiService, alertService, permissionsService);
		// 'buttonEvent': 'output'  on events
		this.actionButtons = [
			{ buttonLabel: "Edit", type: 'output', buttonRoute: "", visibility: this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Additional Items').update  },
			{ buttonLabel: "View", type: 'output', buttonRoute: "", visibility: this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Additional Items').read },
			{ buttonLabel: "Delete", type: 'delete', buttonRoute: "child/additional-item", visibility: this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Additional Items').delete },
		]
		this.columnHeader = {
			'id': 'ID', 'room': 'Room', 'childName': 'Child Name', 'itemName': 'Item', 'matDate': 'Date', 'rateLabel': 'Rate', 'Actions': 'Actions',
		};

		this.headerButtons = [
			{ buttonLabel: "Add New", color: "#E2AF2A", buttonRoute: "additional-items/add", isMultiple: false, firstFormName: 'select-children', visibility: this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Additional Items').create },
		]
		this.buttonHeaderProps = {
			headingLabel: "Additional Items",
			ActionButtons: this.headerButtons,
			hasButton: true,
			hasHeading: true,
			labelMargin: '0px',
			float: 'right',
			textclass: 'text-bolder text-color',
			buttonsMargin: '0px 10px 0px',
			margin: '10px',
			builtInFilters: { key: 'branchId', value: localStorage.getItem('branchId') }
		};

		this.tableConfigAndProps = {
			ActionButtons: this.actionButtons,
			inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
		};

		this.listApi = config.base_url_slug +'view/childs/additional-items'
		this.getRooms(localStorage.getItem('branchId'));
		super.ngOnInit();

		// this.getList(this.filterUrl);
		//   this.isMultiple = true;
		//   this.firstFormName = 'basic';
	}

	ngOnInit()
	{
		// if (localStorage.getItem('additionalItems'))
		// {
		// 	localStorage.removeItem('additionalItems')
		// }
	}

	afterRoom()
	{
		this.headerProps = {
			searchConfig: { label: 'Enter Child Name', key: 'branchId', value: '' },
			builtInFilters: { key: 'branchId', value: localStorage.getItem('branchId') },
			filterArray: [{
				label: 'Select Room', type: 'search', key: 'roomId', selected: 'All',
				options: this.rooms
			},],
		};
	}
	afterListResponse(): void
	{
		// this.title = "Project Listing"
		this.dataItems.forEach(element =>
		{
			element['room'] = element['child'].room?.name
			element['childName'] = element['child'].firstName + " " + element['child'].lastName;

			if (element.date != 0)
			{
				element.matDate = moment(new Date(element.date)).format(config.cmsDateFormat)
			}

			element.itemName = element.item;

			if (element.item == 'birthdayCake')
			{
				element.itemName = 'Birthday Cake'
			}
			if (element.item == 'lateCollectionFee')
			{
				element.itemName = 'Late Collection Fee'
			}
			if (element.item == 'lunch')
			{
				element.itemName = 'Lunch'
			}
			if (element.item == 'nappyChange')
			{
				element.itemName = 'Nappy Change'
			}
			if (element.item == 'registrationFee')
			{
				element.itemName = 'Registration Fee'
			}
			if (element.item == 'tea')
			{
				element.itemName = 'Tea'
			}
			if (element.item == 'sunCream')
			{
				element.itemName = 'Sun Cream'
			}
			if (element.item == 'costume')
			{
				element.itemName = 'Costume'
			}
			if (element.item == 'breakage')
			{
				element.itemName = 'Breakage'
			}
			if (element.item == 'latePaymentCharge')
			{
				element.itemName = 'Late Payment Charge'		
			}
			if (element.item == 'packedMeal')
			{
				element.itemName = 'Packed Meal'		
			}
			if (element.item == 'adjustment')
			{
				element.itemName = 'Adjustment'		
			}
			if (element.item == 'termTimeOnlySurcharge')
			{
				element.itemName = 'Term Time Only Surcharge'		
			}

			element.rateLabel = '£' + element.rate;
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

	actionButtonOutput(event)
	{
		if (event.item.type === "delete")
		{
			this.onDelete(event.row, event.item);
		}
		else
		{
			this.openDialog(event);
		}
	}

	openDialog(event): void
	{
		const dialogRef = this.dialog.open(AdditionalDialogComponent, {
			autoFocus: false,
			maxHeight: '90vh',
			width: '50%',
			data: { event: event }
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
		// move branch id in otherAttributes
		let _otherAttributes = [];
		_otherAttributes.push({'key': 'bookedStudents','value': true });

		event.filter.forEach((element, idx) => {		
			if (element.key == 'branchId' || element.key == 'roomId')
			{
				_otherAttributes.push(element);
			}  
		});

		filterUrl = '&attributes=[]';
		if (event.sort)
		{
			filterUrl = filterUrl + event.sort;
		}

		if (event.range)
		{
			filterUrl = filterUrl + event.range;
		}

		if (event.search)
		{
			filterUrl = filterUrl + event.search;
		}

		if (event.date)
		{
			filterUrl = filterUrl + event.date;
		}
		
		filterUrl = filterUrl + "&otherAttributes="+JSON.stringify(_otherAttributes);
		this.getList(filterUrl);
	}

	sortColumn(e) {

		this.sortBy = e.field;

		if (e.field == 'room') {
          this.sortBy = 'roomId';
		}

		if (e.field == 'itemName') {
			this.sortBy = 'item';
		}

		if (e.field == 'childName') {
			this.sortBy = 'firstName';
		}

		if (e.field == 'matDate') {
			this.sortBy = 'date';
		}

		if (e.field == 'rateLabel') {
			this.sortBy = 'rate';
		}
		  
		this.sortUrl = `&sortBy=${this.sortBy}&sortOrder=${e.order}`;
		this.getList(this.filterUrl);
	}
}
