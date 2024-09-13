import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, CommunicationService, PermissionService } from 'src/app/services';

import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { config } from 'src/config';
import { ParentFormComponent } from 'src/app/shared/parent-form.component';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatTableDataSource } from '@angular/material/table';
import { getFundingFieldMsg } from 'src/app/shared/field-validation-messages';
@Component({
  selector: 'app-financial-settings',
  templateUrl: './financial-settings.component.html',
  styleUrls: ['./financial-settings.component.scss', '/src/app/views/shared-style.scss']
})
export class FinancialSettingsComponent extends ParentFormComponent implements OnInit
{

  footerProps: any;
  selected: string = "Not Funded";
  select: any;
  showDiscount: any = false;
  showSurcharge: any = false;
  @Input() childId: any;
  redirectUrl = 'main/children';
  editPermit: any;
  tableConfigAndProps = {};
  acceptedCharacters: string[] = ['.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  dataSource: any;
  toolTipText = '1 yr 2 months &#013; sdsds';
  columnHeader = {
    'id': 'ID', 'specialHourlyRate': 'Hourly Rate', 'displayEffectiveFrom': 'Effective From', 'displayEffectiveTo': 'Effective To', 'Actions': 'Actions',
  }

  inputData = {
    'actionColumn': 'Actions',
    'buttonEvent': "output",
    'hasCheckBox': false,
  }

  fundingLogsData: any[] = [];
  isPassCodeRequired = false;
  hourRateForm: FormGroup;
  branchId = localStorage.getItem('branchId');
  operationalPeriod = localStorage.getItem('operationalPeriod');

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

    this.Form.addControl('branchId', new FormControl(Number(this.branchId)));
    this.Form.addControl('siblingDiscountPercentage', new FormControl('1.00', Validators.pattern(/^[0-9]\d*$/)));
    this.Form.addControl('siblingsDiscount', new FormControl(true));
    this.Form.addControl('siblingDiscountId', new FormControl(null));
    this.Form.addControl('surcharge', new FormControl(false));
    this.Form.addControl('surchargeId', new FormControl(null));
    this.Form.addControl('surchargePercentage', new FormControl('1.00'));

    this.isMultiple = true;

    // this.Form.addControl('passCode', new FormControl(null, [Validators.minLength(3),Validators.maxLength(18)]));
    this.isMultiple = false;
    this.noFormCheck = true;
    this.editPermit = this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Children').update;
    this.dataSource = new MatTableDataSource([]);

    this.tableConfigAndProps = {
      ActionButtons: [{ buttonLabel: "Edit", type: 'edit', buttonRoute: "", visibility: true },
      { buttonLabel: "Delete", type: 'delete', buttonRoute: "", visibility: true }],
      inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
    };

    this.hourRateForm = this.formbuilder.group({
      branchId: new FormControl(this.branchId),
      specialHoursRate: new FormControl(false),
      specialHourlyRate: new FormControl(null, [Validators.required]),
      specialHourlyRateId: new FormControl(null),
      effectiveFrom: new FormControl(null),
      effectiveTo: new FormControl(null),
      matEffectiveFrom: new FormControl(null),
      matEffectiveTo: new FormControl(null),
    });

    this.Form.get('siblingsDiscount').valueChanges.subscribe(value =>
    {
      if (value)
      {
        this.Form.get('siblingDiscountPercentage').setValidators(Validators.required);
      } else
      {
        this.Form.get('siblingDiscountPercentage').clearValidators();
      }
      this.showDiscount = value
      this.Form.get('siblingDiscountPercentage').updateValueAndValidity();
    });

    this.Form.get('surcharge').valueChanges.subscribe(value =>
    {
      if (value)
      {
        this.Form.get('surchargePercentage').setValidators(Validators.required);
      } else
      {
        this.Form.get('surchargePercentage').clearValidators();
      }
      this.showSurcharge = value
      this.Form.get('surchargePercentage').updateValueAndValidity();
    });

    this.hourRateForm.get('specialHourlyRate').valueChanges.subscribe(value =>
    {
      if (value)
      {
        this.hourRateForm.get('effectiveFrom').setValidators(Validators.required);
        this.hourRateForm.get('effectiveTo').setValidators(Validators.required);
      } else
      {
        this.hourRateForm.get('effectiveFrom').clearValidators();
        this.hourRateForm.get('effectiveTo').clearValidators();
      }
      this.hourRateForm.get('effectiveFrom').updateValueAndValidity();
      this.hourRateForm.get('effectiveTo').updateValueAndValidity();
    });
  }

