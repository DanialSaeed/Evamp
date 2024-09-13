import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormArray, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService } from 'src/app/services';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { getPricingFieldMsg } from '../../../../shared/field-validation-messages';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { config } from 'src/config';

@Component({
  selector: 'app-pricing-form',
  templateUrl: './pricing-form.component.html',
  styleUrls: ['/src/app/views/shared-style.scss', './pricing-form.component.scss']
})
export class PricingFormComponent extends GlobalFormComponent implements OnInit {
  footerProps: any;
  calendar: String = "assets/images/sdn/ic_event_24px.svg"
  formNo = 2;
  showDuration: boolean = false;
  selected: any
  // sessionId: any;
  @Input() sessionId: any;
  @Input() editPermit: any;
  sessionInfo: any;
  sessionName: any;
  showHistory: boolean = true;
  isDateDisabled: boolean = false;
  isAlpha = str => /^[a-zA-Z]*$/.test(str);
  isAlphaNumeric = str => /^[1-9a-z]+$/.test(str);
  specialCharformat = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,<>\/?~]/;
  acceptedCharacters: string[] = ['.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  ageGroups: any;

  constructor(protected router: Router,
    protected _route: ActivatedRoute,
    protected alertService: AlertService,
    protected apiService: ApiService,
    protected formbuilder: FormBuilder,
    protected dialog: MatDialog,) {
    super(router, _route, alertService, apiService, formbuilder, dialog);
    this.Form.addControl('sessionId', new FormControl(this.sessionId));
    this.Form.addControl('sessionPricingEffectiveFrom', new FormControl(null, [Validators.required]));
    this.Form.addControl('mateffectiveFrom', new FormControl(null, [Validators.required]));
    this.Form.addControl('rates', new FormArray([]));

  }

  ngOnInit(): void {
    // this.sessionId = localStorage.getItem('session-id')
    this.Form.controls['sessionId'].setValue(this.sessionId);

    this.isMultiple = true;

    this.sub = this._route.params.subscribe(params => {
      this.id = params['id'];
      if (this.id == 'add') {
        this.showHistory = false;
        this.isDateDisabled = true;
        // this.formApi = config.base_url_slug + "add/session-pricing";
        // if (this.sessionId != null)
        // {
        // 	this.detailApi = config.base_url_slug + 'view/session/' + this.sessionId;
        // 	this.getDetail();
        // }

        if (this.parentId != -1) {
          this.detailApi = config.base_url_slug + 'view/session/' + this.parentId;
          this.getDetail();
          this.Form.controls['sessionId'].setValue(this.parentId)

          if (this.childId != -1) {
            this.formApi = config.base_url_slug + 'update/session-pricing/' + this.parentId;
            this.detailApi = config.base_url_slug + 'view/session/' + this.parentId;

          }
          else {
            this.formApi = config.base_url_slug + "add/session-pricing";
          }
        }
        else {
          this.formApi = config.base_url_slug + "add/session-pricing";
        }
      }
      else {
        this.Form.controls['sessionId'].setValue(this.id);
        this.formApi = config.base_url_slug + 'update/session-pricing';
        this.detailApi = config.base_url_slug + 'view/session/' + this.id;
        this.getDetail();
      }
    });
    super.ngOnInit();
    this.footerProps.buttonLabel = "Save";

  }

  get rates(): FormArray {
    return this.Form.get('rates') as FormArray;
  }

  getErrorMessage(field: any): any {
    return getPricingFieldMsg[field];
  }
  checkType() {
    if (this.type != "") {
      if (this.type === 'view') {
        this.title = "View " + this.title;
        this.footerProps = {
          'hasButton': false,
          'type': 'view'
        };
        this.onlyImage = true;
        this.Form.disable();
        this.disableInput = true
      }
      else if (this.type === 'edit') {
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
      else {
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
    }
  }
  checkFormUrls(): void {
    if (this.type == "view") {
    }
  }
  afterDetail(): void {
    this.Form.patchValue(this.formDetail);
    this.selected = this.formDetail.category;
    this.sessionName = this.formDetail.name;
    if (this.id == 'add') {
      this.Form.get('mateffectiveFrom').setValue(new Date(this.formDetail.effectiveFrom));
      this.Form.controls['sessionPricingEffectiveFrom'].setValue(moment(new Date(this.formDetail.effectiveFrom)).format(config.serverDateFormat))
    }

    if (this.formDetail.pricingEffectiveFrom) {
      this.Form.get('sessionPricingEffectiveFrom').setValue(this.formDetail.pricingEffectiveFrom);
      this.Form.get('mateffectiveFrom').setValue(new Date(this.formDetail.pricingEffectiveFrom));
    }

    if (this.formDetail.sessionPricing.length > 0) {
      this.getAgeGroups('edit');
    }
    else {
      this.getAgeGroups('add');
    }

    // this.formDetail.sessionPricing.forEach(element => {
    // 	element.dailyTimeRate = 10.03
    // });
  }

  onSubmit() {
    this.beforeSubmit();

    if (this.Form.invalid) {
      this.alertService.alertError('WARNING', 'Please fill the required data.');
      return;
    }

    let heading = 'Confirmation';
    let message = 'Are you sure you want to create these session pricings?';
    let rightButton = 'Yes';
    let leftButton = 'No';
    if (this.id != 'add') {
      message = 'Are you sure you want to update the session pricing?';
    }
    this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then(result => {
      console.log(result);
      if (!result) {
        return;
      } else {
        let url = '';
        let type = '';
        if (this.id == 'add') {
          url = config.base_url_slug + "add/session-pricing";
          type = 'post';
        }
        else {
          url = config.base_url_slug + 'update/session-pricing/' + this.parentId;
          type = 'patch';
        }

        this.apiService[type](this.formApi, this.Form.value).then((res) => {
          console.log(res);
          if (res.code == 200 || res.code == 201) {
            this.alertService.alertSuccess('SUCCESS', res.message).then(result => {
              window.history.back();
            });
          }
          // else if (res.code == 201) {
          //   this.alertService.alertAsk('SUCCESS', res.message, 'Yes', 'No',false).then(result => {
          //     if (result) {
          //       this.router.navigate(['main/finance/allInvoice']);
          //     } else {
          //       window.history.back();
          //     }
          //   })
          // }
          else if (res?.error) {
            this.alertService.alertError("Error", res.error.message).then(() => {
              return;
            })
          }
          else {
            this.alertService.alertError("Error", res.error.message).then(() => {
              return;
            })
          }
        })
          .catch(err => console.log(err));
      }
    });


  }

  getFilterAges(id): any {
    let filterData = this.ageGroups.filter(function (age) {
      return age.id == id;
    });
    return filterData[0];
  }
  // beforeSubmit(){
  //   this.Form.controls['sessionPricingEffectiveFrom'].patchValue(moment(new Date(this.Form.controls['matEffectiveFrom'].value)).format(config.serverDateFormat));
  // }

  afterSuccessfullyAdd() {
    let id = this.responseData.sessionPricing ? this.responseData.sessionPricing[0].id : 0;
    this.emitFormData.emit({
      type: 'child',
      value: id,
      key: 'pricingId'
    });

    localStorage.removeItem("session-id");
    this.router.navigateByUrl('/main/session');
  }

  clearForm() {
    this.Form.get('mateffectiveFrom').setValue(null);
    this.Form.get('sessionPricingEffectiveFrom').setValue(null);

    this.rates.controls.forEach(element => {
      if (this.selected == 'hourly') {
        element.get('hourlyTimeRate').setValue(null);
      }
      else if (this.selected == 'standard') {
        element.get('fullTimeRate').setValue(null);
        element.get('dailyTimeRate').setValue(null);
      }
    });
  }
  getAgeGroups(type): void {
    let url = config.base_url_slug + 'view/age-groups';
    this.apiService.get(url).then(res => {
      if (res.code == 200) {
        this.ageGroups = res.data;

        if (type == 'add') {
          this.ageGroups.forEach(element => {
            if (this.selected == 'hourly') {
              this.rates.push(this.formbuilder.group({
                ageGroupId: element.id,
                hourlyTimeRate: new FormControl(null, [Validators.required, Validators.min(0), Validators.minLength(1), this.fourDigitError()]),
                maximumAge: element.maximumAge,
                minimumAge: element.minimumAge,
                label: element.label
              }));
            }
            else if (this.selected == 'standard') {
              this.rates.push(this.formbuilder.group({
                ageGroupId: element.id,
                fullTimeRate: new FormControl(null, [Validators.required, Validators.min(0), Validators.minLength(1), this.fourDigitError()]),
                dailyTimeRate: new FormControl(null, [Validators.required, Validators.min(0), Validators.minLength(1), this.fourDigitError()]),
                maximumAge: element.maximumAge,
                minimumAge: element.minimumAge,
                label: element.label
              }));
            }
          });
        }
        else if (type == 'edit') {
          this.formDetail.sessionPricing.forEach(element => {
            console.log(element);
            let ageRange = this.getFilterAges(element.ageGroupId);
            if (this.selected == 'hourly') {
              this.rates.push(this.formbuilder.group({
                ageGroupId: element.ageGroupId,
                hourlyTimeRate: new FormControl({ value: element.hourlyTimeRate, disabled: this.disableInput }, [Validators.required, Validators.min(0), Validators.minLength(1), this.fourDigitError()]),
                maximumAge: ageRange.maximumAge,
                minimumAge: ageRange.minimumAge,
                label: ageRange.label
              }));
            }
            else if (this.selected == 'standard') {
              this.rates.push(this.formbuilder.group({
                ageGroupId: element.ageGroupId,
                fullTimeRate: new FormControl({ value: element.fullTimeRate, disabled: this.disableInput }, [Validators.required, Validators.min(0), Validators.minLength(1), this.fourDigitError()]),
                dailyTimeRate: new FormControl({ value: element.dailyTimeRate, disabled: this.disableInput }, [Validators.required, Validators.min(0), Validators.minLength(1), this.fourDigitError()]),
                maximumAge: ageRange.maximumAge,
                minimumAge: ageRange.minimumAge,
                label: ageRange.label
              }));
            }
          });
          console.log(this.rates);

        }
        console.log(this.rates);

      }
      else {
        this.ageGroups = [];
      }
    });
  }
  goToEdit() {
    this.type = 'edit';
    this.checkType();
  }

  onBlurEvent(event, control, name) {
    // console.log(event);
    // if (event.target.value !== "")
    // {
    // 	event.target.value = parseFloat(event.target.value).toFixed(2)
    // }
    console.log(this.rates);

    if (this.isAlpha(event.target.value)) {
      control.get(name).setValue(null);
      return;
    }

    // if (this.isAlphaNumeric(event.target.value)) {
    // 	control.get(name).setValue(null);
    // 	return;
    // }

    if (this.specialCharformat.test(event.target.value)) {
      control.get(name).setValue(null);
      return;
    }

    if (event.target.value !== "") {
      event.target.value = parseFloat(event.target.value).toFixed(2);
      control.get(name).setValue(event.target.value);
    }
  }

  validate(e) {
    let val = e.target.value;


    if (e.target.value.includes('.') && ![8, 46, 37, 39].includes(e.keyCode)) {
      if (parseInt(val.split('.')[1]) > 9) {
        console.log(parseInt(val.split('.')[1]));
        return false;
      } else {
        return true;
      }
    }

  }


  ParseFloat(str, val) {
    str = str.toString();
    str = str.slice(0, (str.indexOf(".")) + val + 1);
    return Number(str);
  }

  fourDigitError(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      const value = control.value;

      if (value) {
        if (value.includes('.') || value > 9999.99) {
          if (parseInt(value.split('.')[0]) > 9999.99) {
            return { digitError: true };
          }
        }
      }

      // return !passwordValid ? {passwordStrength:true}: null;
    }
  }
  emitSessionPricing(event: any) {
    // this.Form.patchValue(event);
    while (this.rates.length) {
      this.rates.removeAt(0);
    }
    this.clearForm();

    this.sessionName = event.session;
    this.sessionId = event.sessionId;
    this.Form.controls['sessionId'].setValue(this.sessionId);

    if (event.sessionPricingEffectiveFrom) {
      this.Form.get('sessionPricingEffectiveFrom').setValue(event.sessionPricingEffectiveFrom);
      this.Form.get('mateffectiveFrom').setValue(new Date(event.sessionPricingEffectiveFrom));
    }
    this.formDetail.sessionPricing = ""


    this.formDetail.sessionPricing = event.sessionRate;

    if (this.formDetail.sessionPricing.length > 0) {
      this.getAgeGroups('edit');
    }
    else {
      this.getAgeGroups('add');
    }

    // console.log("Emitted Event", this.Form.value);
  }
  isHistoryExists(event: any) {
    console.log("event------", event);
    this.showHistory = event

  }
  isNegative(event) {
    if (!this.acceptedCharacters.includes(event.key)) {
      event.preventDefault();

    }
  }
}
