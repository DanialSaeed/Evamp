import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { AlertService, ApiService, PermissionService, CommunicationService } from 'src/app/services';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { config } from 'src/config';

@Component({
  selector: 'app-offboard-funding-info',
  templateUrl: './offboard-funding-info.component.html',
  styleUrls: ['./offboard-funding-info.component.scss']
})
export class OffboardFundingInfoComponent extends GlobalListComponent implements OnInit
{
  footerProps: any;
  @Input() childId: any;
  @Input() childData: any;
  @Input() previousForm: any;
  @Input() formDetail: any;
  redirectUrl = 'main/children';
  tableConfigAndProps = {};
  editableDateProps = {};
  dataSource: any;
  red = 'rgb(255, 230, 230)';
  green = 'rgb(212, 244, 224)';
  custom = 'rgb(255, 0, 0)';

  columnHeader = {
    'id': 'ID', 'typeLabel': 'Funding Type', 'startDateLabel': 'Start Date', 'end': 'End Date', 'passCode': 'Passcode', 'stretching': 'Stretched'
  }
  inputData = {
    'actionColumn': '',
    'buttonEvent': "output",
    'hasCheckBox': false,
    'Action': 'Stretch'
  }
  Actionbuttons = [
    { buttonLabel: "Delete", type: 'delete', buttonRoute: "", visibility: false },
  ]
  fundingLogsData: any[] = [];
  fundingLogs: any[] = [];


  constructor(protected router: Router,
    protected _route: ActivatedRoute,
    protected alertService: AlertService,
    protected apiService: ApiService,
    protected formbuilder: FormBuilder,
    protected dialog: MatDialog,
    protected permissionsService: PermissionService,
    protected communicationService: CommunicationService)
  {

    super(router, apiService, alertService, permissionsService);
    this.communicationService.getChild().subscribe(childData => console.log(childData));

    this.tableConfigAndProps = {
      ActionButtons: this.Actionbuttons,
      inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
    };
    this.tableConfigAndProps['hasView'] = false;
    this.editableDateProps = { editAble: false, disabled: true }
  }

  ngOnInit(): void
  {
    let branchId = localStorage.getItem('branchId')
    if (this.previousForm)
    {
      let type = 'post'
      let url = `${config.base_url_slug}view/child/finance-information-ongoing?childId=${this.previousForm.childId}&branchId=${branchId}&leaveDate=${this.previousForm.leaveDate}`
      this.getFundingInfo(url, type);
      this.checkType();
    }
    super.ngOnInit();
  }
  async getFundingInfo(url, type)
  {
    let response = await this.apiService[type](url);
    console.log("funding data", response);
    this.fundingLogs = response.data.listing
    this.fundingLogs.forEach(element =>
    {
      element['startDateLabel'] = element.startDate != null ? moment(new Date(element.startDate)).format(config.cmsDateFormat) : '-';
      element['end'] = element.endDate != null ? moment(new Date(element.endDate)).format(config.cmsDateFormat) : '-';
      element['typeLabel'] = this.getFundingType(element.fundingId);
      element['stretching'] = { stretch: element.stretch ? 'check_circle' : '-', tooltip: element.stretch ? 'Selected Stretched Government Funded hours ' + element.stretchedHours.toFixed(2) : '' };
      let offboardingLeaveDate = new Date(this.previousForm.leaveDate);
      let fundingLeaveDate = element.endDate != null ? new Date(element.endDate) : null;
      let fundingStartDate = new Date(element.startDate);
      if (offboardingLeaveDate < fundingStartDate)
      {
        element['end'] = fundingLeaveDate != null ? moment(new Date(fundingLeaveDate)).format(config.cmsDateFormat) : '-'
        element['highlight'] = this.red; // handle only null leave date
      }
      else if (offboardingLeaveDate >= fundingStartDate)
      {
        if (!element.endDate)
        {
          element['end'] = this.previousForm.leaveDate != null ? moment(new Date(this.previousForm.leaveDate)).format(config.cmsDateFormat) : '-';
          element['highlight'] = this.green;
        }
        else if (offboardingLeaveDate > fundingLeaveDate)
        {
          element['end'] = fundingLeaveDate != null ? moment(new Date(fundingLeaveDate)).format(config.cmsDateFormat) : '-';
        }
        else if (offboardingLeaveDate >= fundingStartDate && offboardingLeaveDate <= fundingLeaveDate)
        {
          element['end'] = this.previousForm.leaveDate != null ? moment(new Date(this.previousForm.leaveDate)).format(config.cmsDateFormat) : '-';
          element['highlight'] = this.green;
        }
        else
        {
          element['end'] = fundingLeaveDate != null ? moment(new Date(fundingLeaveDate)).format(config.cmsDateFormat) : '-';
          element['highlight'] = this.custom;
        }
      }

    })
    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: new MatTableDataSource(this.fundingLogs),
      pagination: this.pagination
    };
  }

  getFundingType(id)
  {

    let type = '';
    switch (id)
    {
      case 1:
        type = 'Not Funded';
        break;

      case 2:
        type = 'Free 15 hours 2 years old';
        break;

      case 3:
        type = 'Free 15 hours 3/4 years old';
        break;

      case 4:
        type = 'Free 30 hours 3/4 years old';
        break;

      case 5:
        type = 'Custom Funding';
        break;

      case 6:
        type = '5+ years old';
        break;
      default:
        break;
    }

    return type;

  }

  check()
  {

  }
  checkType()
  {

    this.footerProps = {
      'subButtonLabel': "Next",
      'hasbackButton': true,
      'hasButton': false,
      'hasSubButton': true,
      'hasClearForm': false,
      'backButtonLabel': 'Go Back',
      'hasCancel': true,
      'hasCancelLabel': 'Cancel',
      'type':'output'
    };
  }
  goBack()
  {
    console.log("Back method called");
    let data = {
      'number': 1,
      'url': 'offboarding-detail',
      'prevForm': '',
      'currentForm': 'offboard-funding-info',
      'isForm': true,
    }
    this.communicationService.setChild(data);
  }
  onCancel(){
    window.history.back();
   }
   onNext(){
    let data = {
      'number': 3,
      'url': 'booking information',
      'prevForm': '',
      'currentForm': 'offboard-funding-info',
      'isForm': true,
    }
  this.communicationService.setChild(data);
  }
}
