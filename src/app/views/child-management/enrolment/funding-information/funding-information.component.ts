import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { AlertService, ApiService, PermissionService, CommunicationService } from 'src/app/services';
import { ParentFormComponent } from 'src/app/shared/parent-form.component';
import { config } from 'src/config';
import { AddFundingInformationComponent } from './add-funding-information/add-funding-information.component';

@Component({
  selector: 'app-funding-information',
  templateUrl: './funding-information.component.html',
  styleUrls: ['./funding-information.component.scss']
})
export class FundingInformationComponent extends ParentFormComponent implements OnInit
{
  footerProps: any;
  selected: string = "Not Funded";
  select: any;
  @Input() childId: any;
  @Input() childData: any;
  redirectUrl = 'main/children';
  tableConfigAndProps = {};
  dataSource: any;
  toolTipText = '1 yr 2 months &#013; sdsds';
  buttonLabel: any = 'Add New';
  columnHeader = {
    'typeLabel': 'Funding Type', 'startDateLabel': 'Start Date', 'endDateLabel': 'End Date', 'passCode': 'Passcode', 'stretching': 'Stretched', 'Actions': 'Actions',
  }
  calendar: String = "assets/images/sdn/ic_event_24px.svg"
  inputData = {
    'actionColumn': 'Actions',
    'buttonEvent': "output",
    'hasCheckBox': false,
    'Action': 'Stretch'

  }
  Actionbuttons = [
    { buttonLabel: "Delete", type: 'delete', buttonRoute: "", visibility: false },
  ]
  ageYear: number;
  ageMonth: number;
  futureDate1: any;
  futureDate2: any;
  fundingLogsData: any[] = [];
  isPassCodeRequired = false;
  actionClicked: boolean = false;
  listId: string;
  AvailableWeeksForStretching: any = 0;
  StretchedHours: any = 0;
  isCancelDisabled: boolean = true;
  editFundingData: any;

  constructor(protected router: Router,
    protected _route: ActivatedRoute,
    protected alertService: AlertService,
    protected apiService: ApiService,
    protected formbuilder: FormBuilder,
    protected dialog: MatDialog,
    protected permissionsService: PermissionService,
    protected communicationService: CommunicationService)
  {

    super(router, _route, alertService, apiService, formbuilder, dialog, communicationService, permissionsService);
    this.tableConfigAndProps = {
      ActionButtons: this.Actionbuttons,
      inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
    };
    this.tableConfigAndProps['hasView'] = true;
  }

  ngOnInit(): void
  {
    this.setChildAge();
    // this.openFundingInfo();
    if (this.id == 'add')
    {
      if (this.parentId != -1)
      {
        debugger;
        this.formApi = config.base_url_slug + "add/child/finance-information";
        this.detailApi = config.base_url_slug + 'view/child/finance-information?childId=' + this.parentId + '&branchId=' + localStorage.getItem('branchId');
        this.getDetail("post");

        if (this.childId != -1)
        {
          this.formApi = config.base_url_slug + 'update/child/' + this.parentId + '/finance-information';
        }
        else
        {
          this.formApi = config.base_url_slug + "add/child/finance-information";

        }
      }
    }
    else
    {
      if (this.childId != -1)
      {
        console.log("chid id ", this.childId);

        this.formApi = config.base_url_slug + 'update/child/' + this.id + '/finance-information';
        this.detailApi = config.base_url_slug + 'view/child/finance-information?childId=' + this.parentId + '&branchId=' + localStorage.getItem('branchId');
        this.getDetail("post");
      }
      else
      {
        this.formApi = config.base_url_slug + "add/child/finance-information";
        this.detailApi = config.base_url_slug + 'view/child/finance-information?childId=' + this.parentId + '&branchId=' + localStorage.getItem('branchId');
        this.getDetail("post");
      }
    }
    this.communicationService.unSavedForm.next(false);
  }

  afterDetail(): void
  {
    this.fundingLogsData = this.formDetail?.listing;
    let onGoing = this.formDetail?.listing[0]
    if (onGoing)
    {
      this.fundingLogsData.forEach(element =>
      {
        element['startDateLabel'] = element.startDate != null ? moment(new Date(element.startDate)).format(config.cmsDateFormat) : '-';
        element['endDateLabel'] = element.endDate != null ? moment(new Date(element.endDate)).format(config.cmsDateFormat) : '-';
        element['typeLabel'] = this.getFundingType(element.fundingId, element);
        element['stretching'] = { stretch: element.stretch ? 'check_circle' : '-', tooltip: element.stretch ? 'Selected Stretched Government Funded hours ' + element.stretchedHours.toFixed(2) : '' };
      });
      this.dataSource = new MatTableDataSource(this.fundingLogsData);
      this.tableConfigAndProps = {
        ActionButtons: this.Actionbuttons,
        inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource, onlyDelete: true, hasEdit: true,
      };
      // End
    }
    this.communicationService.unSavedForm.next(false);
  }