  ngOnInit(): void
  {
    // this.getSpecialHourRateList()
    this.detailApi = config.base_url_slug + 'view/branch/' + this.branchId;
    this.formApi = config.base_url_slug + 'patch/branches/finance-sibling-discount-and-booking-surcharge';

    this.getDetail();
    this.getAllFinanceData();

    super.ngOnInit();

  }

  beforeSubmit()
  {
    console.log(this.Form.value);
    this.isMultiple = true;
  }

  getErrorMessage(field: any): any
  {
    return getFundingFieldMsg[field];
  }

  checkType()
  {
    if (this.type != "")
    {
      if (this.type === 'view')
      {
        this.title = "View " + this.title;
        this.footerProps = {
          'hasButton': false,
          'type': 'view'
        };
        this.onlyImage = true;
        this.Form.disable();
        this.disableInput = true;

        // Refresh Data
        this.detailApi = config.base_url_slug + 'view/child/' + this.id;
        this.getDetail();
        // End

      }
      else if (this.type === 'edit')
      {
        this.footerProps = {
          'buttonLabel': "Update Info",
          'hasbackButton': true,
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
          'hasbackButton': true,
          'backButtonLabel': 'Cancel',
          'hasButton': true,
          'hasSubButton': false,
        };
        this.onlyImage = false;
        this.title = "Add New " + this.title;
      }
      this.footerProps['backColor'] = '#C1BBB9';
    }
  }

  afterDetail(): void
  {
    this.Form.get('siblingsDiscount').setValue(this.formDetail.siblingsDiscount == null ? true : this.formDetail.siblingsDiscount);
    this.Form.get('surcharge').setValue(this.formDetail.surcharge);
    this.hourRateForm.get('specialHoursRate').setValue(this.formDetail.specialHoursRate);
  }

