import { Component, OnInit, Input, EventEmitter, Output, OnDestroy} from '@angular/core';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, PermissionService, CommunicationService } from 'src/app/services';
import { MatDialog } from '@angular/material/dialog';
import { EventDialogComponent } from 'src/app/core/event-dialog/event-dialog.component';
import * as moment from 'moment';
import { config } from 'src/config';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-calender',
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.scss']
})
export class CalenderComponent extends GlobalListComponent implements OnInit, OnDestroy {
  colors: any = {
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
      secondary: '#A73DF9'
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
  @Input() viewDate: any;
  @Input() view: any;
  @Input() currentTerm: any;
  @Input() terms: any;
  @Input() nesEligibleWeeks: any;
  @Output() refreshData: EventEmitter<any> = new EventEmitter();

  themecolor: any = '#0a5ab3';
  events: any;

  tableConfigAndProps = {};
  type = "present"
  year = "2021";
  tempTerms = [];
  currentHolidays = [
    { "backColor": "#00D1004D", "borderColor": "#00D100", "date": "01 Jan 2021", "description": "New Year Holiday" },
    { "backColor": "#00AFBB1A", "borderColor": "#00AFBB", "date": "02 April 2021", "description": "25 Dec 2021 - 01 Jan 2022" },
    { "backColor": "#ECD4FF", "borderColor": "#A73DF9", "date": "25 Dec 2021 - 01 Jan 2022", "description": "Christmas Holidays" }
  ];

  inputData = {
    'imageColumn': 'profilePicture',
    'actionColumn': 'Actions',
    'roundedTable': false,
    'hasPreCircle': true,
    'buttonEvent': "output",
    'preCircleCol': 'date',
    'hasTitle': true
  }

  dataSource = new MatTableDataSource();
  sub: Subscription

  constructor(protected dialog: MatDialog, protected router: Router, protected apiService: ApiService, protected comm: CommunicationService,
     protected _route: ActivatedRoute, protected alertService: AlertService, protected pmSrv: PermissionService) {
    super(router, apiService, alertService, pmSrv);

    this.sub = this.comm.calendarYearChange.subscribe((c)=> {
      console.log('TRIGGERED');
      
       this.callApi();
    })

    this.actionButtons = [
      { buttonLabel: "Edit", type: 'edit', buttonRoute: "event", visibility: this.pmSrv.getPermissionsBySubModuleName(config.md_hr_m, config.sub_md_hr_calendar).update },
      { buttonLabel: "Delete", type: 'delete', buttonRoute: "event", visibility: this.pmSrv.getPermissionsBySubModuleName(config.md_hr_m, config.sub_md_hr_calendar).delete }
    ];

    this.columnHeader = {
      'date': 'Date', 'description': 'Description', 'Actions': 'Actions',
    };

    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData, columnHeader: this.columnHeader, dataSource: new MatTableDataSource(this.currentHolidays),
    };
  }

  ngOnInit(): void {
    // this.callApi();
    // this.getEventsTableData();
  }

