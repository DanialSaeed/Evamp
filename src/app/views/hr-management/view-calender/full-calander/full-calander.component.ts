import { element } from 'protractor';
import
{
	Component,
	ViewChild,
	TemplateRef
} from '@angular/core';
import
{
	startOfDay,
	endOfDay
} from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import
{
	CalendarEvent,
	CalendarEventTimesChangedEvent,
	CalendarView,
} from 'angular-calendar';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, PermissionService, CommunicationService } from 'src/app/services';
import { MatDialog } from '@angular/material/dialog';
import { EventDialogComponent } from 'src/app/core/event-dialog/event-dialog.component';
import * as moment from 'moment';
import { config } from 'src/config';


const colors: any = {
	red: {
		primary: '#ad2121',
		secondary: '#FAE3E3'
	},
	blue: {
		primary: '#00AFBB1A',
		secondary: '#D1E8FF'
	},
	yellow: {
		primary: '#FFF7004D',
		secondary: '#FDF1BA'
	},
	green: {
		primary: '#00D1004D',
		secondary: '#FDF1BA'
	},
	purple: {
		primary: '#ECD4FF',
		secondary: '#FDF1BA'
	},
	orange: {
		primary: '#FF9F1080',
		secondary: '#FDF1BA'
	},
	darkGreen: {
		primary: '#ff9a8e',
		secondary: '#ca1818'
	}
};
enum PageView
{
	Month = "month",
	Term = "term",
	Year = "year"
}

@Component({
	selector: 'app-full-calander',
	templateUrl: './full-calander.component.html',
	styleUrls: ['/src/app/views/shared-style.scss', './full-calander.component.scss']
})

export class FullCalanderComponent extends GlobalListComponent
{
	@ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;
	view: string = "month";
	CalendarView = CalendarView;
	viewDate: Date = new Date();
	modalData: {
		action: string;
		event: CalendarEvent;
	};
	terms = [];
	events: CalendarEvent[];
	currentTerm: any;
	monthTerm: any;
	refresh: Subject<any> = new Subject();
	activeDayIsOpen: boolean = true;
	nesEligibleWeeks: Number;
	displayTerms = [];

	constructor(protected dialog: MatDialog, private modal: NgbModal, protected router: Router, protected apiService: ApiService, protected comm: CommunicationService,
		 protected _route: ActivatedRoute, protected alertService: AlertService, protected pmSrv: PermissionService)
	{
		super(router, apiService, alertService, pmSrv);
		// this.getTerms();
		this.callApi();
		super.ngOnInit();
	}

	callApi()
	{
    let currentYear = new Date().getFullYear();
    let timeStatus = this.viewDate.getFullYear() > currentYear ? 'future' : this.viewDate.getFullYear() == currentYear ? 'present' : 'past';
    console.log(timeStatus);
    // this.viewDate.getFullYear()
		this.listApi = config.base_url_slug +'view/events';
    // let filterUrl = '';
		let filterUrl = 'timeStatus='+ timeStatus + '&attributes=[{"key": "branchId","value": "' + localStorage.getItem('branchId') + '" }]&otherAttributes=[{"key": "view","value": "calendar" },{"key": "year","value": ' + this.viewDate.getFullYear() +  '}]'; // replace list with calendar
    console.log(filterUrl);
		this.getList(filterUrl);
    this.getTerms();
	}

	termType(type)
	{
		this.displayTerms.forEach(term =>
		{
			term.name === type ? this.currentTerm = term : '';
		});
	}

	getTermWord(term)
	{
		return term.split(" ")[0];
	}

	dayClicked(event): void
	{
		console.log(event);
		if (event.day.inMonth && event.day.events?.length != 0)
		{
			var events = event.day.events
			for (var i = 0; i < events.length; ++i)
			{
				if (events[i].type == "term")
				{
					this.openDialog({ type: 'add', date: event.day.date, view: 'month' })
					break;
				}
				else
				{
					this.openDialog({ event: events[i], view: 'month' })
					break;
				}
			}
		}
		else if (event.day.inMonth)
		{
			this.openDialog({ type: 'add', date: event.day.date, view: 'month', 'termId': this.currentTerm.id });
		}
	}

	openDialog(event)
	{
		if (!this.pmSrv.getPermissionsBySubModuleName(config.md_hr_m, config.sub_md_hr_calendar).create)
		{
		  return;
		}

		// this.terms.forEach(element => {
		// 	if (event.date >= this.getGMT(element.startDate) && event.date <= this.getGMT(element.endDate)) {
		// 		event['termId'] = element.id;
		// 	}
		// });

		this.terms.forEach(element => {
			if (event.date >= element.startDate && event.date <= element.endDate) {
				event['termId'] = element.id;
			}
		});
        console.log(event);
		let dialogRef = this.dialog.open(EventDialogComponent, {
			autoFocus: false,
			maxHeight: '90vh',
			width: '30%',
			data: {
				event: event
			}
		});
		dialogRef.afterClosed().subscribe(result =>
		{
			if (result)
			{
				if (result.value.operation == 'add') {
					event.type = 'add';
				}

				event.type === "add" ? this.onSubmit(config.base_url_slug +"add/event", 'add', result) : this.onSubmit(config.base_url_slug +'update/event/' + event.event.id, 'edit', result)
			}
		})
	}

