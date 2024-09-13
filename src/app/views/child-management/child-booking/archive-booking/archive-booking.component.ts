import { Component, OnInit, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { config } from 'src/config';
@Component({
	selector: 'app-archive-booking',
	templateUrl: './archive-booking.component.html',
	styleUrls: ['/src/app/views/shared-style.scss']
})
export class ArchiveBookingComponent extends GlobalListComponent implements OnInit
{
	tableConfigAndProps = {};
	dataSource = new MatTableDataSource();
	// @Input() idToSend: any;
	// @Input() patternTosend: any;
	@Output() onDeleteShift: EventEmitter<any> = new EventEmitter<any>();
	layoutAlign = "start start"
	headerProps = {
		searchConfig: { label: 'Enter Child Name', key: 'branchId', value: '' },
		builtInFilters: { key: 'branchId', value: localStorage.getItem('branchId') },
		filterArray: [],
		fxFlexIn: "310px"
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
		{asc: false, field: 'child'},
		{asc: false, field: 'joiningDate'},
		{asc: false, field: 'leavingDate'}, 
	];

	days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

	constructor(private dialog: MatDialog, protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected permissionsService: PermissionService)
	{
		super(router, apiService, alertService, permissionsService);
		// 'buttonEvent': 'output'  on events
		this.actionButtons =
			[
				{ buttonLabel: "View", buttonRoute: "child-booking", visibility: this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Booking Manager').read, hide: true },
			]
		this.columnHeader = {
			'id': 'ID', 'room': 'Room', 'booking-type': 'Type', 'child': 'Child Name', 'age': 'Age', 'guardianName': 'Parent Name', 'joiningDate': 'Start', 'leavingDate': 'End Date', 'type': 'Valid', 'monday': 'Mon', 'tuesday': 'Tue',
			'wednesday': 'Wed', 'thursday': 'Thu', 'friday': 'Fri',
		};
		this.tableConfigAndProps = {
			ActionButtons: this.actionButtons,
			inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
		};
	}

	ngOnInit(): void
	{
		// this.detailApi = config.base_url_slug +'view/child/6';
		this.listApi = config.base_url_slug + 'view/childs/session-booking-logs';
		this.getRooms(localStorage.getItem('branchId'));

		// this.getList()
		super.ngOnInit();

		this.isMultiple = false;
		this.firstFormName = 'booking-detail';
	}

	afterRoom()
	{
		this.rooms.unshift({label: 'All', value: 'All'});
		this.headerProps = {
			searchConfig: { label: 'Enter Child Name', key: 'branchId', value: '' },
			builtInFilters: { key: 'branchId', value: localStorage.getItem('branchId') },
			filterArray: [{
				label: 'Select Room', type: 'search', key: 'roomId', selected: 'All',
				options: this.rooms
			},],
			fxFlexIn: "310px"
		};
	}
	afterListResponse(): void
	{
		// this.title = "Project Listing"
		let dataToSend = [];
		if (this.dataItems?.length != 0)
		{
			this.dataItems.forEach(element =>
			{
				let dataObject = {}
				dataObject['branchId'] = element?.branchId
				dataObject['roomId'] = element?.roomId
				dataObject['childId'] = element?.childId
				dataObject['room'] = element?.room
				dataObject['age'] = this.getChildAge(element?.child) 
				dataObject['child'] = element?.child.firstName + " " + element?.child.lastName
				dataObject['id'] = element?.id
				dataObject['type'] = element?.type == 'fullYear' ? 'Full Year' : element?.type == 'nonTerm' ? 'Non Term' : element?.type == 'termOnly' ? 'Term Only' : element?.type
				dataObject['guardianName'] = element?.child?.guardianName ? element?.child?.guardianName : '-'; 
				dataObject['booking-type'] = this.getBookingTypeName(element?.bookingType)
				dataObject['type'] = element?.validityType == 'fullYear' ? 'Full Year' : element?.validityType == 'nonTerm' ? 'Non Term' : element?.validityType == 'termOnly' ? 'Term Only' : element?.validityType

				dataObject['joinDate'] = element?.joiningDate;
				dataObject['joiningDate'] = element?.joiningDate
				dataObject['leavingDate'] = element?.leavingDate
				if (element?.joiningDate)
				{
					dataObject['joiningDate'] = element?.joiningDate ? moment(new Date(element.joiningDate)).format(config.cmsDateFormat) : '-';
				}
				if (element?.leavingDate)
				{
					dataObject['leavingDate'] = element?.leavingDate ? moment(new Date(element.leavingDate)).format(config.cmsDateFormat) : '-';
				}

				// Highlight row red for offboarded child
				if (element.child.childOffboardingStatus) {
					let rowBackgroundColor = 'rgb(255, 230, 230)';
					dataObject['highlight'] = rowBackgroundColor;
				}
				// End

				// create day columns initialized with dash
				this.days.forEach(x => dataObject[x] = '-');



				element.childBookingSessionDetailLogs?.forEach(session =>
				{
					this.filterData(session);
					dataObject[session.day] = element.bookingType == 'multiple_sessions' ? '-': this.getDateString(session);
				});
				dataToSend.push(dataObject);
			});
		}
		this.tableConfigAndProps = {
			ActionButtons: this.actionButtons,
			inputData: this.inputData,
			columnHeader: this.columnHeader,
			dataSource: new MatTableDataSource(dataToSend),
			pagination: this.pagination
		};

		// this.title = this.title + " (" + this.pagination.count + ")"
	}

	filterData(element)
	{
		//  console.log(element,"this is element")
		element['startTime'] = this.converMiliToTime(element['startTime'])
		element['endTime'] = this.converMiliToTime(element['endTime'])
		// element['sessionId'] = element['sessionId']
		// element['day'] = element.branch?.day

	}

	getDateString(element)
	{
		return element['startTime'] + ' - ' + element['endTime']
		// var startdate= new Date(element['startDate']).toISOString().slice(11,19)
		// var start= moment(startdate,"hh:mm:ssss").format("hh:mm A")
		// var endDate= new Date(element['endDate']).toISOString().slice(11,19)
		// var end= moment(endDate,"hh:mm:ssss").format("hh:mm A")
	}

	converMiliToTime(element)
	{
		if (element != 0)
		{
			// var date = new Date(element).toISOString().slice(11, 19)
			// return moment(date, "hh:mm:ssss").format("hh:mm A")
			// var date = new Date(element * 1000)
			// return moment(date).format("hh:mm A")
			var date = moment((element * 1000) + (new Date(element * 1000).getTimezoneOffset()*60000)).format("hh:mm A");
			return date;
		}
		else 
		{
			return ""
		}
	}

	actionButtonOutput(event)
	{
		if (event.item.type === "delete")
		{
			this.onDelete(event.row, event.item)
		} else
		{
			let url = '/main/' + event.item.buttonRoute + '/' + event.row.id + '/' + event.item.buttonLabel.toLowerCase() + "-logs";

			if (this.isMultiple)
			{
				url = url + '/' + this.firstFormName + '/' + event.row.id + '/' + event.item.buttonLabel.toLowerCase() + "-logs";
			}
			this.router.navigateByUrl(url);
		}
	}

	filnalFilters(event): void
	{
		let filterUrl = '';
		if (event.date)
		{
			const urlParams = new URLSearchParams(event.date);
			const dt = urlParams.get('date');
			event.filter.push({ 'key': 'joiningDate', 'value': dt });
		}

		if (event.filter.length > 0)
		{
			filterUrl = '&attributes=' + JSON.stringify(event.filter);
		}
		else if (event.filter.length == 0)
		{
			filterUrl = '&attributes=[]';
		}

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
			this.paginationUrl = '&page=' + '1' + '&perPage=' + this.perPage;
		}
		this.getList(filterUrl)
	}

	getChildAge(child) {
		// Find Age of child

		let dob = child.dateOfBirth;

		if (!dob) return '';

		let a = moment(dob);
		let b = moment();

		let ageYear = b.diff(a, 'year');
		let months = b.diff(a, 'months');
		let ageMonth = months - (ageYear * 12);

		return `${ageYear} year(s) ${ageMonth} month(s)`;
	}

	getBookingTypeName(type) {
		let val = 'Recurring';	
		switch (type) {
		  case 'adhoc_session':
			  val = 'Adhoc'
			  break;
		  case 'multiple_sessions':
			  val = 'Multiple'
			  break;	
		
		  default:
			  break;
		}
  
		return val;
	}

	sortColumn(e) {

		this.sortBy = e.field;

		if (e.field == 'child') {
			this.sortBy = 'firstName';
		}

		if (e.field == 'room') {
			this.sortBy = 'roomId';
		}
		  
		this.sortUrl = `&sortBy=${this.sortBy}&sortOrder=${e.order}`;
		this.getList(this.filterUrl);
	}

}
