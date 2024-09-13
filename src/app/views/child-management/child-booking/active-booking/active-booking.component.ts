import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, PermissionService, CommunicationService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { config } from 'src/config';
import { EndBookingDialogComponent } from 'src/app/shared/end-booking-dialog/end-booking-dialog.component';
@Component({
	selector: 'app-active-booking',
	templateUrl: './active-booking.component.html',
	styleUrls: ['/src/app/views/shared-style.scss']
})
export class ActiveBookingComponent extends GlobalListComponent implements OnInit
{
	tableConfigAndProps = {};
	dataSource = new MatTableDataSource();
	buttonHeaderProps: any;
	// @Input() idToSend: any;
	// @Input() patternTosend: any;
	@Output() onDeleteShift: EventEmitter<any> = new EventEmitter<any>();
	layoutAlign = "start start"
	headerProps = {
		searchConfig: { label: 'Enter Child Name', key: 'branchId', value: '' },
		builtInFilters: { key: 'branchId', value: localStorage.getItem('branchId') },
		filterArray: [{
			label: 'Select Room', type: 'search', key: 'roomId', selected: 'All',
			options: this.rooms
		},],
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

	constructor(private dialog: MatDialog, protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected permissionService: PermissionService,protected communicationService : CommunicationService)
	{
		super(router, apiService, alertService, permissionService);
			// 'buttonEvent': 'output'  on events
		this.actionButtons = [
			{ buttonLabel: "Edit", buttonRoute: "child-booking", visibility: this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Booking Manager').update, hide: true },
			{ buttonLabel: "View", buttonRoute: "child-booking", visibility: this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Booking Manager').read,  hide: true },
			{ buttonLabel: "Delete", type: 'delete', buttonRoute: "child", visibility: this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Booking Manager').delete },
			{ buttonLabel: "End Booking", isConditional: true, condition:{key: 'booking-type', value: 'Recurring'}, type: 'output', buttonRoute: "child-booking", visibility: this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Booking Manager').delete },
		]
		this.columnHeader = {
			'id': 'ID', 'room': 'Room', 'booking-type': 'Type', 'child': 'Child Name', 'age': 'Age', 'guardianName': 'Parent Name', 'joiningDate': 'Start', 'leavingDate': 'End Date', 'type': 'Valid', 'monday': 'Mon', 'tuesday': 'Tue',
			'wednesday': 'Wed', 'thursday': 'Thu', 'friday': 'Fri', 'Actions': 'Actions',
		};

		this.tableConfigAndProps = {
			ActionButtons: this.actionButtons,
			inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
		};
		this.communicationService.unSavedForm.next(false);

	}

	ngOnInit(): void
	{
		// this.detailApi = config.base_url_slug +'view/child/6';		
		this.listApi = config.base_url_slug +'view/childs/session-booking';
		this.getRooms(localStorage.getItem('branchId'));
		// this.getList()
		super.ngOnInit();
		this.isMultiple = false;
		this.firstFormName = 'booking-detail';
	}
	afterRoom()
	{
		console.log("after rooms are ", this.rooms)
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
		let dataToSend = []

		// console.log(this.dataItems, "this is in list")

		if (this.dataItems?.length != 0)
		{
			this.dataItems.forEach(element =>
			{
				let dataObject = {}
				// console.log(element, "==========>")
				dataObject['branchId'] = element?.branchId
				dataObject['roomId'] = element?.roomId
				dataObject['childId'] = element?.childId
				dataObject['room'] = element?.room
				dataObject['age'] = this.getChildAge(element?.child)
				dataObject['child'] = element?.child.firstName + " " + element?.child.lastName
				dataObject['guardianName'] = element?.child?.guardianName ? element?.child?.guardianName : '-'
				dataObject['booking-type'] = this.getBookingTypeName(element?.bookingType)

				dataObject['id'] = element?.id
				dataObject['type'] = element?.validityType == 'fullYear' ? 'Full Year' : element?.validityType == 'nonTerm' ? 'Non Term' : element?.validityType == 'termOnly' ? 'Term Only' : element?.validityType
				dataObject['joinDate'] = element.joiningDate;
				dataObject['joiningDate'] = element.joiningDate != null ? moment(new Date(element.joiningDate)).format(config.cmsDateFormat) : '-';
				dataObject['leavingDate'] = element.leavingDate != null ? moment(new Date(element.leavingDate)).format(config.cmsDateFormat) : '-';
				dataObject['lastInvoicedDate'] = element.lastInvoicedDate;

				// Highlight row red for offboarded child
				if (element.child.childOffboardingStatus) {
					let rowBackgroundColor = 'rgb(255, 230, 230)';
					dataObject['highlight'] = rowBackgroundColor;
				}
				// End
				
				// create day columns initialized with dash
				this.days.forEach(x => dataObject[x] = '-');

			    // create day columns initialized with dash
	              this.days.forEach(x => dataObject[x] = '-');

				// if (element?.type)
				// {
				// 	dataObject['type'] = element?.type == 'termOnly' ? 'Term Time' : element?.type;
				// 	dataObject['type'] = element?.type == 'nonTerm' ? 'Non Term Time' : element?.type;
				// 	dataObject['type'] = element?.type == 'fullYear' ? 'All Year' : element?.type;
				// }

				element.childBookingSessions?.forEach(session =>
				{
					this.filterData(session);
					dataObject[session.day] = element.bookingType == 'multiple_sessions' ? '-': this.getDateString(session);
                    // dataObject[session.day] = element.bookingType == 'adhoc_session' ? '-': this.getDateString(session);

				});
				dataToSend.push(dataObject);
			});

			// console.log(dataToSend)
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

		element['startTime'] = this.converMiliToTime(element['startTime']);
		element['endTime'] = this.converMiliToTime(element['endTime']);

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

	getDateString(element)
	{
		return element['startTime'] + ' - ' + element['endTime']
	}

	converMiliToTime(element)
	{
		if (element != 0)
		{
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
		console.log('actionButtonOutput ==> ', event);
		if (event.item.type === "delete") {
            this.onDelete(event.row, event.item)
            switch(event.item.buttonRoute) {
                case 'child': {
                    localStorage.removeItem('child-id')
                   break;
                }
                case 'staff': {
                    localStorage.removeItem('staff-id')
                   break;
                }
             }
        } else if (event.item.type === "output") {
			this.endBookingDialog(event.row.id, event.row)
		}
		else
		{
			console.log("going to navigate")
			this.router.navigateByUrl('/main/' + event.item.buttonRoute + '/' + event.row.id + '/' + event.item.buttonLabel.toLowerCase());
		}
	}

	onDelete(row, item)
	{
		console.log("row ", row);

		var url = config.base_url_slug +"remove/" + item.buttonRoute + '/session-booking' + '/' + row.id;
		// console.log("delete url is " + url)
		let heading = 'Delete Item?';
		let message = 'Are you sure you want to end this booking ?';
		let rightButton = 'Delete';
		let leftButton = 'Cancel';
		this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then(result =>
		{
			if (result)
			{
				this.apiService.delete(url).then(result =>
				{
					if (result.code == 200 || result.code == 201)
					{
						this.getList(this.filterUrl);
						let title = result.code == 201 ? 'Regenerate' : result.status;
						this.alertService.alertSuccess(title, result.message);
					}
					else
					{
						this.alertService.alertError(result.status, result.message);
					}
				});
			}
		})

	}

	endBookingDialog(id, data) {
		let dialogRef = this.dialog.open(EndBookingDialogComponent, { autoFocus: false });
        dialogRef.componentInstance.bookingId = id;
		dialogRef.componentInstance.bookingData = data;

        dialogRef.afterClosed().subscribe(result =>
        {
            if (result) {
				this.getList(this.filterUrl);
			}
        });
	}

	// actionButtonOutput(event) {
    //  console.log(event);

	// }

	filnalFilters(event): void
    {
        let filterUrl = '';
		if (event.date)
        {
			const urlParams = new URLSearchParams(event.date);
			const dt = urlParams.get('date');
			event.filter.push({'key': 'joiningDate', 'value': dt });
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
