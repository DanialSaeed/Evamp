import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { config } from 'src/config';

@Component({
  selector: 'app-session-rate-history',
  templateUrl: './session-rate-history.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class SessionRateHistoryComponent extends GlobalListComponent implements OnInit
{
  tableConfigAndProps = {};
  dataSource = new MatTableDataSource();
  buttonHeaderProps: any;
  @Output() emitSessionPricing: EventEmitter<any> = new EventEmitter<any>();
  @Output() isHistoryExists: EventEmitter<any> = new EventEmitter<any>();
  sessionId: any;

  inputData = {
    'imageColumn': 'profilePicture',
    'actionColumn': '',
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
        { buttonLabel: "Edit", buttonRoute: "", visibility: this.permissionsService.getPermissionsByModuleName('Session Management').update },
      ]
    this.headerButtons = [
      { buttonLabel: "Create Session", color: "#E2AF2A", buttonRoute: "session/add", isMultiple: false, firstFormName: 'session-info', visibility: this.permissionsService.getPermissionsByModuleName('Session Management').create },
    ]
    // , 'Actions': 'Actions'
    this.columnHeader = {
      'session': 'Session', 'sessionPricingEffectiveFrom': 'Effective From', 'sessionPricingEffectiveTo': 'Effective To', 'ageBand': 'Age Band', 'dailyTimeRate': 'Daily Rate', 'fullTimeRate': 'Full-Time Rate', 'hourlyTimeRate': 'Hourly Rate'
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
    let sub = this._route.params.subscribe(params =>
    {
      this.sessionId = params['id'];
    })

    if (this.sessionId != 'add')
    {
      this.listApi = config.base_url_slug + 'view/session-pricing-logs?attributes=[{"key": "sessionId","value":' + this.sessionId + '}]';
      this.getList()
    }
    super.ngOnInit();
  }

  ngOnInit(): void
  {
  }
  afterListResponse(): void
  {
    this.dataItems.forEach(element =>
    {
      let ageBand = [];
      let hourlyTimeRate = [];
      let fullTimeRate = [];
      let dailyTimeRate = [];
      element['sessionPricingEffectiveFrom'] = element.sessionPricingEffectiveFrom != null ? moment(new Date(element.sessionPricingEffectiveFrom)).format(config.cmsDateFormat) : '-';
      element['sessionPricingEffectiveTo'] = element.sessionPricingEffectiveTo != null ? moment(new Date(element.sessionPricingEffectiveTo)).format(config.cmsDateFormat) : 'Present';

      for (let i = 0; i < element.sessionRate.length; i++)
      {
        let rate = element.sessionRate[i];

        let dTimeRate = rate.dailyTimeRate != '0.00' ? rate.dailyTimeRate : '-';
        let fTimeRate = rate.fullTimeRate != '0.00' ? rate.fullTimeRate : '-';
        let hTimeRate = rate.hourlyTimeRate != '0.00' ? rate.hourlyTimeRate : '-';

        ageBand.push(rate.ageBand)
        dailyTimeRate.push(dTimeRate)
        fullTimeRate.push(fTimeRate)
        hourlyTimeRate.push(hTimeRate)
      }
      element['ageBand'] = ageBand;
      element['hourlyTimeRate'] = hourlyTimeRate;
      element['fullTimeRate'] = fullTimeRate;
      element['dailyTimeRate'] = dailyTimeRate;
    });
    console.log("this.dataItems", this.dataItems);


    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: new MatTableDataSource(this.dataItems),
      pagination: this.pagination,
      onlyDelete: false
    };
    if (this.dataItems.length > 0)
    {
      this.isHistoryExists.emit(true);
    }
    else
    {
      this.isHistoryExists.emit(false);
    }
    // this.title = this.title + " (" + this.pagination.count + ")"
  }
  actionButtonOutput(event)
  {
    console.log('actionButtonOutput ==> ', event);
    this.emitSessionPricing.emit(event.row)
  }
}
