import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import * as moment from 'moment';
import { map, startWith } from 'rxjs/operators';
import { AlertService, ApiService, PermissionService, CommunicationService, UtilsService, AutocompleteFiltersService } from 'src/app/services';
import { getFundingFieldMsg } from 'src/app/shared/field-validation-messages';
import { ParentFormComponent } from 'src/app/shared/parent-form.component';
import { config } from 'src/config';

@Component({
  selector: 'app-add-funding-information',
  templateUrl: './add-funding-information.component.html',
  styleUrls: ['./add-funding-information.component.scss']
})
export class AddFundingInformationComponent extends ParentFormComponent implements OnInit
{
  editPermit: any;
  listId: any; // need to send list id
  isPassCodeRequired = false;
  editFundingData: any;
  childId: any;
  type: any = 'add';
  id: any;
  buttonLabel: any = 'Save Info';
  fundingHeading = 'Add New Funding'
  calendar: String = "assets/images/sdn/ic_event_24px.svg";
  filteredFundingTypes = [];

	fundingTypes = [
		{label: 'Not Funded', value: 1},
		{label: 'Free 15 hours 2 years old', value: 2},
		{label: 'Free 15 hours 3/4 years old', value: 3},
		{label: 'Free 30 hours 3/4 years old', value: 4},
    {label: '5+ years old', value: 6},
		{label: 'Custom Funding', value: 5},
	]
  showStretch: boolean = false;

  constructor(protected router: Router,
    protected _route: ActivatedRoute,
    protected alertService: AlertService,
    protected apiService: ApiService,
    protected formbuilder: FormBuilder,
    protected dialog: MatDialog,
    protected util: UtilsService,
    protected filterService: AutocompleteFiltersService,
    protected permissionsService: PermissionService,
    protected communicationService: CommunicationService,
    public dialogRef: MatDialogRef<AddFundingInformationComponent>)
  {

    super(router, _route, alertService, apiService, formbuilder, dialog, communicationService, permissionsService);
    this.Form.addControl('childId', new FormControl(null, [Validators.required]));
    this.Form.addControl('fundedFinanceHoursPerWeek', new FormControl(0, [Validators.required]));
    this.Form.addControl('fundingId', new FormControl(1, [Validators.required]));
    this.Form.addControl('selfFinanceHoursPerWeek', new FormControl(0, [
    RxwebValidators.minNumber({ value: 1, conditionalExpression: (x, y) => x.fundingId == 5 })]));
    this.Form.addControl('stretch', new FormControl(false, [Validators.required]));
    this.Form.addControl('startDate', new FormControl(null, [Validators.required]));
    this.Form.addControl('endDate', new FormControl(null));
    this.Form.addControl('type', new FormControl(null));
    this.Form.addControl('matstartDate', new FormControl(null, [Validators.required]));
    this.Form.addControl('matendDate', new FormControl(null));
    this.Form.addControl('branchId', new FormControl(localStorage.getItem('branchId')));
    this.Form.addControl('passCode', new FormControl(null, [Validators.minLength(3), Validators.maxLength(18), this.util.trimWhitespaceValidator]));
    this.Form.addControl('fundingLabel', new FormControl(null, [this.util.trimWhitespaceValidator]));
    this.isMultiple = false;
    this.editPermit = this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Children').update;

    this.communicationService.getChild().subscribe(childData => console.log(childData));

      // Populate autcomplete data for funding types
			let funding = this.Form.get('fundingLabel').valueChanges.pipe(
				startWith(''),
				map(value => this.filterService._filterRelationships(value, this.fundingTypes))
			);
			funding.subscribe((d)=> this.filteredFundingTypes =  d);
	    // End
  }

