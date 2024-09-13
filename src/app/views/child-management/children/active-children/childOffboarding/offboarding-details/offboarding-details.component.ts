import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, AutocompleteFiltersService, CommunicationService, PermissionService } from 'src/app/services';
import { getOffboardingFieldMsg } from 'src/app/shared/field-validation-messages';
import { config } from 'src/config';
import { ParentFormComponent } from 'src/app/shared/parent-form.component';
import * as $ from 'jquery';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import * as moment from 'moment';
@Component({
  selector: 'app-offboarding-details',
  templateUrl: './offboarding-details.component.html',
  styleUrls: ['/src/app/views/shared-style.scss', './offboarding-details.component.scss']
})
export class OffboardingDetailsComponent extends ParentFormComponent implements OnInit, OnDestroy
{
  @Output() sendchildId = new EventEmitter<any>();
  @Output() previousFormData = new EventEmitter<any>();
  @Input() previousForm: any;
  @Input() formDetail: any;
  currentDate = new Date();
  todayDate = new Date();
  calendar: String = "assets/images/sdn/ic_event_24px.svg"
  ageGroupId: any;
  area: any;
  Form: FormGroup;
  label = "Upload Photo "
  dateOfBirth: any;
  hide = true;
  emptyForm: any;
  isUpdate = false;

  editPermit: any;
  showSiblingDiscount = false;
  showStaffDiscount = false;

  filteredNationalities: any[] = [];
  filteredReligions: any[];
  filteredEthinicOrigins: any[];
  filteredLanguages: any[];
  newType: any;

  constructor(protected router: Router,
    protected _route: ActivatedRoute,
    protected alertService: AlertService,
    protected apiService: ApiService,
    protected formbuilder: FormBuilder,
    protected dialog: MatDialog,
    protected filterService: AutocompleteFiltersService,
    protected permissionService: PermissionService,
    protected communicationService: CommunicationService)
  {
    super(router, _route, alertService, apiService, formbuilder, dialog, communicationService, permissionService);

    this.Form.addControl('leaveDate', new FormControl('', Validators.required));
    this.Form.addControl('noticeGiven', new FormControl('', Validators.required));
    this.Form.addControl('reason', new FormControl('', Validators.required));
    this.Form.addControl('childId', new FormControl('', Validators.required));
    this.hasFile = false;
    this.isParentForm = true;
    this.emptyForm = this.Form.value;
    this.editPermit = true

    // check for back click browser

    // this.checkForBack();
  }

  ngOnInit(): void
  {
    $('input').attr('autocomplete', 'cc-name');
    this.currentDate.setDate(this.currentDate.getDate() - 1);
    this.Form.get('childId').setValue(this.parentId);
    let offboardingDetails = JSON.parse(localStorage.getItem('offboardingDetail'));
    if (offboardingDetails)
    {
      this.previousForm = offboardingDetails;
    }
    if (this.previousForm)
    {
      this.Form.patchValue(this.previousForm);
    }
    // if (offboardingDetails)
    // {
    //   this.newType = 'view'
    //   this.checkType();
    // }
    // else
    // {
    //   this.goToEdit();
    // }
    this.sub = this._route.params.subscribe(params =>
    {
      this.id = params['id'];
      if (this.id == 'add')
      {
        this.newType = 'add';
      }
      else
      {
        this.detailApi = config.base_url_slug + 'view/child/' + this.id;
        this.getDetail();
        if (offboardingDetails)
        {
          this.newType = 'view'
          this.checkType();
        }
        else
        {
          this.goToEdit();
        }
      }
    });

    super.ngOnInit();
    this.Form.controls.leaveDate.valueChanges.subscribe(() =>
    {
      this.Form.get('noticeGiven').setValue(null);
    })

  }


  getErrorMessage(field: any): any
  {
    return getOffboardingFieldMsg[field];
  }
  checkType()
  {
    if (!this.Form.invalid)
    {
      this.previousFormData.emit(this.Form.value);
    }
    if (this.newType != "")
    {
      if (this.newType === 'view')
      {
        this.footerProps = {
          'hasButton': false,
          'type': 'view',
        };
        this.onlyImage = true;
        this.Form.disable();
      }
      else if (this.newType === 'edit')
      {
        this.footerProps = {
          'buttonLabel': "Next",
          'hasButton': true,
          'hasSubButton': false,
          'hasCancel': true,
          'hasCancelLabel': 'Cancel',

        };
        this.Form.enable();
        if (this.previousForm?.noticeGiven)
        {
          this.Form.get('noticeGiven').setValue(this.previousForm.noticeGiven);
          this.Form.get('noticeGiven').updateValueAndValidity();
          this.previousFormData.emit(this.Form.value);
        }
        this.disableInput = false;
        this.onlyImage = false;
      }
      else
      {
        this.footerProps = {
          'buttonLabel': "Next",
          'hasCancel': true,
          'hasCancelLabel': 'Cancel',
          'hasButton': true,
          'hasSubButton': false,
        };
        this.onlyImage = false;
      }
    }
  }

  afterDetail(): void
  {
    this.isUpdate = true;
    if (this.formDetail)
    {
      // this.Form.get('noticeGiven').setValue(this.previousForm.noticeGiven);
    }
  }
  beforeSubmit()
  {
  }

  afterSuccessfullyAdd(): void
  {

  }
  goToEdit()
  {
    this.newType = 'edit';
    this.checkType();
  }

  onSubmit()
  {
    if (this.Form.invalid)
    {
      this.alertService.alertError('WARNING', 'Please fill the required data.');
      return;
    }
    this.previousFormData.emit(this.Form.value);
    let data = {
      'number': 2,
      'url': 'offboarding-funding-info',
      'prevForm': '',
      'currentForm': 'offboardingDetails',
      'isForm': true,
    }
    this.communicationService.setChild(data);
  }

  ngOnDestroy(): void
  {
    window.removeEventListener('popstate', () => { });
  }

  goBack()
  {
    // if formNo is greater than 1 than can be go back to -1 formNo
  }

  onCancel()
  {
    window.history.back();
  }
  dateChangeStatic(Form, controlName, event: MatDatepickerInputEvent<Date>)
  {
    if (controlName == 'leaveDate' && (moment(event.value).format('dddd') == 'Saturday' || moment(event.value).format('dddd') == 'Sunday'))
    {
      Form.get(controlName).setValue(null);
      this.alertService.alertInfo('Warning', 'Selection not allowed on Saturday and Sunday.');
      return;
    }else
    {
      const formattedDate = moment(new Date(event.value)).format(config.serverDateFormat);
      Form.get(controlName).setValue(formattedDate);
    }

  }
}