  ngOnChanges(): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    // if (this.view != 'term') {
    //   this.terms = this.terms.slice(2);
    // }
    this.tempTerms = [...this.terms];
    console.log(this.terms);
    
    
  }

  callApi() {
    let currentYear = new Date().getFullYear();
    let timeStatus = this.viewDate.getFullYear() > currentYear ? 'future' : this.viewDate.getFullYear() == currentYear ? 'present' : 'past';

    this.listApi = config.base_url_slug + 'view/events';
    let filterUrl = 'timeStatus='+ timeStatus +'&attributes=[{"key": "branchId","value": "' + localStorage.getItem('branchId') + '" }]&otherAttributes=[{"key": "view","value": "list" }, {"key": "year","value": "' + this.viewDate.getFullYear() + '" }]&perPage=2000'
    console.log(this.filterUrl)
    this.getList(filterUrl)
    super.ngOnInit();
  }

  actionClicked(event) {
    // console.log(event,"action clicked");
  }

  eventClicked(event) {
    // console.log(event,"event clicked")
  }

  openDialog(event) {
    if (!this.pmSrv.getPermissionsBySubModuleName(config.md_hr_m, config.sub_md_hr_calendar).create)
    {
      return;
    }

    this.terms.forEach(element => {
      if (event.date >= this.getGMT(element.startDate) && event.date <= this.getGMT(element.endDate)) {
        event['termId'] = element.id;
      }
    });
    console.log(event);

    let dialogRef = this.dialog.open(EventDialogComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      width: '30%',
      panelClass: 'my-dialog',
      data: {
        event: event
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        if (result.value.operation == 'add') {
					event.type = 'add';
				}

        event.type === "add" ? this.onSubmit('add', result, null) : this.onSubmit('edit', result, event.event.id)
      }
    })
  }

  onSubmit(type, Form, id): void {
    if (Form.invalid) {
      this.alertService.alertError('WARNING', 'Please fill the required data.');
      return;
    } else {

      let formData = Object.assign({}, Form.value);
      // Convert to YYYY-MM-DD
      let eventStartDate = moment(formData['startDate']).format(config.serverDateFormat);
			let eventEndDate = moment(formData['endDate']).format(config.serverDateFormat);
      // End
      let sdc = this.getGMT(eventStartDate);
      let edc = this.getGMT(eventEndDate);
      let termIds = [];
      this.terms.forEach(element => {
        let sdt = this.getGMT(element.startDate);
        let edt = this.getGMT(element.endDate);
        if (sdc >= sdt && sdc <= edt ||
          sdc < sdt && edc < edt && sdc < edt && edc >= sdt ||
          sdc < sdt && edc > edt ||
          sdc < sdt && edc > sdt && edc <= edt) {
          termIds.push(element.id);
        }
      });

      if (termIds.length > 1) {
        termIds.forEach((element, idx) => {
          let eventData = Object.assign({}, Form.value);
          let term = this.terms.find(t => element === t.id);
          if (term) {
            let sdt = this.getGMT(term.startDate);;
            let edt = this.getGMT(term.endDate);
            if (sdc >= sdt && sdc <= edt) {
              eventData['endDate'] = term.endDate;
            } else if (sdc < sdt && edc < edt && sdc < edt && edc >= sdt) {
              eventData['startDate'] = term.startDate;
            } else if (sdc < sdt && edc > edt) {
              eventData['startDate'] = term.startDate;
              eventData['endDate'] = term.endDate;
            } else if (sdc < sdt && edc > sdt && edc <= edt) {
              eventData['startDate'] = term.startDate;
            }
            eventData['termId'] = term.id;
          }

          if (Form.get('termId').value && Form.get('termId').value == eventData['termId']) {
            eventData['id'] = id;
            this.onProcessTerm(type, eventData, termIds.length - (idx + 1));
          } else {
            this.onProcessTerm('Add', eventData, termIds.length - (idx + 1));
          }
        });
      } else {
        formData['termId'] = termIds[0];
        formData['id'] = id;
        this.onProcessTerm(type, formData, 0);
      }
    }
  }

  onProcessTerm(type, formData, zero) {
    let sd = formData['startDate'];
    let ed = formData['endDate'];
    formData['startDate'] = moment(sd).format(config.serverDateFormat);
    formData['endDate'] = moment(ed).format(config.serverDateFormat);

    if (type == 'edit') {
      this.onUpdateTerm(config.base_url_slug + 'update/event/' + formData['id'], formData, zero);
    } else {
      this.onAddTerm(config.base_url_slug + 'add/event', formData, zero);
    }
  }

  onAddTerm(formApi, formData, records) {
    this.apiService.post(formApi, formData).then(response => {
      if (response.code == 201 || response.code == 200) {
        if (records == 0) {
          this.alertService.alertSuccess(response.status, response.message).then(result => {
            this.callApi();
            this.refreshData.emit();
          });
        }
      } else {
        this.alertService.alertError(response.status, response.message);
      }
    })
  }

  onUpdateTerm(formApi, formData, records) {
    this.apiService.patch(formApi, formData).then(response => {
      if (response.code == 200 || response.code == 201) {
        if (records == 0) {
          this.alertService.alertSuccess(response.status, response.message).then(result => {
            this.callApi();
            this.refreshData.emit();
          });
        }
      } 
      // else if (response.code == 201) {
      //   this.alertService.alertAsk('SUCCESS', response.message, 'Yes', 'No',false).then(result => {
      //     if (result) {
      //       this.router.navigate(['main/finance/allInvoice']);
      //     } else {
      //       this.callApi();
      //       this.refreshData.emit();
      //     }
      //   })
      // }
      else {
        this.alertService.alertError(response.status, response.message);
      }
    })
  }

  afterListResponse(): void {
    let terms = this.tempTerms.slice(2);
    this.events = terms.slice();
    console.log(this.dataItems); 
    this.dataItems.forEach((element, index) => {

      let sd = this.getGMT(element.startDate);
      element['startDate'] = sd;
      // element['startDate'] = moment(new Date(element.endDate).setHours(0)).toDate();

      let ed = this.getGMT(element.endDate);
      element['endDate'] = ed;
      // element['endDate'] = moment(new Date(element.endDate).setHours(0)).toDate();


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

      // element.startDateDisplay = this.setDateHours(element.startDate);
      // element.endDateDisplay = this.setDateHours(element.endDate);
      element.date = element.startDate == element.endDate ? moment(new Date(element.startDate)).format(config.serverDateFormat): moment(new Date(element.startDate)).format(config.cmsDateFormat)+ " - " + moment(new Date(element.endDate)).format(config.cmsDateFormat);

      element.type === 'bankHolidays' ? element['color'] = this.colors.orange :
      element.type === 'notEligibleForStretching' ? element['color'] = this.colors.darkGreen :
      element['color'] = this.colors.purple;
      this.events.push(element);
    });

    this.dataSource = new MatTableDataSource(this.dataItems);
  
    // Update table data
    this.tableConfigAndProps['dataSource'] = this.dataSource;
    // this.tableConfigAndProps['pagination'] = this.pagination; 
    console.log('>>>>>>>>>>>', this.events);
    
  }

  getEventsTableData() {
    
    let endpoint = config.base_url_slug +'view/events?timeStatus=present&attributes=[{"key": "branchId","value": "' + localStorage.getItem('branchId') + '" }]&otherAttributes=[{"key": "view","value": "list" }]';
    // let invoiceIds = [item.row.id];
    let data = {};
    this.apiService.get(endpoint).then((res)=> {

      // Patch listing values for table
      this.currentHolidays = res.listing;
      this.dataSource = new MatTableDataSource(this.currentHolidays);
      let pagination = res.data.pagination;


      // Update table data
      this.tableConfigAndProps['dataSource'] = this.dataSource;
      this.tableConfigAndProps['pagination'] = pagination; 


    })
    .catch(err => {
      this.alertService.alertError(err.error.status, err.error.message).then(result => {
        // this.getList(this.filterUrl);
      })
    })
  }

  actionButtonOutput(e) {
    console.log(e);
    switch (e.item.type) {

      case 'edit':
        this.openDialog({event:e.row});
       break;

       case 'delete':
        this.onDelete(e.row, e.item);
        break;

      default:
        break;
    }

  }

  afterDeleteSuccess() {
    this.refreshData.emit();
  }

  getGMT(input) {
    let date = new Date(input);
    return new Date(date.valueOf() + date.getTimezoneOffset() * 60000);
  }

  setDateHours(input) {
		let date = new Date(input);
		return new Date(date.valueOf() + date.getTimezoneOffset() * 60000);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
