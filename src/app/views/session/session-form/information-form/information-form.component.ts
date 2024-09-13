import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, CommunicationService, PermissionService, UtilsService } from 'src/app/services';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { getInformationFieldMsg } from '../../../../shared/field-validation-messages';
import { MatDialog } from '@angular/material/dialog';
import { config } from 'src/config';
import * as moment from 'moment';

@Component({
  selector: 'app-information-form',
  templateUrl: './information-form.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class InformationFormComponent extends GlobalFormComponent implements OnInit
{
  footerProps: any;
  clock: String = "assets/images/sdn/clock.svg"
  formNo = 2;
  showDuration: boolean = false;
  @Output() category: EventEmitter<string> = new EventEmitter<string>();
  @Output() sendSuccessToParent: EventEmitter<any> = new EventEmitter<any>();
  @Output() sendSessionId = new EventEmitter<any>();
  selected: any;

  disabled = false;
  showSpinners = false;
  stepHour = 1;
  stepMinute = 1;
  stepSecond = 1;
  showSeconds = false;
  timeVar: any;
  disableInput = false;
  isDateDisabled: boolean = true;


  constructor(protected router: Router,
    protected _route: ActivatedRoute,
    protected alertService: AlertService,
    protected apiService: ApiService,
    protected formbuilder: FormBuilder,
    protected dialog: MatDialog,
    protected util: UtilsService,
    protected communicationService: CommunicationService,
    protected permissionService: PermissionService)
  {
    super(router, _route, alertService, apiService, formbuilder, dialog, permissionService);
    this.Form.addControl('branchId', new FormControl(4, [Validators.required]));
    this.Form.addControl('name', new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(22), this.util.trimWhitespaceValidator]));
    this.Form.addControl('category', new FormControl(null, [Validators.required]));
    this.Form.addControl('startTime', new FormControl(null, [Validators.required]));
    this.Form.addControl('endTime', new FormControl(null, [Validators.required]));
    this.Form.addControl('matStartTime', new FormControl(null, [Validators.required]));
    this.Form.addControl('matEndTime', new FormControl(null, [Validators.required]));
    this.Form.addControl('pricingEffectiveFrom', new FormControl(null));
    this.Form.addControl('ageGroupId', new FormControl(1, [Validators.required]));
    this.Form.addControl('effectiveFrom', new FormControl(null, [Validators.required]));
    this.Form.addControl('effectiveTo', new FormControl(null));
    this.Form.addControl('matEffectiveFrom', new FormControl(null, [Validators.required]));
    this.Form.addControl('matEffectiveTo', new FormControl(null));

    this.isMultiple = true;
    this.isParentForm = true;

    this.editPermit = this.permissionsService.getPermissionsByModuleName('Session Management').update

  }

  ngOnInit(): void
  {
    this.sub = this._route.params.subscribe(params =>
    {
      this.id = params['id'];

      if (params.type == "view")
      {
        //   this.Form.controls['id'].disable()
        this.disableInput = true;
      }

      if (this.id == 'add')
      {
        // this.formApi = config.base_url_slug + "add/session";

        if (this.parentId != -1)
        {
          this.detailApi = config.base_url_slug + 'view/session/' + this.parentId;
          this.getDetail();

          if (this.isParentForm)
          {
            this.formApi = config.base_url_slug + 'update/session/' + this.parentId;
            this.detailApi = config.base_url_slug + 'view/session/' + this.parentId;

          }
          else
          {
            this.formApi = config.base_url_slug + "add/session";
          }
        }
        else
        {
          this.formApi = config.base_url_slug + "add/session";
        }
      }
      else
      {
        this.sendSessionId.emit(this.id);
        this.formApi = config.base_url_slug + 'update/session/' + this.id;
        this.detailApi = config.base_url_slug + 'view/session/' + this.id;
        this.getDetail();
      }
    });
    this.Form.controls['matEffectiveFrom'].valueChanges.subscribe(value =>
    {
      if (value != null)
      {
        if(this.type != 'view')
        {
          this.isDateDisabled = false;
        }
        this.minDate = new Date(value);
        let fromDate = new Date(value).setHours(0, 0, 0, 0)
        let toDate = new Date(this.Form.get('matEffectiveTo').value).setHours(0, 0, 0, 0);

        if (toDate < fromDate)
        {
          this.Form.get('matEffectiveTo').setValue(null);
        }
      }
    })
    super.ngOnInit();

    this.footerProps.buttonLabel = "Save";
  }

  beforeSubmit()
  {
    this.isMultiple = true;
    this.showSuccess = false;

    this.Form.controls['branchId'].setValue(localStorage.getItem('branchId'))
    this.Form.controls['ageGroupId'].setValue(1)
    this.Form.controls['effectiveFrom'].setValue(moment(new Date(this.Form.controls['matEffectiveFrom'].value)).format(config.serverDateFormat));
    if (this.Form.controls['matEffectiveTo'].value)
    {
      this.Form.controls['effectiveTo'].setValue(moment(new Date(this.Form.controls['matEffectiveTo'].value)).format(config.serverDateFormat));
    }
    else
    {
      this.Form.controls['effectiveTo'].setValue(null);
    }

    if (this.selected == 'hourly')
    {
      this.Form.controls['startTime'].setValue(null);
      this.Form.controls['endTime'].setValue(null);
    }

    if (this.Form.controls['category'] == null)
    {
      this.Form.controls['category'].setErrors({ 'incorrect': true });
    }
  }

  getErrorMessage(field: any, form?): any
	{
		if (form) {
			return form.get(field) && form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getInformationFieldMsg[field];
		}
		return this.Form.get(field) && this.Form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getInformationFieldMsg[field];
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
        this.disableInput = true
      }
      else if (this.type === 'edit')
      {
        this.footerProps = {
          'buttonLabel': "Save",
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
          'buttonLabel': "Save",
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

  afterDetail(): void
  {
    this.formDetail.matStartTime = this.formDetail.startTime ? (this.formDetail.startTime * 1000) + (new Date(this.formDetail.startTime * 1000).getTimezoneOffset()*60000) : null;
		this.formDetail.matEndTime = this.formDetail.endTime ? (this.formDetail.endTime * 1000) + (new Date(this.formDetail.endTime * 1000).getTimezoneOffset()*60000) : null;

    this.Form.patchValue(this.formDetail);
    this.selected = this.Form.get('category').value;
    this.setDuration();

    if (this.selected == 'standard')
    {
      this.Form.get('startTime').setValidators([Validators.required]);
      this.Form.get('endTime').setValidators([Validators.required]);
      this.Form.get('matStartTime').setValidators([Validators.required]);
      this.Form.get('matEndTime').setValidators([Validators.required]);
    }
    if (this.formDetail.effectiveFrom)
    {
      this.Form.controls['matEffectiveFrom'].setValue(new Date(this.formDetail.effectiveFrom));
    }

    if (this.formDetail.effectiveTo)
    {
      this.Form.controls['matEffectiveTo'].setValue(new Date(this.formDetail.effectiveTo));
    }
    else
    {
      this.Form.get('startTime').setValidators([]);
      this.Form.get('endTime').setValidators([]);
      this.Form.get('startTime').setErrors(null);
      this.Form.get('endTime').setErrors(null);
      this.Form.get('matStartTime').setValidators([]);
      this.Form.get('matEndTime').setValidators([]);
      this.Form.get('matStartTime').setErrors(null);
      this.Form.get('matEndTime').setErrors(null);
    }
  }

  onFormClick(number)
  {
    this.formNo = number
  }

  sessionType(event: any): void
  {
    this.selected = event.value;
    this.category.emit(this.selected);
    this.setDuration();
    if (this.formDetail)
    {
      this.Form.patchValue(this.formDetail);
      this.Form.get('category').patchValue(event.value);
    }

    if (this.selected == 'standard')
    {
      this.Form.get('startTime').setValidators([Validators.required]);
      this.Form.get('endTime').setValidators([Validators.required]);
      this.Form.get('matStartTime').setValidators([Validators.required]);
      this.Form.get('matEndTime').setValidators([Validators.required]);
    }
    else
    {
      this.Form.get('startTime').setValidators([]);
      this.Form.get('endTime').setValidators([]);
      this.Form.get('startTime').setErrors(null);
      this.Form.get('endTime').setErrors(null);
      this.Form.get('matStartTime').setValidators([]);
      this.Form.get('matEndTime').setValidators([]);
      this.Form.get('matStartTime').setErrors(null);
      this.Form.get('matEndTime').setErrors(null);
    }
  }

  setDuration()
  {
    if (this.selected == 'standard')
    {
      this.showDuration = true;
    }
    else
    {
      this.showDuration = false;
    }
  }

  // afterSuccessfullyAdd(): void
  // {
  // 	if (this.id == "add")

  // 	{
  // 		// localStorage.setItem('session-id', this.responseData.id);
  // 		this.sendSessionId.emit(this.responseData.id);

  // 	}
  // 	this.communicationService.setStaff(this.id);
  // }

  afterSuccessfullyAdd(): void
  {
    this.emitFormData.emit({
      type: 'parent',
      value: this.responseData.id,
      key: 'parent'
    });

    this.sendSessionId.emit(this.responseData.id);
    let data = {
      'number': 2,
    }
    this.communicationService.setStaff(data);
  }

  beforeClear()
  {
  }

  onSetTime(event, controlName): void
  {
    this.timeVar = event.timeInMili;

    let offset = new Date().getTimezoneOffset();
		const date = new Date(event.timeInMili * 1000); // Multiply by 1000 to convert seconds to milliseconds
		date.setMinutes(date.getMinutes() - offset);
		const adjustedEpochTimestamp = date.getTime() / 1000; // Divide by 1000 to convert milliseconds to seconds

		this.Form.get(controlName).setValue(event.timeInMili);
		this.Form.get(event.controlName).setValue(adjustedEpochTimestamp);
    // this.Form.get(event.controlName).setValue(event.timeInMili);
  }

  goToEdit()
  {
    // this.router.navigateByUrl(`/main/session/${this.id}/edit`);
    this.type = 'edit';
    this.checkType();
  }

  goBack(): void
  {
    if (this.type == 'new')
    {
      this.router.navigateByUrl(`/main/session`);
    } else
    {
      this.router.navigateByUrl(`/main/session/${this.id}/view`);
    }
  }

  clearDate(controlName)
  {
    if (this.type != 'view')
    {
      let control = controlName == 'matEffectiveFrom' ? 'effectiveFrom' : 'matEffectiveTo';
      this.Form.get(control).setValue(null);
      this.Form.get(controlName).setValue(null);
    }
  }
  hasValue(controlName)
  {
    return this.Form.get(controlName).value && this.type != 'view' ? true : false;
  }

}
