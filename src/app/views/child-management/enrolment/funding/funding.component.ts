import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, CommunicationService, PermissionService } from 'src/app/services';
import { getFundingFieldMsg } from '../../../../shared/field-validation-messages';
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { config } from 'src/config';
import { ParentFormComponent } from 'src/app/shared/parent-form.component';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatTableDataSource } from '@angular/material/table';
@Component({
  selector: 'app-funding',
  templateUrl: './funding.component.html',
  styleUrls: ['/src/app/views/shared-style.scss', './funding.component.scss']
})
export class FundingComponent extends ParentFormComponent implements OnInit
{
  footerProps: any;
  selected: string = "Not Funded";
  select: any;
  @Input() childId: any;
  @Input() childData: any;
  redirectUrl = 'main/children';
  editPermit: any;
  tableConfigAndProps = {};
  dataSource: any;
  toolTipText = '1 yr 2 months &#013; sdsds';
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
    this.Form.addControl('childId', new FormControl(null, [Validators.required]));
    this.Form.addControl('fundedFinanceHoursPerWeek', new FormControl(0, [Validators.required]));
    this.Form.addControl('fundingId', new FormControl(1, [Validators.required]));
    this.Form.addControl('selfFinanceHoursPerWeek', new FormControl(0, [Validators.required, Validators.max(999),
    RxwebValidators.minNumber({ value: 0.1, conditionalExpression: (x, y) => x.fundingId == 5 })]));
    this.Form.addControl('stretch', new FormControl(false, [Validators.required]));
    this.Form.addControl('startDate', new FormControl(null, [Validators.required]));
    this.Form.addControl('endDate', new FormControl(null));
    this.Form.addControl('type', new FormControl(null));
    this.Form.addControl('matstartDate', new FormControl(null, [Validators.required]));
    this.Form.addControl('matendDate', new FormControl(null));
    this.Form.addControl('branchId', new FormControl(localStorage.getItem('branchId')));
    this.Form.addControl('passCode', new FormControl(null, [Validators.minLength(3), Validators.maxLength(18)]));
    this.isMultiple = false;
    this.editPermit = this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Children').update;

    this.communicationService.getChild().subscribe(childData => console.log(childData));