  setChildAge()
  {
    let a = moment(this.childData.dateOfBirth);
    let b = moment();

    this.ageYear = b.diff(a, 'year');

    let months = b.diff(a, 'months');

    this.ageMonth = months - (this.ageYear * 12);

    let year1Addition;
    let year2Addition;
    let tempDateformat = moment(new Date(this.childData.dateOfBirth)).format(config.cmsDateFormat);
    let currentDate = moment().format(config.cmsDateFormat);

    if (new Date(currentDate.split('/')[2] + '-' + tempDateformat.split('/')[1] + '-' + tempDateformat.split('/')[0]) > new Date())
    {
      year1Addition = 0;
      year2Addition = 1;
    } else
    {
      year1Addition = 1;
      year2Addition = 2;
    }

    this.futureDate1 = tempDateformat.split('/')[0] + '/' + tempDateformat.split('/')[1] + '/' + (Number(currentDate.split('/')[2]) + year1Addition);
    this.futureDate2 = tempDateformat.split('/')[0] + '/' + tempDateformat.split('/')[1] + '/' + (Number(currentDate.split('/')[2]) + year2Addition);

    // End
    console.log("Date of birth-------");

  }

  getFundingType(id, element?)
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
        type = 'Custom Funding' + (element.type == 'self' ? ' - ' + element.selfFinanceHoursPerWeek + ' Hrs' : '');
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
    console.log(this.Form);

  }

  actionButtonOutput(event)
  {
    console.log("Event-------", event);
    switch (event.item.type)
    {

      case 'delete':
        this.deleteFunding(event.row);
        break;

      case 'edit':
        this.editFunding(event.row);
        break;
    }

  } deleteFunding(event: any)
  {
    if (event.type == "not_funded")
    {
      this.alertService.alertError("Error", "Non funded record cannot be deleted").then(() =>
      {
        return;
      })
    }
    else
    {
      let url = config.base_url_slug + `delete/child/${event.id}/finance-information?childId=${event.childId}`;
      let heading = 'Delete Item?';
      let message = 'Are you sure you want to delete ?';
      let rightButton = 'Delete';
      let leftButton = 'Cancel';
      this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then(result =>
      {
        if (result)
        {
          this.apiService.delete(url).then((res) =>
          {
            console.log(res);
            if (res.code == 200 || res.code == 201)
            {
              this.alertService.alertSuccess('SUCCESS', 'Funding Deleted Successfully');
              this.getDetail("post");
            }
            else if (res?.error)
            {
              this.alertService.alertError("Error", res.error.message)
            }
            else
            {
              this.alertService.alertError("Error", res.message)
            }
          })
            .catch(err => console.log(err));
        }
      })
    }
  }
  editFunding(event: any)
  {
    this.actionClicked = true;
    this.editFundingData = event;
    this.openFundingInfo('existing');
    // this.isCancelDisabled = false
    // this.Form.controls['matstartDate'].setValue(new Date(event.startDate));
    // this.Form.controls['matendDate'].setValue(new Date(event.endDate));
    // this.StretchedHours = event.stretchedHours;

    // this.listId = event.id;
    // let editFunding = event;
    // if (editFunding.stretch == false)
    // {
    //   editFunding.stretch = false
    // }
    // else
    // {
    //   editFunding.stretch = true
    // }
    // this.Form.patchValue(editFunding);
  }
  openFundingInfo(fundingType: any)
  {
    let dialogRef = this.dialog.open(AddFundingInformationComponent, { width: '700px', disableClose: true, autoFocus: false });

    if (this.parentId != -1)
    {
      dialogRef.componentInstance.childId = this.parentId;
      // dialogRef.componentInstance.id = this.id;
    }
    if (fundingType != 'new')
    {
      dialogRef.componentInstance.listId = this.listId;
      dialogRef.componentInstance.type = 'edit';
      dialogRef.componentInstance.editFundingData = this.editFundingData
    }
    else
    {
      dialogRef.componentInstance.type = 'add';
    }
    dialogRef.afterClosed().subscribe(value =>
    {
      console.log("Dialog closed---", value);
      if (value)
      {
        // this.afterSuccessfullyAdd();
        this.communicationService.unSavedForm.next(false);
        this.detailApi = config.base_url_slug + 'view/child/finance-information?childId=' + this.parentId + '&branchId=' + localStorage.getItem('branchId');
        this.getDetail('post')
      }

    })
  }
  afterSuccessfullyAdd(): void
  {
    this.emitFormData.emit({
      type: 'child',
      value: 100,
      key: 'fundingId'
    });

    let data = {
      'number': 6,
      'url': 'funding',
      'prevForm': 'childEmergencyDetails',
      'currentForm': 'fundingDetail',
      'isForm': true,
    }
    this.communicationService.setChild(data)

  }
}