  ngOnInit(): void
  {
    if (this.childId != -1)
    {
      this.Form.get('childId').setValue(this.childId);
    }
    // console.log("this.Form",this.Form.value.childId);

    this.Form.get('fundingId').valueChanges.subscribe(val =>
    {
      this.Form.get('stretch').setValue(false);
      // Set validators for custom funding
      if (val == 5) {
        this.Form.get('selfFinanceHoursPerWeek').setValidators([Validators.required, Validators.min(1),Validators.max(30)]);
        this.Form.get('selfFinanceHoursPerWeek').updateValueAndValidity();
      } else {
        this.Form.get('selfFinanceHoursPerWeek').clearValidators()
        this.Form.get('selfFinanceHoursPerWeek').updateValueAndValidity();
      }

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
          break;
        case 3:

          this.Form.get('fundedFinanceHoursPerWeek').setValue(15)
          this.Form.get('selfFinanceHoursPerWeek').setValue(0)
          this.Form.get('type').setValue("funded")

          break;
        case 4:

          this.Form.get('fundedFinanceHoursPerWeek').setValue(30)
          this.Form.get('selfFinanceHoursPerWeek').setValue(0)
          this.Form.get('type').setValue("funded")
          break;
        case 5:
          this.Form.get('fundedFinanceHoursPerWeek').setValue(0)
          this.Form.get('stretch').setValue(false)
          this.Form.get('type').setValue("self")
          break;

        case 6:
          this.Form.get('fundedFinanceHoursPerWeek').setValue(0)
          this.Form.get('selfFinanceHoursPerWeek').setValue(0)
          this.Form.get('type').setValue("funded")

          break;
      }
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

          break;
        case 3:

          this.Form.get('fundedFinanceHoursPerWeek').setValue(15)
          this.Form.get('selfFinanceHoursPerWeek').setValue(0)
          this.Form.get('type').setValue("funded")
          break;
        case 4:

          this.Form.get('fundedFinanceHoursPerWeek').setValue(30)
          this.Form.get('selfFinanceHoursPerWeek').setValue(0)
          this.Form.get('type').setValue("funded")
          break;
        case 5:
          this.Form.get('fundedFinanceHoursPerWeek').setValue(0)
          // this.Form.get('selfFinanceHoursPerWeek').setValue(null)
          this.Form.get('type').setValue("self")
          break;

        case 6:
          this.Form.get('fundedFinanceHoursPerWeek').setValue(0)
          this.Form.get('selfFinanceHoursPerWeek').setValue(0)
          this.Form.get('type').setValue("funded")
          break;
      }
    });
    // parent id need to send from component
    if (this.parentId != -1)
    {
      this.Form.controls['childId'].setValue(this.parentId);
      this.id = this.parentId;
    }
    let operationalPeriod = localStorage.getItem('operationalPeriod');
    if(operationalPeriod == "all_year"){
      this.showStretch =true;
    }
    super.ngOnInit();
    if (this.editFundingData)
    {
      this.buttonLabel = 'Update Info';
      this.fundingHeading = "Update Funding"
      console.log("editFundingData", this.editFundingData);
      this.Form.controls['matstartDate'].setValue(new Date(this.editFundingData.startDate));
      if(this.editFundingData.endDate != null)
      {
        this.Form.controls['matendDate'].setValue(new Date(this.editFundingData.endDate));

      }
      this.listId = this.editFundingData.id;
      let editFunding = this.editFundingData;
      // if (editFunding.stretch == false)
      // {
      //   editFunding.stretch = false
      // }
      // else
      // {
      //   editFunding.stretch = true
      // }
      this.Form.patchValue(editFunding);

      // Setting fundingType manually for autocomplete
        let age = this.fundingTypes.find(x => x.value == editFunding.fundingId);
        this.Form.get('fundingLabel').setValue(age ? age.label : null);
      // End
    }
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
  }

  onSubmit()
  {
    this.beforeSubmit();
    console.log("Form---------", this.Form.value);

    if (this.Form.invalid)
    {
      this.alertService.alertError('WARNING', 'Please fill the required data.');
      return;
    }
    let url = '';
    let type = '';
    if (!this.editFundingData)
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
          this.dialogRef.close(true);
        });
      }
      // else if (res.code == 201) {
      //   this.alertService.alertAsk('SUCCESS', res.message, 'Yes', 'No',false).then(result => {
      //     if (result) {
      //       this.router.navigate(['main/finance/allInvoice']);
      //     } else {
      //       this.dialogRef.close(true);
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

    getErrorMessage(field: any, form?): any
    {
      if (form) {
        return form.get(field) && form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getFundingFieldMsg[field];
      }
      return this.Form.get(field) && this.Form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getFundingFieldMsg[field];
    }

  afterDetail(): void
  {
    this.isUpdate = true;
    let onGoing = this.formDetail?.listing[0]
    this.Form.patchValue(onGoing);
    if (onGoing?.startDate)
    {
      this.Form.controls['matstartDate'].setValue(new Date(onGoing?.startDate));
    }

    if (onGoing?.endDate)
    {
      this.Form.controls['matendDate'].setValue(new Date(onGoing?.endDate));
    }


    this.emptyForm = this.Form.value;
    this.communicationService.unSavedForm.next(false);
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

  checkPassCode()
  {
    if (this.Form.get('passCode').value == '')
    {
      this.Form.get('passCode').setValue(null);
    }
  }

  setValue() {
		let funding = this.fundingTypes.find(x => x.label == this.Form.get('fundingLabel').value);
		this.Form.get('fundingId').setValue(funding ? funding.value : null);
	}

  onBlurEvent(event)
  {
    if (event.target.value.includes('.'))
    {
      event.target.value = parseFloat(parseFloat(event.target.value).toFixed(2));
      this.Form.get('selfFinanceHoursPerWeek').setValue(Number(event.target.value));
    }
  }
  closeFundingDialog()
  {
    this.communicationService.unSavedForm.next(false);
    this.dialogRef.close(false);
  }
}