	onSubmit(formApi, type, Form): void
	{
		if (Form.invalid)
		{
			this.alertService.alertError('WARNING', 'Please fill the required data.');
			return;
		}
		else
		{
			let formData = Form.value;
			formData['startDate'] = moment(formData['startDate']).format(config.serverDateFormat);
			formData['endDate'] = moment(formData['endDate']).format(config.serverDateFormat);
			if (type == 'edit')
			{
				this.apiService.patch(formApi, formData).then(response =>
				{
					if (response.code == 201 || response.code == 200)
					{
						this.alertService.alertSuccess(response.status, response.message).then(result =>
						{
							this.callApi()
						});
					}
					// else if (response.code == 201) {
					// 	this.alertService.alertAsk('SUCCESS', response.message, 'Yes', 'No',false).then(result => {
					// 	  if (result) {
					// 		this.router.navigate(['main/finance/allInvoice']);
					// 	  } else {
					// 		this.callApi()
					// 	  }
					// 	})
					//   }
					else
					{
						this.alertService.alertError(response.status, response.message);
					}
				})
			}
			else
			{
				this.apiService.post(formApi, formData).then(response =>
				{
					if (response.code == 201 || response.code == 200)
					{
						this.alertService.alertSuccess(response.status, response.message).then(result =>
						{
							this.callApi()
						});
					}
					else
					{
						this.alertService.alertError(response.status, response.message);
					}
				})
			}
		}
	}

	eventTimesChanged({
		event,
		newStart,
		newEnd,
	}: CalendarEventTimesChangedEvent): void
	{
		this.events = this.events.map((iEvent) =>
		{
			if (iEvent === event)
			{
				return {
					...event,
					start: newStart,
					end: newEnd,
				};
			}
			return iEvent;
		});
		this.handleEvent('Dropped or resized', event);
	}

	handleEvent(action: string, event: CalendarEvent): void
	{
		this.modalData = { event, action };
		this.modal.open(this.modalContent, { size: 'lg' });
	}

	addEvent(): void
	{
		this.events = [
			...this.events,
			{
				title: 'New event',
				start: startOfDay(new Date()),
				end: endOfDay(new Date()),
				color: colors.red,
				draggable: true,
				resizable: {
					beforeStart: true,
					afterEnd: true,
				},
			},
		];
	}

	deleteEvent(eventToDelete: CalendarEvent)
	{
		this.events = this.events.filter((event) => event !== eventToDelete);
	}

	setView(view: string)
	{
		this.view = view;
		localStorage.setItem('type', this.view)
		// if (this.view == "month")
		// {
			this.callApi();
		// }

		// if (this.view == "year")
		// {
		// 	this.callApi();
		// }
	}

	closeOpenMonthViewDay()
	{
		this.activeDayIsOpen = false;
		// if (this.view == "month")
		// {
			this.callApi();
		// }

		// if (this.view == "year")
		// {
		// 	this.callApi();
		// }
	}

	getList(filterUrl?: any): void
	{
		let url = this.listApi + '?';
		this.filterUrl = '';
		if (filterUrl)
		{
			url = url + filterUrl;
			this.filterUrl = filterUrl;
		}

		if (this.paginationUrl)
		{
			url = url + this.paginationUrl;
		}

		this.apiService.get(url).then(result =>
		{
			if (result.code === 200)
			{
				this.dataItems = result.data.calendar;
				this.nesEligibleWeeks = result?.data?.AvailableWeeksForStretching;
				this.afterListResponse();
			}
			else
			{
				this.dataItems = [];
				this.alertService.alertError(result.status, result.message);
			}
		});
	}