    this.tableConfigAndProps = {
      ActionButtons: this.Actionbuttons,
      inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
    };
    this.tableConfigAndProps['hasView'] = true;

  }

  ngOnInit(): void
  {
    this.Form.get('fundingId').valueChanges.subscribe(val =>
    {
      this.Form.get('stretch').setValue(false)
      switch (this.Form.get('fundingId').value)
      {
        case 1:
          this.Form.get('fundedFinanceHoursPerWeek').setValue(0)
          this.Form.get('selfFinanceHoursPerWeek').setValue(0)
          this.Form.get('type').setValue("not_funded")
          break;
        case 2:

          this.Form.get('fundedFinanceHoursPerWeek').setValue(15)
          this.Form.get('selfFinanceHoursPerWeek').setValue(0)
          this.Form.get('type').setValue("funded")
          this.calculateHours(15)
          break;
        case 3:

          this.Form.get('fundedFinanceHoursPerWeek').setValue(15)
          this.Form.get('selfFinanceHoursPerWeek').setValue(0)
          this.Form.get('type').setValue("funded")
          this.calculateHours(15)

          break;
        case 4:

          this.Form.get('fundedFinanceHoursPerWeek').setValue(30)
          this.Form.get('selfFinanceHoursPerWeek').setValue(0)
          this.Form.get('type').setValue("funded")
          this.calculateHours(30)

          break;
        case 5:
          this.Form.get('fundedFinanceHoursPerWeek').setValue(0)
          this.Form.get('stretch').setValue(false)
          this.Form.get('type').setValue("self")
          this.calculateHours(0)
          // this.Form.get('selfFinanceHoursPerWeek').setValue(null)
          break;

        case 6:
          this.Form.get('fundedFinanceHoursPerWeek').setValue(0)
          this.Form.get('selfFinanceHoursPerWeek').setValue(0)
          this.Form.get('type').setValue("funded")

          break;
      }
      // if (this.Form.get('stretch').value && val == 5)
      // {
      //   this.calculateHours(this.Form.get('selfFinanceHoursPerWeek').value);
      // }
      // else if (this.Form.get('stretch').value && (val == 2 || val == 3 || val == 4))
      // {
      //   this.calculateHours(this.Form.get('fundedFinanceHoursPerWeek').value);
      // }
      this.isPassCodeRequired = val == 2 ? true : false;
    });
    this.Form.get('stretch').valueChanges.subscribe(stretch =>
    {
      switch (this.Form.get('fundingId').value)
      {
        case 1:
          this.Form.get('fundedFinanceHoursPerWeek').setValue(0)
          this.Form.get('selfFinanceHoursPerWeek').setValue(0)
          this.Form.get('type').setValue("not_funded")
          break;
        case 2:

          this.Form.get('fundedFinanceHoursPerWeek').setValue(15)
          this.Form.get('selfFinanceHoursPerWeek').setValue(0)
          this.Form.get('type').setValue("funded")
          this.calculateHours(15)

          break;
        case 3:

          this.Form.get('fundedFinanceHoursPerWeek').setValue(15)
          this.Form.get('selfFinanceHoursPerWeek').setValue(0)
          this.Form.get('type').setValue("funded")
          this.calculateHours(15)
          break;
        case 4:

          this.Form.get('fundedFinanceHoursPerWeek').setValue(30)
          this.Form.get('selfFinanceHoursPerWeek').setValue(0)
          this.Form.get('type').setValue("funded")
          this.calculateHours(30)
          break;
        case 5:
          this.Form.get('fundedFinanceHoursPerWeek').setValue(0)
          // this.Form.get('selfFinanceHoursPerWeek').setValue(null)
          this.Form.get('type').setValue("self")
          this.calculateHours(0)

          break;

        case 6:
          this.Form.get('fundedFinanceHoursPerWeek').setValue(0)
          this.Form.get('selfFinanceHoursPerWeek').setValue(0)
          this.Form.get('type').setValue("funded")
          this.calculateHours(0)

          break;
      }
      // if (stretch && this.Form.get('fundingId').value == 5)
      // {
      //   this.calculateHours(this.Form.get('selfFinanceHoursPerWeek').value);
      // }
      // else if (stretch && (this.Form.get('fundingId').value != 5 || this.Form.get('fundingId').value != 1))
      // {
      //   this.calculateHours(this.Form.get('fundedFinanceHoursPerWeek').value);
      // }
    });

    if (this.parentId != -1)
    {
      this.Form.controls['childId'].setValue(this.parentId);

    }

    this.Form.controls['selfFinanceHoursPerWeek'].valueChanges.subscribe(value =>
    {
      if (value > 0)
      {
        this.calculateHours(value);
      }
    })
    this.sub = this._route.params.subscribe(params =>
    {
      this.id = params['id'];
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
        // this.formApi = config.base_url_slug +'update/child/' + this.id + '/finance-information';
        // this.detailApi = config.base_url_slug +'view/child/' + this.id;
        // this.getDetail();
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
    });

    super.ngOnInit();
    this.getWeekforStretching();
    this.setChildAge();

    // this.Form.valueChanges.subscribe(value=>{
    // })
  }

  beforeSubmit()
  {
    this.isMultiple = false;
    if (this.Form.get('stretch').value == "-" || this.Form.get('stretch').value == false)
    {
      this.Form.get('stretch').setValue(false)
    }
    else
    {
      this.Form.get('stretch').setValue(true)
    }
    // let ifExist = this.getfundingRangeExists();

    // if (ifExist) {
    //   this.alertService.alertError('ERROR', 'Funding range already exists');
    // }
    // this.beforeSubmitReturn = ifExist ? true: false;
  }

  onSubmit()
  {
    this.beforeSubmit();

    if (this.Form.invalid)
    {
      this.alertService.alertError('WARNING', 'Please fill the required data.');
      return;
    }
    let url = '';
    let type = '';
    if (this.id == 'add' || !this.actionClicked)
    {
      url = config.base_url_slug + "add/child/finance-information";
      type = 'post';
    }
    else
    {
      url = config.base_url_slug + 'update/child/' + this.listId + '/finance-informationV2';
      type = 'patch';
    }

    this.apiService[type](url, this.Form.value).then((res) =>
    {
      console.log(res);
      if (res.code == 200 || res.code == 202 || res.code == 201)
      {
        this.alertService.alertSuccess('SUCCESS', res.message).then(result =>
        {
          this.communicationService.unSavedForm.next(false);
          this.afterSuccessfullyAdd();
        });
      }
      // else if (res.code == 201) {
      //   this.alertService.alertAsk('SUCCESS', res.message, 'Yes', 'No',false).then(result => {
      //     if (result) {
      //       this.router.navigate(['main/finance/allInvoice']);
      //     } else {
      //       this.communicationService.unSavedForm.next(false);
      //       this.afterSuccessfullyAdd();
      //     }
      //   })
      // }
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

  getErrorMessage(field: any): any
  {
    return getFundingFieldMsg[field];
  }
  getWeekforStretching()
  {
    this.AvailableWeeksForStretching = 52;
    // this.apiService.get(config.base_url_slug + 'view/available-weeks-for-stretching/' + localStorage.getItem('branchId')).then(res =>
    // {
    //   this.AvailableWeeksForStretching = res.data.AvailableWeeksForStretching
    // })
  }
  calculateHours(input: any)
  {
    let hours;
    if (this.AvailableWeeksForStretching != 0)
    {
      hours = (input * 38) / this.AvailableWeeksForStretching;
    }
    else
    {
      hours = (input * 38) / 52;
    }
    this.StretchedHours = Math.round(hours);
  }

  checkType()
  {
    if (this.type != "")
    {
      // if (this.type === 'view')
      // {
      //   this.title = "View " + this.title;
      //   this.footerProps = {
      //     'hasButton': false,
      //     'type': 'view'
      //   };
      //   this.onlyImage = true;
      //   this.Form.disable();
      //   this.disableInput = true;

      //   // Refresh Data
      //   this.detailApi = config.base_url_slug + 'view/child/' + this.id;
      //   this.getDetail();
      //   // End

      // }
      if (this.type === 'edit' || this.type === 'view')
      {
        this.footerProps = {
          'buttonLabel': "Update Info",
          'hasbackButton': true,
          'hasClearForm': true,
          'hasCancelDisabled': true,
          'backButtonLabel': 'Cancel',
          'hasButton': true,
          'hasSubButton': false,

        };
        this.Form.enable();
        this.disableInput = false;
        this.onlyImage = false;
        this.title = "Update " + this.title;
      }
      else
      {
        this.footerProps = {
          'buttonLabel': "Save Info",
          'hasButton': true,
          'hasSubButton': false,
          'hasClearButton': true,
          'clearButtonLabel': 'Clear',
        };
        this.onlyImage = false;
        this.title = "Add New " + this.title;
      }
      this.footerProps['backColor'] = '#C1BBB9';
    }
  }

  afterDetail(): void
  {
    this.isUpdate = true;
    this.fundingLogsData = this.formDetail?.listing;
    let onGoing = this.formDetail?.listing[0]

    if (onGoing.selfFinanceHoursPerWeek > 0)
    {
      this.calculateHours(onGoing.selfFinanceHoursPerWeek)
    }
    else if (onGoing.fundedFinanceHoursPerWeek > 0)
    {
      this.calculateHours(onGoing.fundedFinanceHoursPerWeek)
    }
    if (onGoing)
    {
      this.Form.patchValue(onGoing);
      // if (this.formDetail?.selfFinanceHoursPerWeek > 0)
      // {
      //   this.Form.get('fundingId').setValue(5)
      // }

      if (onGoing?.startDate)
      {
        this.Form.controls['matstartDate'].setValue(new Date(onGoing?.startDate));
      }

      if (onGoing?.endDate)
      {
        this.Form.controls['matendDate'].setValue(new Date(onGoing?.endDate));
      }


      this.fundingLogsData.forEach(element =>
      {
        element['startDateLabel'] = element.startDate != null ? moment(new Date(element.startDate)).format(config.cmsDateFormat) : '-';
        element['endDateLabel'] = element.endDate != null ? moment(new Date(element.endDate)).format(config.cmsDateFormat) : '-';
        element['typeLabel'] = this.getFundingType(element.fundingId);
        element['stretching'] = { stretch: element.stretch ? 'check_circle' : '-', tooltip: element.stretch ? 'Selected Stretched Government Funded hours ' + element.stretchedHours.toFixed(2) : '' };
        element['latest'] = false;
      });
      this.fundingLogsData[0].latest = true;
      this.dataSource = new MatTableDataSource(this.fundingLogsData);
      this.tableConfigAndProps = {
        ActionButtons: this.Actionbuttons,
        inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource, onlyDelete: true, hasEdit: true,

      };
      // End
    }

    this.emptyForm = this.Form.value;
    this.communicationService.unSavedForm.next(false);
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

  dateChangeStatic(Form, controlName, event: MatDatepickerInputEvent<Date>)
  {
    if (controlName == 'startDate' && (moment(event.value).format('dddd') == 'Saturday' || moment(event.value).format('dddd') == 'Sunday'))
    {
      Form.get(controlName).setValue(null);
      Form.get('matstartDate').setValue(null);
      this.alertService.alertInfo('Warning', 'Selection not allowed on Saturday and Sunday.');
      return;
    }

    if (controlName == 'endDate' && moment(event.value).format('dddd') != 'Friday' && event.value != null)
    {
      Form.get(controlName).setValue(null);
      Form.get('matendDate').setValue(null);
      this.alertService.alertInfo('Warning', 'End date selection only allowed on friday.');
      return;
    }

    if (controlName == 'endDate' && Form.get('matendDate').value == null)
    {
      Form.get('endDate').setValue(null);
    } else
    {
      const formattedDate = moment(new Date(event.value)).format(config.serverDateFormat);
      Form.get(controlName).setValue(formattedDate);
    }

  }

  setChildAge()
  {
    // Find Age of child

    let a = moment(this.childData.dateOfBirth);
    let b = moment();

    this.ageYear = b.diff(a, 'year');

    let months = b.diff(a, 'months');

    this.ageMonth = months - (this.ageYear * 12);

    // End

    // Find birthday of next two years

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

  getfundingRangeExists()
  {

    let isExist = false;
    this.fundingLogsData.some((element) =>
    {

      // NEW BLOCK
      if (this.Form.get('endDate').value && element.endDate)
      {

        if (new Date(element.startDate) <= new Date(this.Form.get('startDate').value) &&
          new Date(element.endDate) >= new Date(this.Form.get('endDate').value))
        {
          isExist = true;
          return;
        }

        if (new Date(element.startDate) > new Date(this.Form.get('startDate').value) &&
          new Date(element.startDate) <= new Date(this.Form.get('endDate').value) &&
          new Date(element.endDate) >= new Date(this.Form.get('endDate').value))
        {
          isExist = true;
          return;
        }

        if (new Date(element.endDate) < new Date(this.Form.get('endDate').value) &&
          new Date(element.startDate) <= new Date(this.Form.get('startDate').value) &&
          new Date(element.endDate) >= new Date(this.Form.get('startDate').value))
        {
          isExist = true;
          return;
        }

      }

      if (!this.Form.get('endDate').value && element.endDate)
      {

        if (new Date(element.startDate) >= new Date(this.Form.get('startDate').value))
        {
          isExist = true;
          return;
        }

      }

      // if (this.Form.get('endDate').value && !element.endDate) {

      // }

      // NEW END


      // If only start date is selected
      // if (new Date(element.startDate) >= new Date(this.Form.get('startDate').value) && !this.Form.get('endDate').value) {
      //   isExist = true;
      //   return;
      // }

      // if (new Date(element.startDate) >= new Date(this.Form.get('startDate').value) && !element.endDate) {
      //   isExist = true;
      //   return;
      // }

      // if (new Date(element.startDate) <= new Date(this.Form.get('startDate').value) && new Date(element.endDate) >= new Date(this.Form.get('endDate').value) && this.Form.get('endDate').value && element.endDate) {
      //   isExist = true;
      //   return;
      // }
    })

    return isExist;
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
    console.log(this.Form);

  }

  checkPassCode()
  {
    if (this.Form.get('passCode').value == '')
    {
      this.Form.get('passCode').setValue(null);
    }
  }

  onBlurEvent(event)
  {
    if (event.target.value.includes('.'))
    {
      event.target.value = parseFloat(parseFloat(event.target.value).toFixed(2));
      this.Form.get('selfFinanceHoursPerWeek').setValue(Number(event.target.value));
    }
  }

  clearForm()
  {
    // this.getDetail("post");
    // this.isCancelDisabled = true;
    let heading = 'Confirmation';
    let message = 'Are you sure you want to cancel?';
    let rightButton = 'Yes';
    let leftButton = 'No';
    this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then(result =>
    {
      if (!result)
      {
        return;
      }
      else
      {
        window.history.back();
      }
    })

  }

  goToEdit()
  {
    // this.router.navigateByUrl(`/main/enrolment/${this.id}/edit`);
    this.type = 'edit';
    this.checkType();
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
      this.apiService.delete(url).then((res) =>
      {
        console.log(res);
        if (res.code == 200 || res.code == 201) {
          this.alertService.alertSuccess('SUCCESS', 'Funding Deleted Successfully');
          this.getDetail("post");
        }

        // if (res.code == 201) {
        //   this.alertService.alertAsk('SUCCESS', res.message, 'Yes', 'No',false).then(result => {
        //     if (result) {
        //       this.router.navigate(['main/finance/allInvoice']);
        //     }
        //   })
        // }
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
  }
  editFunding(event: any)
  {

    if (event.latest == false)
    {
      this.isCancelDisabled = true;
      this.alertService.alertError("Error", "You can edit only latest funding")
    }
    else
    {
      this.actionClicked = true;
      this.isCancelDisabled = false
      this.Form.controls['matstartDate'].setValue(new Date(event.startDate));
      this.Form.controls['matendDate'].setValue(new Date(event.endDate));
      this.StretchedHours = event.stretchedHours;

      this.listId = event.id;
      let editFunding = event;
      if (editFunding.stretch == false)
      {
        editFunding.stretch = false
      }
      else
      {
        editFunding.stretch = true
      }
      if (editFunding.selfFinanceHoursPerWeek > 0)
      {
        this.calculateHours(editFunding.selfFinanceHoursPerWeek)
      }
      else if (editFunding.fundedFinanceHoursPerWeek > 0)
      {
        this.calculateHours(editFunding.fundedFinanceHoursPerWeek)
      }
      this.Form.patchValue(editFunding);
    }
  }

}
