import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormArray, Validators, FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, AutocompleteFiltersService, CommunicationService, PermissionService, UtilsService } from 'src/app/services';
import { MatDialog } from '@angular/material/dialog';
import { getGuardianInfoFieldMsg } from '../../../../shared/field-validation-messages';
import { config } from 'src/config';
import { ParentFormComponent } from 'src/app/shared/parent-form.component';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import * as moment from 'moment';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-guardians-childs',
  templateUrl: './guardians-childs.component.html',
  styleUrls: ['./guardians-childs.component.scss', '/src/app/views/shared-style.scss']
})
export class GuardiansChildsComponent extends ParentFormComponent implements OnInit, OnDestroy {
  footerProps: any;
  formNo = 2;
  selected: any;
  dateOfBirth: any;
  @Input() childId: any;
  editPermit: any;
  hidden: any = false;
  searchTimer: any;
  calendar: String = "assets/images/sdn/ic_event_24px.svg"
  childUpdId: any;
  disableType: any = false;
  primaryDisabled: boolean = true;
  isMultipleGuardian: boolean = false;
  relationShip: any[] = [
    { key: 'guardian', value: 'Parent/Guardian' },
    { key: 'other', value: 'Other' }
  ]

  filteredLanguages: any[];
  filteredGuardians: any[] = [];
  relations: any[] = [];
  titles: any[] = [
    {
      key: 'mr', value: 'Mr'
    },
    { key: 'mrs', value: 'Mrs' }]
  submitObject: {};
  name: any;
  guardianType: any;
  filteredRelations = [];