  onSubmit()
  {
    this.beforeSubmit();

    if (this.Form.invalid)
    {
      this.alertService.alertError('WARNING', 'Please fill the required data.');
      return;
    }

    let url = this.formApi;
    this.apiService.patch(url, this.Form.value).then((res) =>
    {
      console.log(res);
      if (res.code == 200 || res.code == 201)
      {
        this.alertService.alertSuccess('SUCCESS', res.message).then(result =>
        {
          this.afterSuccessfullyAdd();
        });
      }
      // else if (res.code == 201) {
      //   this.alertService.alertAsk('SUCCESS', res.message, 'Yes', 'No',false).then(result => {
      //     if (result) {
      //       this.router.navigate(['main/finance/allInvoice']);
      //     } else {
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


  afterSuccessfullyAdd(): void
  {
    this.getAllFinanceData();
    this.getDetail();
    // localStorage.removeItem("child-id")
    // this.router.navigateByUrl('/main/children');

  }

  dateChangeStatic(form, controlName, event: MatDatepickerInputEvent<Date>)
  {
    // if (controlName == 'startDate' && (moment(event.value).format('dddd') == 'Saturday' || moment(event.value).format('dddd') == 'Sunday')) {
    //   Form.get(controlName).setValue(null);
    //   Form.get('matstartDate').setValue(null);
    //   this.alertService.alertInfo('Warning', 'Selection not allowed on Saturday and Sunday.');
    //   return;
    // }

    // if (controlName == 'endDate' && moment(event.value).format('dddd') != 'Friday' && event.value != null) {
    //   Form.get(controlName).setValue(null);
    //   Form.get('matendDate').setValue(null);
    //   this.alertService.alertInfo('Warning', 'End date selection only allowed on friday.');
    //   return;
    // }

    if (!event.value)
    {
      form.get(controlName).setValue(null);
    } else
    {
      const formattedDate = moment(new Date(event.value)).format(config.serverDateFormat);
      form.get(controlName).setValue(formattedDate);
    }

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

  // onBlurEvent(event) {
  //   if (event.target.value.includes('.')) {
  //     event.target.value = parseFloat(parseFloat(event.target.value).toFixed(2));
  //     this.Form.get('selfFinanceHoursPerWeek').setValue(Number(event.target.value));
  //   }
  // }

  onBlurEvent(event, controlName?, form?, isPercentage = true)
  {

    let minVal = 1.00;

    console.log(event);
    if (event.target.value !== "")
    {
      event.target.value = parseFloat(event.target.value).toFixed(2)
    }
    if (isPercentage && (event.target.value > 100.00))
    {

      form.controls[controlName].setValue(100.00);
      form.controls[controlName].setErrors({ 'incorrect': true });
      event.target.value = parseFloat(event.target.value).toFixed(2)
    }
    if (event.target.value < minVal || event.target.value == "" || event.target.value.includes('e') || (!isPercentage && event.target.value > 999.00))
    {
      form.controls[controlName].setValue(null);
      form.controls[controlName].setErrors({ 'incorrect': true });
    }
    else
    {
      form.controls[controlName].setErrors(null);
      form.controls[controlName].patchValue(event.target.value)
    }
  }

  onHourRateSubmit()
  {

    if (this.hourRateForm.invalid)
    {
      this.alertService.alertError('WARNING', 'Please fill the required data.');
      return;
    }

    let endpoint = config.base_url_slug + 'patch/branch/finance-special-hourly-rate';
    // let invoiceIds = [item.row.id];
    let data = this.hourRateForm.value;
    this.apiService.patch(endpoint, data, false).then((res) =>
    {
      let message = res.message;
      if (res.code == 200 || res.code == 201)
      {
        this.alertService.alertSuccess(res.status, message).then(result =>
        {
          this.hourRateForm.reset();
          this.hourRateForm.get('branchId').setValue(Number(this.branchId));
          this.getAllFinanceData();
          this.getDetail();
        })
      }
      // if (res.code == 201) {
      //   this.alertService.alertAsk('SUCCESS', res.message, 'Yes', 'No',false).then(result => {
      //     if (result) {
      //       this.router.navigate(['main/finance/allInvoice']);
      //     } else {
      //       this.hourRateForm.reset();
      //       this.hourRateForm.get('branchId').setValue(Number(this.branchId));
      //       this.getAllFinanceData();
      //       this.getDetail();
      //     }
      //   })
      // }
      else
      {
        this.alertService.alertError(res.status, message);
      }

    })
      .catch(err =>
      {
        this.alertService.alertError(err.error.status, err.error.message).then(result =>
        {
          // this.getList(this.filterUrl);
        })
      })
  }

  getAllFinanceData()
  {

    let endpoint = config.base_url_slug + 'view/branches/finance-view?attributes=[{"key": "branchId", "value": "' + this.branchId + '" }]&sortBy=specialHourlyRate&sortOrder=Desc&page=1&perPage=20';
    // let invoiceIds = [item.row.id];
    let data = {};
    this.apiService.get(endpoint).then((res) =>
    {

      // Patch listing values for table
      let specialHourListData = res.data.special_hourly_rate;
      this.dataSource = new MatTableDataSource(specialHourListData);
      let pagination = res.data.pagination;

      // Patch values for first form
      this.Form.get('surchargeId').setValue(res?.data?.surcharge?.id || null);
      this.Form.get('surchargePercentage').setValue(res?.data?.surcharge?.surchargePercentage ? res?.data?.surcharge?.surchargePercentage.toFixed(2) : '1.00');
      this.Form.get('siblingDiscountId').setValue(res?.data?.sibling_discount?.id || null);
      this.Form.get('siblingDiscountPercentage').setValue(res?.data?.sibling_discount?.siblingDiscountPercentage.toFixed(2) || '1.00');

      // Patch values for second form
      if (specialHourListData.length != 0)
      {

        specialHourListData.forEach(element =>
        {
          element['specialHourlyRate'] = element.specialHourlyRate.toFixed(2);
          // element['effectiveFrom'] = moment(new Date(element.effectiveFrom)).format(config.cmsDateFormat);
          element['displayEffectiveFrom'] = moment(new Date(element.effectiveFrom)).format(config.cmsDateFormat) || '-';
          element['displayEffectiveTo'] = moment(new Date(element.effectiveTo)).format(config.cmsDateFormat) || '-';
        });
        // this.hourRateForm.patchValue(specialHourListData[0]);
        // this.hourRateForm.get('specialHourlyRateId').setValue(specialHourListData[0]?.id);

        // if (specialHourListData[0]?.effectiveFrom) {
        //   this.hourRateForm.get('matEffectiveFrom').setValue(new Date(specialHourListData[0]?.effectiveFrom));
        // }

        // if (specialHourListData[0]?.effectiveTo) {
        //   this.hourRateForm.get('matEffectiveTo').setValue(new Date(specialHourListData[0].effectiveTo));
        // }
      }

      // Update table data
      this.tableConfigAndProps = {
        ActionButtons: [
          { buttonLabel: "Edit", type: 'edit', buttonRoute: "", visibility: true },
          { buttonLabel: "Delete", type: 'delete', buttonRoute: "", visibility: true }
        ],
        inputData: this.inputData,
        columnHeader: this.columnHeader,
        dataSource: this.dataSource,
        hasTickIcon: false,
        pagination: pagination
      };

      // this.alertService.alertSuccess(res.status, message).then(result => {
      // this.getList(this.filterUrl);
      // })
    })
      .catch(err =>
      {
        this.alertService.alertError(err.error.status, err.error.message).then(result =>
        {
          // this.getList(this.filterUrl);
        })
      })
  }

  editSpecialRate(e)
  {
    debugger;
    let editData = e.row;
    this.hourRateForm.patchValue(editData);
    this.hourRateForm.get('specialHourlyRateId').setValue(editData.id);
    this.hourRateForm.get('matEffectiveTo').reset();
    if (editData.effectiveFrom)
    {
      this.hourRateForm.get('matEffectiveFrom').setValue(new Date(editData.effectiveFrom));
    }

    if (editData.effectiveTo)
    {
      this.hourRateForm.get('matEffectiveTo').setValue(new Date(editData.effectiveTo));
    }
  }



  actionButtonOutput(e)
  {
    console.log(e);

    switch (e.item.type)
    {

      case 'edit':
        this.editSpecialRate(e);
        break;

      case 'delete':
        this.deleteRate(e);
        break;

      default:
        break;
    }

  }
  deleteRate(e: any)
  {
    let url = config.base_url_slug + `delete/branch/deleteSpecialHourlyRate`;
    let payload = {
      id: e.row.id,
      branchId: this.branchId
    }
    let message = 'Are you sure you want to delete this special hourly rate?';
    let heading = 'Confirmation';

    let rightButton = 'Delete';
    let leftButton = 'Cancel';
    this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then(result =>
    {
      if (result)
      {
        this.apiService.post(url, payload).then(result =>
        {
          if (result.code == 200 || result.code == 201 || result.code == 202)
          {
            this.alertService.alertSuccess(result.status, result.message);
            this.getAllFinanceData()
          }
          // else if (result.code == 202)
          // {
          //   this.alertService.alertInfo(result.status, result.message);
          // }
          else if (result?.error)
          {
            this.alertService.alertError(result.error.status, result.error.message);
          }
          else
          {
            this.alertService.alertError(result.status, result.message);
          }
        });
      }
    })

  }

  onDiscountChange(e)
  {

  }

  isNegative(event)
  {
    if (!this.acceptedCharacters.includes(event.key))
    {
      event.preventDefault();

    }
  }

  clearForm()
  {
    // var child_id = localStorage.getItem('child-id')
    this.beforeClear();
    this.Form.reset();
    // this.Form.get('childId').setValue(child_id)
    this.Form.get('selfFinanceHoursPerWeek').setValue(0)
    this.Form.get('stretch').setValue(false)
  }

  onClear1()
  {
    this.Form.get('siblingDiscountPercentage').setValue(null);
    this.Form.get('surchargePercentage').setValue(null);
  }

  onClear2()
  {
    this.hourRateForm.get('specialHourlyRate').setValue(null);
    this.hourRateForm.get('effectiveFrom').setValue(null);
    this.hourRateForm.get('effectiveTo').setValue(null);
    this.hourRateForm.get('matEffectiveFrom').setValue(null);
    this.hourRateForm.get('matEffectiveTo').setValue(null);
  }

  goToEdit()
  {
    // this.router.navigateByUrl(`/main/enrolment/${this.id}/edit`);
    this.type = 'edit';
    this.checkType();
  }

}