	afterListResponse(): void
	{
		this.events = [];
		// const month = this.viewDate.toLocaleString('default', { month: 'short' });
		const date = moment(this.viewDate);
		const monthName = date.format('MMM');
        console.log(this.dataItems);

	// this.dataItems[11].term = [{
	// 	branchId: 73,
	// 	createdTime: 1639647807,
	// 	endDate: "2021-12-31",
	// 	id: 1299,
	// 	name: "Autumn Term",
	// 	startDate: "2021-09-01",
	// 	status: true,
	// 	updatedTime: 1639647807,
	// }]
		this.dataItems.forEach((element, index) =>
		{
			if (element.month == monthName)
			{
				// Setting all bankholidays at start of array and rest after it.
				let tempHolidays = [];
				let nesHolidays = [];
				tempHolidays = element.holidays.filter(e => e.type == 'bankHolidays');
                nesHolidays = element.holidays.filter(e => e.type == 'notEligibleForStretching');
				tempHolidays = [...tempHolidays, ...element.holidays.filter(e => e.type != 'bankHolidays' && e.type != 'notEligibleForStretching'), ...nesHolidays];
				console.log(tempHolidays);
				element.holidays = tempHolidays;
				// End

				element.holidays?.forEach(holiday =>
				{
					var start = this.getGMT(holiday.startDate);
					var end =  this.getGMT(holiday.endDate);
					holiday['start'] = start;
					holiday['end'] = end;
					holiday['startDate'] = start;
					holiday['endDate'] = end;
					holiday['title'] = holiday.description;
					holiday['actions'] = null;
					holiday['title'] = holiday.description;
					holiday['isDiscountedHoliday'] = holiday.isDiscountedHoliday;

					holiday.type === 'bankHolidays' ? holiday['color'] = colors.orange :
					holiday.type === 'notEligibleForStretching' ? holiday['color'] = colors.darkGreen :
					holiday['color'] = colors.purple;

					holiday['allDay'] = true;
					this.events.push(holiday);
				});
				element.term?.forEach(term =>
				{
					term['start'] = moment(new Date(term.startDate).setHours(0)).toDate();
					// if (term.name != 'Autumn Term') {
					// 	term['end'] = moment(new Date(term.endDate).setHours(0)).subtract(1, 'days').toDate();
					// 	term['endDate'] = moment(new Date(term.endDate).setHours(0)).subtract(1, 'days').toDate();
					// }
					// else
					// {
						term['end'] = moment(new Date(term.endDate).setHours(0)).toDate();
						term['endDate'] = moment(new Date(term.endDate).setHours(0)).toDate();
					// }
					// debugger;
					term.name === 'Spring Term' ? term['color'] = colors.blue :
					term.name === 'Summer Term' ? term['color'] = colors.green : term['color'] = colors.yellow
					term['type'] = "term";
					term['allDay'] = true;
					term['termId'] = term['id'];
					this.events.push(term);
				});
			}
		});
		console.log(this.view);
		console.log(this.terms);
		console.log(this.events);
		
	}

	getTerms(): any
	{
		let url = config.base_url_slug +'view/terms?attributes=[{"key":"branchId" , "value": "'+localStorage.getItem('branchId')+'"}]&otherAttributes=[{"key": "year","value": "'+this.viewDate.getFullYear()+'" }]';
		this.apiService.get(url).then(res =>
		{
			if (res.code == 200)
			{
				this.terms = res.data;
				this.terms.forEach(term => {
					let cDate = new Date();
					cDate.setHours(0);
					cDate.setMinutes(0);
					cDate.setSeconds(0);
                    let sd = this.getGMT(term.startDate);
                    term.startDate = sd;

                    let ed = this.getGMT(term.endDate);
					term.endDate = ed;

					// if (cDate >= term.startDate && cDate <= term.endDate) {
					// 	this.currentTerm = term;
					// }

					// if (term.name != 'Autumn Term')
					// {
					// 	term.endDate = moment(term.endDate).subtract(1, 'days').toDate();
					// 	term.end = moment(term.endDate).subtract(1, 'days').toDate();
					// }
					// else
					// {
						term.endDate = moment(new Date(term.endDate).setHours(0)).toDate();
						term.end = moment(new Date(term.endDate).setHours(0)).toDate();
					// }

					term['type'] = 'term';
					if (term.name === 'Spring Term')
					{
						term['color'] = colors.blue;
						term['description'] = 'blue term';
					}
					else if (term.name === 'Summer Term')
					{
						term['color'] = colors.green;
						term['description'] = 'green term';
					}
					else if (term.name === 'Autumn Term')
					{
						term['color'] = colors.yellow;
						term['description'] = 'yellow term';
					}
				});
				this.displayTerms = [...this.terms].slice(2);
				this.currentTerm = this.displayTerms.find(x => x.name == 'Spring Term');
			}
			else
			{
				this.terms = [];
			}

			this.comm.calendarYearChange.next();
			console.log(this.view);
			console.log(this.terms);
			console.log(this.events);
		});
	}

	getTermClass(term)
	{
		let termclass = ''
		switch(term)
		{
			case 'Spring Term':
				termclass = 'term-spring';
				break;
			case 'Summer Term':
				termclass = 'term-summer';
				break;
			case 'Autumn Term':
				termclass = 'term-autumn';
				break;
		}
		return termclass;
	}

	getGMT(input)
	{
		let date = new Date(input);
		return new Date(date.valueOf() + date.getTimezoneOffset() * 60000);
	}
}