  constructor(protected router: Router,
    protected _route: ActivatedRoute,
    protected alertService: AlertService,
    protected apiService: ApiService,
    protected formbuilder: FormBuilder,
    protected dialog: MatDialog,
    protected utilService: UtilsService,
    protected filterService: AutocompleteFiltersService,
    protected permissionsService: PermissionService,
    protected communicationService: CommunicationService) {
    super(router, _route, alertService, apiService, formbuilder, dialog, communicationService, permissionsService);
    // address fields
    this.Form.addControl('postalCode', new FormControl(null));
    this.Form.addControl('address', new FormControl(null));
    this.Form.addControl('streetNumber', new FormControl(null));
    this.Form.addControl('city', new FormControl(null));
    this.Form.addControl('latitude', new FormControl(null));
    this.Form.addControl('longitude', new FormControl(null));
    this.Form.addControl('addressLabel', new FormControl(null, Validators.required));
    this.Form.addControl('streetAddress', new FormControl(null));
    this.Form.addControl('country', new FormControl(null));
    this.Form.addControl('region', new FormControl(null));


    // common keys
    this.Form.addControl('guardianType', new FormControl('new', [Validators.required]));
    this.Form.addControl('childId', new FormControl(null, [Validators.required]));
    this.Form.addControl('guardianId', new FormControl(null, [Validators.required]));
    this.Form.addControl('guardianName', new FormControl(null, [Validators.required]));

    this.Form.addControl('guardianRelationId', new FormControl(null, [Validators.required]));
    this.Form.addControl('markedPrimary', new FormControl(false, [Validators.required]));
    this.Form.addControl('type', new FormControl(null, [Validators.required]));

    this.Form.addControl('title', new FormControl(null, [Validators.required]));
    this.Form.addControl('dateOfBirth', new FormControl(null));
    this.Form.addControl('languageLabel', new FormControl(null, [Validators.pattern("[ a-zA-Z]*"), this.utilService.trimWhitespaceValidator]));
    this.Form.addControl('firstLanguageId', new FormControl(null));
    this.Form.addControl('nationalInsuranceNumber', new FormControl(null, [Validators.pattern('^[a-zA-Z]{2}[0-9]{6}[a-zA-Z]{1}$'), this.utilService.trimWhitespaceValidator]));
    this.Form.addControl('landlineNo', new FormControl(null, [Validators.min(0), Validators.minLength(8), Validators.maxLength(11), Validators.pattern("^-?[0-9]\\d*(\\.\\d{1,2})?$"), this.utilService.trimWhitespaceValidator]));
    this.Form.addControl('workTelephoneNo', new FormControl(null, [Validators.min(0), Validators.minLength(8), Validators.maxLength(11), Validators.pattern("^-?[0-9]\\d*(\\.\\d{1,2})?$"), this.utilService.trimWhitespaceValidator]));
    this.Form.addControl('branchId', new FormControl(localStorage.getItem('branchId')));

    this.Form.addControl('organizationName', new FormControl(null, Validators.required));

    this.Form.addControl('mobileNumber', new FormControl(null, [Validators.required, Validators.min(0), Validators.minLength(8), Validators.maxLength(11), Validators.pattern("^-?[0-9]\\d*(\\.\\d{1,2})?$"), this.utilService.trimWhitespaceValidator],));
    this.Form.addControl('name', new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(36), this.utilService.trimWhitespaceValidator]));
    this.Form.addControl('email', new FormControl(null, [Validators.required, Validators.email, this.utilService.trimWhitespaceValidator]));
    this.Form.addControl('relationLabel', new FormControl(null, [Validators.required, this.utilService.trimWhitespaceValidator]));


    this.isMultiple = true;
    this.emptyForm = this.Form.value;
    this.noFormCheck = true; // do not check for form changes in parent-component.ts
    this.editPermit = this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Children').update;

    // Populate autcomplete data for relations
    let relation = this.Form.get('relationLabel').valueChanges.pipe(
      startWith(''),
      map(value => this.filterService._filterGuardianRelations(value, this.relations))
    );
    relation.subscribe((d) => this.filteredRelations = d);
    // End
  }

  ngOnInit(): void {
    if (this.parentId != -1) {
      this.Form.controls['childId'].setValue(this.parentId);
    }

    this.sub = this._route.params.subscribe(params => {

      this.id = params['id'];
      if (this.id == 'add') {
        this.getGuardians(this.parentId)
        this.setValidations("new");
        this.setValidations("existing");
        if (this.parentId != -1) {
          this.formApi = config.base_url_slug + "add/link-guardian";
          // this.detailApi = config.base_url_slug + 'view/child/' + this.parentId;

          // this.getDetail();

          if (this.childId != -1) {
            this.formApi = config.base_url_slug + 'update/guardian/' + this.id;
          }
          else {
            this.formApi = config.base_url_slug + "add/link-guardian";
          }
        }
        else {
          this.formApi = config.base_url_slug + "add/link-guardian";
        }
      }
      else {

        if (this.childId != -1) {
          this.formApi = config.base_url_slug + 'update/guardian/' + this.id;
          // this.detailApi = config.base_url_slug + 'view/child/' + this.id;
          // this.getDetail();
        }
        else {
          this.formApi = config.base_url_slug + "add/link-guardian";
        }
      }

      // Check for form changes for unsaved
      this.sub2 = this.Form.valueChanges.subscribe((val) =>
      {
        console.log(this.emptyForm);
        console.log(this.Form.value);
        
        if (JSON.stringify(this.emptyForm) != JSON.stringify(this.Form.value))
        {
          this.communicationService.unSavedForm.next(true);
        } else {
          this.communicationService.unSavedForm.next(false);
        }
      });
    });
    if (this.id != "add") {
      this.getGuardians(this.id);
    }

    this.Form.controls['guardianType'].valueChanges.subscribe(value => {
      this.setValidations(value);
    })
    this.Form.controls['type'].valueChanges.subscribe(value => {
      if (value) {
        if (value == 'other' && this.Form.get('markedPrimary').value == true && !this.isMultipleGuardian) {
          this.Form.get('type').setValue(null);
          this.alertService.alertInfo("Info", "No Natural Person has been assigned to the Child. Please attach a Natural Person before assigning Guardian Type: Other");
        }
        else {
          if (this.isMultipleGuardian) {
            this.Form.get('markedPrimary').setValue(false);
          }
        }
        this.setFormFieldValidations(value);
      }
    })
    this.filteredLanguages = [...this.firstLanguages];


    let language = this.Form.controls.languageLabel.valueChanges.pipe(
      startWith(''),
      map(value => this.filterService._filterLanguage(value, [...this.firstLanguages]))
    );
    language.subscribe((d) => this.filteredLanguages = d);

    // auto complete guardians dropdown filteration
    let guardian = this.Form.get('guardianName').valueChanges.pipe(
      startWith(''),
      map(value => this.filterService._filterGuardians(value, this.guardians))
    );
    // this.value.length === 1 && this.value[0] === 'No data'
    guardian.subscribe((d) => {
      this.filteredGuardians = d
    });
    //End

    super.ngOnInit();
    this.getRelation();
    this.communicationService.unSavedForm.next(false);
    this.Form.get('markedPrimary').valueChanges.subscribe(value => {
      if (value == true && this.Form.get('type').value == 'other') {
        this.Form.get('guardianName').setValue(null);
        this.Form.get('guardianId').setValue(null);
        this.Form.get('type').setValue(null);
        this.alertService.alertInfo("Info", "No Natural Person has been assigned to the Child. Please attach a Natural Person before assigning Guardian Type: Other");
        return;
      }
    })

  }
  // getGuardians()
  // {
  //   let branchId = localStorage.getItem('branchId');
  //   let attributes = 'attributes=[{ "key": "branchId", "value": ' + branchId + ' }]'
  //   let url = config.base_url_slug + 'view/guardians?' + attributes;
  //   this.apiService.get(url).then(response =>
  //   {
  //     this.guardians = response.data.listing;
  //   })
  // }
  checkType() {
    if (this.type != "") {
      if (this.type === 'view') {
        this.Form.get('guardianType').setValue('existing')
        this.setValidations('existing')
        this.title = "Guardian Information"
        this.footerProps = {
          'hasButton': false,
          'type': 'view'
        };
        this.onlyImage = true;
        this.Form.disable();
        this.disableInput = true
      }
      // || this.type === 'view'
      else if (this.type === 'edit') {

        this.Form.get('guardianType').setValue('existing')
        this.setValidations('existing')
        this.footerProps = {
          'buttonLabel': "Update Info",
          'hasbackButton': true,
          'backButtonLabel': 'Cancel',
          'hasButton': true,
          'hasSubButton': false,
        };

        this.Form.enable();
        if (this.Form.get('markedPrimary').value == true) {
          this.Form.get('markedPrimary').disable();
          this.primaryDisabled = true;
        }
        this.disableInput = false;
        this.onlyImage = false;
        this.title = "Update Guardian Information";
        this.communicationService.unSavedForm.next(false);
      }
      else {
        this.Form.get('markedPrimary').setValue(true)
        this.Form.get('markedPrimary').disable()
        this.footerProps = {
          'buttonLabel': "Save Info",
          'hasButton': true,
          'hasSubButton': false,
          'hasClearButton': true,
          'clearButtonLabel': 'Clear',
        };
        this.onlyImage = false;
        this.title = "Guardian Information";
      }
    }
  }
  checkFormUrls(): void {
    if (this.type == "view") {

    }
  }
  beforeSubmit() {

    let form = this.Form.value;

    this.setValidations(form.guardianType);
    if (form.guardianType == "existing") {
      this.setValidations(form.guardianType)
      this.removeAddress(this.Form);
      this.Form.get('addressLabel').setErrors(null)
      this.Form.get('addressLabel').setValidators([])
      if (this.Form.get('guardianId').value) {
        this.Form.get('guardianId').setErrors(null)
      }
      this.submitObject = {
        guardianType: form.guardianType,
        childId: form.childId,
        guardianId: form.guardianId,
        guardianRelationId: form.guardianRelationId,
        markedPrimary: form.markedPrimary,
        branchId: form.branchId
      }
    }
    else if (form.guardianType == "new" && form.type == "other") {
      this.setValidations(form.guardianType)
      if (form.organizationName != null) {
        this.Form.get('organizationName').setErrors(null)
      }
      else {
        this.Form.get('organizationName').setValidators(Validators.required);
      }
      let relationId = this.relations.find(t => t.relationType === "Other")
      this.submitObject = {
        childId: form.childId,
        organizationName: form.organizationName,
        guardianType: form.guardianType,
        mobileNumber: form.mobileNumber,
        email: form.email,
        type: form.type,
        address: form.address,
        addressLabel: form.addressLabel,
        city: form.city,
        postalCode: form.postalCode,
        streetAddress: form.streetAddress,
        streetNumber: form.streetNumber,
        markedPrimary: form.markedPrimary,
        branchId: form.branchId,
        guardianRelationId: relationId.id,

      }
    }
    else {
      this.setValidations(form.guardianType)
      this.Form.get('guardianId').setValidators([])
      this.Form.get('guardianName').setValidators([])
      this.Form.removeControl('organizationName')
      this.submitObject = this.Form.value;
    }
  }
  onSubmit() {
    this.beforeSubmit();

    if (this.Form.invalid) {
      this.alertService.alertError('WARNING', 'Please fill the required data.');
      return;
    }
    else if (this.name && this.Form.value.name != this.name && this.id != "add" && this.Form.value.type != "type") {
      let heading = 'Confirmation';
      let message = 'Any changes to Guardian Name must be updated in the Invoicing Software. Are you sure you wish to Proceed?';
      let rightButton = 'Yes';
      let leftButton = 'No';
      this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then(result => {
        if (!result) {
          return;
        }
        else {
          this.setObject()
        }
      })
    }
    else {
      this.setObject()
    }

  }
  setObject() {
    let url = '';
    let type = '';
    if (this.Form.value.guardianType == "existing" && this.id == 'add') {
      url = config.base_url_slug + "add/link-guardian";
      type = 'post';
    }
    else if (this.Form.value.guardianType == "existing" && this.id != 'add') {
      if (!this.childUpdId) {
        url = config.base_url_slug + "add/link-child";
        type = 'post';
      }
      else {
        url = config.base_url_slug + "update/linked-child/" + this.childUpdId;
        type = 'patch';
      }
    }
    else if (this.id == 'add' || !this.Form.value.guardianId) {
      url = config.base_url_slug + "add/guardian";
      type = 'post';
    }
    else {
      url = config.base_url_slug + 'update/guardian/' + this.Form.value.guardianId;
      type = 'patch';
    }

    this.apiService[type](url, this.submitObject).then((res) => {
      console.log(res);
      if (res.code == 200 || res.code == 201 || res.code == 202) {
        this.alertService.alertSuccess('SUCCESS', res.message).then(result => {
          this.afterSuccessfullyAdd();
        });
      } else {
        this.alertService.alertError('ERROR', res.error.message)
      }
    })
      .catch(err => console.log(err));
  }

  getErrorMessage(field: any, form?): any {
    if (form) {
      return form.get(field) && form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getGuardianInfoFieldMsg[field];
    }
    return this.Form.get(field) && this.Form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getGuardianInfoFieldMsg[field];
  }

  // afterDetail(): void
  // {
  //   if (this.id != "add")
  //   {
  //     this.type = "edit"
  //     this.checkType()

  //   }
  // }

  afterSuccessfullyAdd(): void {
    this.emitFormData.emit({
      type: 'child',
      value: 100,
      key: 'guardianInfoId',
      submit: "success"
    });

    let data = {
      'number': 3,
      'url': 'medical',
      'prevForm': 'childGuardianDetails',
      'currentForm': 'childDoctorDetail',
      'isForm': true,
    }
    this.communicationService.setChild(data);
  }


  removeAddress(form) {
    form.get('address').setValue(null);
    form.get('postalCode').setValue(null);
    form.get('streetNumber').setValue(null);
    form.get('city').setValue(null);
    form.get('latitude').setValue(null);
    form.get('longitude').setValue(null);
    form.get('addressLabel').setValue(null);
    form.get('streetAddress').setValue(null);
    form.get('country').setValue(null);
    form.get('region').setValue(null);
  }

  cancelForm() {
    this.type = 'view';
    this.checkType();
  }

  clearForm() {
    this.childUpdId = null
    let isMarkedPrimary = this.Form.get('markedPrimary').value
    this.beforeClear();
    let heading = 'Confirmation';
    let message = 'Are you sure you want to cancel?';
    let rightButton = 'Yes';
    let leftButton = 'No';
    this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then(result => {
      if (!result) {
        return;
      }
      else {
        // this.Form.reset();
        // this.hidden = false
        // this.Form.get('guardianType').setValue("new")
        // this.Form.get('guardianName').enable()
        // this.Form.get('guardianName').setValue(null)
        // this.Form.get('guardianRelationId').setValue(null)
        // this.Form.get('guardianRelationId').enable();
        // if (isMarkedPrimary == true)
        // {
        //   this.Form.get('markedPrimary').setValue(true)
        // }
        // else
        // {
        //   this.Form.get('markedPrimary').setValue(false)
        // }
        window.history.back()
      }
    })

  }

  setDateFormat(form: FormGroup, realField, event: MatDatepickerInputEvent<Date>) {
    if (form.get('dateOfBirth').value == null || /^\s*$/.test(form.get('dateOfBirth').value)) {
      form.get('dateOfBirth').setValue(null);
    } else {
      form.get(realField).setValue(moment(new Date(event.value)).format(config.serverDateFormat));
    }
  }
  getRelation() {
    this.apiService.get(config.base_url_slug + 'view/guardianRelation').then(res => {
      console.log("childrensf", res);
      this.relations = res.data.listing;
      this.filteredRelations = [...this.relations];

    })
  }

  checkForType() {
    if (this.Form.get('type').value == 'other') {
      this.Form.get('relationLabel').setValidators(null);
      this.Form.get('relationLabel').updateValueAndValidity();
    } else {
      this.Form.get('relationLabel').setValidators(Validators.required);
      this.Form.get('relationLabel').updateValueAndValidity();
    }
  }

  setRelationValue() {
    let relation = this.relations.find(x => x.relationType == this.Form.get('relationLabel').value);
    this.Form.get('guardianRelationId').setValue(relation ? relation.id : null);
  }

  goToEdit() {
    // this.router.navigateByUrl(`/main/enrolment/${this.id}/edit`);
    this.type = 'edit';
    this.checkType();
  }

  setValidations(type: any) {
    if (type == 'existing') {
      this.Form.get('name').setErrors(null);
      this.Form.get('dateOfBirth').setErrors(null);
      this.Form.get('email').setErrors(null);
      this.Form.get('postalCode').setErrors(null);
      this.Form.get('address').setErrors(null);
      this.Form.get('streetNumber').setErrors(null);
      this.Form.get('city').setErrors(null);
      this.Form.get('mobileNumber').setErrors(null);
      this.Form.get('type').setErrors(null);
      this.Form.get('title').setErrors(null);
      this.Form.get('languageLabel').setErrors(null);
      this.Form.get('guardianId').setErrors({ required: true });
      this.Form.get('organizationName').setErrors(null);
      this.Form.get('organizationName').clearValidators();
      this.Form.get('organizationName').updateValueAndValidity();

    }
    else {
      // this.setFormFieldValidations(this.Form.value.type);
      this.Form.get('guardianId').setErrors(null);
      this.Form.get('guardianName').clearValidators();
      this.Form.get('guardianName').updateValueAndValidity();
    }
  }
  setFormFieldValidations(type: any) {

    if (type == 'other') {
      this.Form.get('name').setErrors(null);
      this.Form.get('dateOfBirth').setValidators([]);
      this.Form.get('guardianId').setErrors(null);
      this.Form.get('languageLabel').setErrors(null);
      this.Form.get('title').setErrors(null);
      this.Form.get('guardianRelationId').setErrors(null);
      // this.Form.get('organizationName').setValidators(Validators.required);

    }
    else {
      this.Form.get('organizationName').setErrors(null);
      this.Form.get('guardianId').setErrors(null);
    }
  }

  afterGuardians() {
    this.filteredGuardians = [...this.guardians];
    this.communicationService.unSavedForm.next(false);
  }

  dataToEdit(event) {
    this.hidden = true
    console.log("Event----", event);
    this.childUpdId = event.id
    this.name = event.name
    this.goToEdit();
    let GardianType = event.guardians.type == 'other' ? event.guardians.organizationName : event.name
    this.Form.patchValue(event)
    this.Form.patchValue(event.guardians)
    this.Form.get('guardianName').setValue(GardianType)

    // Setting relation manually for autocomplete
    let relationObj = this.relations.find(x => x.id == this.Form.get('guardianRelationId').value);
    this.Form.get('relationLabel').setValue(relationObj ? relationObj.relationType : null);
    // End

    this.disableType = true
    event.type == 'primary' ? this.Form.get('markedPrimary').setValue(true) : this.Form.get('markedPrimary').setValue(false)
    event.type == 'primary' ? this.Form.get('markedPrimary').disable() : this.Form.get('markedPrimary').enable()

    this.Form.get('guardianName').disable()
    this.Form.get('addressLabel').setValue(event.guardians.address)
    // this.Form.get('guardianRelationId').setValue(event.guardianRelationId)
    event.guardians.type == 'other' ? this.Form.get('guardianRelationId').disable() : this.Form.get('guardianRelationId').enable();
    
    // Set initial form on patch
    this.emptyForm = this.Form.value;

    // Check form states once after patch
    if (JSON.stringify(this.emptyForm) != JSON.stringify(this.Form.value))
    {
      this.communicationService.unSavedForm.next(true);
    } else {
      this.communicationService.unSavedForm.next(false);
    }
  }
  getCountList(count) {
    // marked primary on list of guardians condtion
    if (count == 0) {
      this.Form.get('markedPrimary').setValue(true);
      this.Form.get('markedPrimary').disable()
      this.primaryDisabled = true;
      this.isMultipleGuardian = false;
    }
    else {
      this.primaryDisabled = false;
      this.isMultipleGuardian = true;
      if (this.Form.get('markedPrimary').value == true) {
        this.Form.get('markedPrimary').enable()
        this.Form.get('markedPrimary').setValue(false);
      }

    }
    // else if(this.Form.get('guardianType').value != 'new' && count > 0)
    // {
    //   this.primaryDisabled = false
    // }
  }
  setGuardianId() {
    let guardian = this.guardians.find(x => x.name == this.Form.get('guardianName').value);

    //Clicking on any "Other" type of guardian will show the info message
    if (this.Form.get('markedPrimary').value == true && guardian.type == 'other' && !this.isMultipleGuardian) {
      this.Form.get('guardianName').setValue(null);
      this.Form.get('guardianId').setValue(null);
      this.Form.get('type').setValue(null);
      this.alertService.alertInfo("Info", "No Natural Person has been assigned to the Child. Please attach a Natural Person before assigning Guardian Type: Other");
      return;
    }
    // Clicking on any "Other" type of guardian will uncheck the primary guardian checkbox
    else if (this.Form.get('markedPrimary').value == true && guardian.type == 'other' && this.isMultipleGuardian) {
      this.Form.get('markedPrimary').setValue(false);
      this.Form.get('guardianName').setValue(guardian.name);
      this.Form.get('guardianId').setValue(guardian ? guardian.id : null);
      this.Form.get('type').setValue(guardian.type);

      let relationId = this.relations.find(t => t.relationType === "Other")
      this.Form.get('guardianRelationId').setValue(relationId.id);
      this.Form.get('relationLabel').setValidators(null);
      this.Form.get('relationLabel').updateValueAndValidity();
    }

    else if (guardian.type == 'other' && this.Form.get('markedPrimary').value == false) {
      this.Form.get('guardianName').setValue(guardian.name);
      this.Form.get('guardianId').setValue(guardian ? guardian.id : null);
      this.Form.get('type').setValue(guardian.type);

      let relationId = this.relations.find(t => t.relationType === "Other")
      this.Form.get('guardianRelationId').setValue(relationId.id);
      this.Form.get('relationLabel').setValidators(null);
      this.Form.get('relationLabel').updateValueAndValidity();
    }
    else if (guardian.type == 'guardian' && this.Form.get('markedPrimary').value == true) {
      this.Form.get('guardianName').setValue(guardian.name);
      this.Form.get('guardianId').setValue(guardian ? guardian.id : null);
      this.Form.get('type').setValue(guardian.type);
    }
    else {
      this.Form.get('guardianName').setValue(guardian.name);
      this.Form.get('guardianId').setValue(guardian ? guardian.id : null);
      this.Form.get('type').setValue(guardian.type);

      this.Form.get('relationLabel').setValidators(Validators.required);
      this.Form.get('relationLabel').updateValueAndValidity();
    }
  }
  setLanguageId(form) {
    let language = this.firstLanguages.find(x => x.language == this.Form.get('languageLabel').value);
    form.get('firstLanguageId').setValue(language ? language.id : null);
  }
  _allowSelection(option: string): { [className: string]: boolean } {
    return {
      'no-data-found-mat-autocomplete': option === 'No data',
    }
  }

  ngOnDestroy(): void {
    this.sub2.unsubscribe();
  }
}
