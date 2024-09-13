import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { map, startWith } from 'rxjs/operators';
import { AlertService, ApiService, AutocompleteFiltersService, CommunicationService, PermissionService, UtilsService } from 'src/app/services';
import { getParentFieldMsg } from 'src/app/shared/field-validation-messages';
import { ParentFormComponent } from 'src/app/shared/parent-form.component';
import { config } from 'src/config';
import { ChildLinkModalComponent } from './child-link-modal/child-link-modal.component';

@Component({
  selector: 'app-add-guardian',
  templateUrl: './add-guardian.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class AddGuardianComponent extends ParentFormComponent implements OnInit, OnDestroy
{

  relationShip: any[] = [
    { key: 'guardian', value: 'Parent/Guardian' }, { key: 'other', value: 'Other' }]
  titles: any[] = ['Mr', 'Mrs']
  location: String = "assets/images/sdn/location.svg"
  clock: String = "assets/images/sdn/clock.svg"
  disableInput = false;
  submitObject: {};
  title = "";
  type: any;
  disabled = false;
  showSpinners = false;
  editPermit: any;
  disabledOnAdd: boolean = false;
  showInvoiceCheckbox: boolean = false;
  filteredLanguages: any[];
  name: any;
  calendar: String = "assets/images/sdn/ic_event_24px.svg"

  constructor(protected router: Router,
    protected _route: ActivatedRoute,
    protected alertService: AlertService,
    protected apiService: ApiService,
    protected formbuilder: FormBuilder,
    protected dialog: MatDialog,
    protected util: UtilsService,
    protected filterService: AutocompleteFiltersService,
    protected communicationService: CommunicationService,
    protected permissionsService: PermissionService)
  {

    super(router, _route, alertService, apiService, formbuilder, dialog, communicationService, permissionsService);

    this.Form.addControl('postalCode', new FormControl(null, [Validators.required]));
    this.Form.addControl('address', new FormControl(null, [Validators.required]));
    this.Form.addControl('streetNumber', new FormControl(null, [Validators.required]));
    this.Form.addControl('city', new FormControl(null, [Validators.required]));
    this.Form.addControl('latitude', new FormControl(null));
    this.Form.addControl('longitude', new FormControl(null));
    this.Form.addControl('addressLabel', new FormControl(null));
    this.Form.addControl('streetAddress', new FormControl(null));

    this.Form.addControl('type', new FormControl(null, [Validators.required]));
    this.Form.addControl('title', new FormControl(null, [Validators.required]));
    this.Form.addControl('branchId', new FormControl(null, Validators.required));

    this.Form.addControl('dateOfBirth', new FormControl(null));
    this.Form.addControl('languageLabel', new FormControl(null));
    this.Form.addControl('firstLanguageId', new FormControl(null));
    this.Form.addControl('nationalInsuranceNumber', new FormControl(null, [Validators.pattern('^[a-zA-Z]{2}[0-9]{6}[a-zA-Z]{1}$'), this.util.trimWhitespaceValidator]));
    this.Form.addControl('homeLandLineNumber', new FormControl(null, [Validators.min(0), Validators.minLength(8), Validators.maxLength(11), Validators.pattern("^-?[0-9]\\d*(\\.\\d{1,2})?$"), this.util.trimWhitespaceValidator]));
    this.Form.addControl('workTelephoneNumber', new FormControl(null, [Validators.min(0), Validators.minLength(8), Validators.maxLength(11), Validators.pattern("^-?[0-9]\\d*(\\.\\d{1,2})?$"), this.util.trimWhitespaceValidator]));
    this.Form.addControl('generateSeperateInvoice', new FormControl(false));

    this.Form.addControl('mobileNumber', new FormControl(null, [Validators.required, Validators.min(0), Validators.minLength(8), Validators.maxLength(11), Validators.pattern("^-?[0-9]\\d*(\\.\\d{1,2})?$"), this.util.trimWhitespaceValidator]));

    this.Form.addControl('name', new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(36), this.util.trimWhitespaceValidator]));
    this.Form.addControl('email', new FormControl(null, [Validators.required, Validators.email, this.util.trimWhitespaceValidator]));
    // Relation type Other than oraganization name required
    this.Form.addControl('organizationName', new FormControl(null, Validators.required));

    this.noFormCheck = true; // do not check for form changes in parent-component.ts

    // Set initial form on add
    this.emptyForm = this.Form.value;
    // booking may be change later for guardian
    this.editPermit = permissionsService.getPermissionsBySubModuleName('Child Management', 'Booking Manager').update
  }

  ngOnInit(): void
  {
    this.title = "Parent/Guardian"
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
        this.formApi = config.base_url_slug + "add/guardian";
        this.disabledOnAdd = true;
        // this.Form.get('generateSeperateInvoice').setValue(true);
      }
      else
      {
        this.formApi = config.base_url_slug + 'update/guardian/' + this.id;

        let branchId = localStorage.getItem('branchId');
        let attributes = 'attributes=[{"key": "branchId","value":' + branchId + '}, {"key":"guardianId","value": ' + this.id + ' }]';
        this.detailApi = config.base_url_slug + 'view/guardian?' + attributes;
        this.disabledOnAdd = false;
        this.getDetail();
      }

    });
    this.Form.controls['type'].valueChanges.subscribe(value =>
    {
      this.setValidations(value);
    })
    this.Form.controls['branchId'].setValue(localStorage.getItem('branchId'));

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

    super.ngOnInit();
    this.filteredLanguages = [...this.firstLanguages];


    let language = this.Form.controls.languageLabel.valueChanges.pipe(
      startWith(''),
      map(value => this.filterService._filterLanguage(value, [...this.firstLanguages]))
    );

    // language.subscribe((d) => this.Form.controls.filteredLanguage.setValue(d));
    language.subscribe((d) => this.filteredLanguages = d);

    // End

  }


  checkFormUrls()
  {
    this.title = "Parent/Guardian"
  }

  getErrorMessage(field: any, form?): any
	{
		if (form) {
			return form.get(field) && form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getParentFieldMsg[field];
		}
		return this.Form.get(field) && this.Form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getParentFieldMsg[field];
	}

  changeRoute()
  {
    var url = '/main/branch/' + this.id + '/edit';
    this.router.navigateByUrl(url);
  }

  removeAddress()
  {
    this.Form.get('address').setValue(null);
    this.Form.get('addressLabel').setValue(null);
    this.Form.get('postalCode').setValue(null);
    this.Form.get('streetNumber').setValue(null);
    this.Form.get('city').setValue(null);
    this.Form.get('latitude').setValue(null);
    this.Form.get('longitude').setValue(null);
    this.Form.get('streetAddress').setValue(null);
    this.Form.get('country').setValue(null);
  }

  onAccountTypeChange(value)
  {
    if (value === "other")
    {
      this.Form.get('title').disable()
      this.Form.get('dateOfBirth').disable()
      this.Form.get('languageLabel').disable()
      this.Form.get('firstLanguageId').disable()
      this.Form.get('nationalInsuranceNumber').disable()
      this.Form.get('homelandLineNumber').disable()
      this.Form.get('workTelephoneNumber').disable()
      this.Form.get('generateSeperateInvoice').disable()
      this.Form.get('name').disable()
      this.Form.get('organizationName').enable()
    } else
    {
      this.Form.get('title').enable()
      this.Form.get('dateOfBirth').enable()
      this.Form.get('languageLabel').enable()
      this.Form.get('firstLanguageId').enable()
      this.Form.get('nationalInsuranceNumber').enable()
      this.Form.get('homelandLineNumber').enable()
      this.Form.get('workTelephoneNumber').enable()
      this.Form.get('generateSeperateInvoice').enable()
      this.Form.get('name').enable()
      this.Form.get('organizationName').disable()
    }

  }

  afterDetail(): void
  {

    let formDetail = this.formDetail.listing[0];
    this.name = formDetail.name;
    this.Form.patchValue(formDetail);
    this.name = formDetail.type === 'other' ? formDetail.organizationName : formDetail.name;

    this.Form.get('addressLabel').setValue(formDetail.address);
    let languageObj = this.firstLanguages.find(x => x.id == formDetail.firstLanguageId);
    this.Form['controls'].languageLabel.setValue(languageObj ? languageObj.language : null);

    // Set initial form on patch
    this.emptyForm = this.Form.value;

    // Check form states once after patch
    if (JSON.stringify(this.emptyForm) != JSON.stringify(this.Form.value))
    {
      this.communicationService.unSavedForm.next(true);
    } else {
      this.communicationService.unSavedForm.next(false);
    }

    console.log("formDetail--------", formDetail);
  }

  beforeSubmit()
  {
    this.isMultiple = false;
    // let form = this.Form.value;
    // if (form.type == "other")
    // {
    //   this.submitObject = {
    //     organizationName: form.organizationName,
    //     mobileNumber: form.mobileNumber,
    //     email: form.email,
    //     type: form.type,
    //     address: form.address,
    //     addressLabel: form.addressLabel,
    //     city: form.city,
    //     postalCode: form.postalCode,
    //     streetAddress: form.streetAddress,
    //     streetNumber: form.streetNumber,
    //     branchId: form.branchId
    //   }
    // }
  }

  beforeClear()
  {

  }

  checkType()
  {
    if (this.type != "")
    {
      if (this.type === 'view')
      {
        // this.title = "View " + this.title;

        this.title = "View Parent/Guardian"
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
          'buttonLabel': "Update Info",
          'hasbackButton': true,
          'hasClearForm': true,
          'backButtonLabel': 'Clear',
          'hasButton': true,
          'hasSubButton': false,

        };
        // this.footerProps = {
        //   'buttonLabel': "Save",
        //   'hasbackButton': true,
        //   'backButtonLabel': 'Cancel',
        //   'hasButton': true,
        //   'hasSubButton': false,

        // };
        this.Form.enable();
        this.setValidations(this.Form.get('type').value)

        this.disableInput = false;
        this.onlyImage = false;
        this.title = "Update Parent/Guardian";
        this.Form.get('type').disable();
        this.communicationService.unSavedForm.next(false);
      }
      else
      {
        this.footerProps = {
          'buttonLabel': "Save Info",
          'hasbackButton': true,
          'hasClearForm': true,
          'backButtonLabel': 'Clear',
          'hasButton': true,
          'hasSubButton': false,
        };
        this.onlyImage = false;
        // this.title = "Add New " + this.title;
        this.title = "Parent/Guardian";
      }
    }
  }

  onSubmit()
  {
    this.beforeSubmit();

    if (this.Form.invalid)
    {
      this.alertService.alertError('WARNING', 'Please fill the required data.');
      return;
    }
    else
    {
      // if (this.name && this.name != this.Form.value.name && this.id != "add")
      // {
      //   let heading = 'Confirmation';
      //   let message = 'Any changes to Guardian Name must be updated in the Invoicing Software. Are you sure you wish to Proceed?';
      //   let rightButton = 'Yes';
      //   let leftButton = 'No';
      //   this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then(result =>
      //   {
      //     if (!result)
      //     {
      //       return;
      //     }
      //     else
      //     {
      //       this.setObject()
      //     }
      //   })
      // }
      // else
      // {
      //   this.setObject()
      // }
      this.setObject()
    }
  }
  setObject()
  {
    let url = '';
    let type = '';
    if (this.id == 'add')
    {
      url = config.base_url_slug + "add/guardian";
      type = 'post';
      this.submit(type);
    }
    else
    {
      url = config.base_url_slug + 'update/guardian/' + this.id;
      type = 'patch';
      this.Form.get('type').enable();

      if (type == 'patch' && (this.Form.value.type === 'other' ? this.Form.value.organizationName != this.name : this.Form.value.name != this.name))
      {
        let heading = 'Confirmation';
        let message = 'Any changes to Guardian Name must be updated in the Invoicing Software. Are you sure you wish to Proceed?';
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
            this.submit(type);
          }
        })
      }
      else
      {
        this.submit(type);
      }
    }


  }

  submit(type: any)
  {

    this.apiService[type](this.formApi, this.Form.value).then((res) =>
    {
      if (this.type === "patch")
      {
        this.Form.get('type').disable()
      }

      console.log(res);
      if (res.code == 200 || res.code == 201 || res.code == 202)
      {
        this.alertService.alertSuccess('SUCCESS', res.message).then(result =>
        {
          this.communicationService.unSavedForm.next(false);
          window.history.back();
          // this.afterSuccessfullyAdd();
        });
      } else
      {
        this.alertService.alertError('ERROR', res.error.message)
      }
    })
      .catch(err => console.log(err));
  }

  afterSuccessfullyAdd(): void
  {
    if (this.type == "edit")
    {
      // update local storage
    }
    this.router.navigateByUrl('main/guardian');
  }

  clearForm()
  {
    this.beforeClear();
    let heading = 'Confirmation';
    let message = 'Are you sure you want to clear?';
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
        this.Form.reset();
        this.Form.enable();
        // window.history.back()
      }
    })

  }

  goToEdit()
  {
    this.type = 'edit';
    this.checkType();
  }
  setValidations(type: any)
  {
    if (type == 'other')
    {
      this.Form.get('title').setErrors(null);
      this.Form.get('name').setErrors(null);
      this.Form.get('dateOfBirth').setValidators([]);
      this.Form.get('mobileNumber').setValidators([]);
    }
    else
    {
      this.Form.get('organizationName').setErrors(null);
    }
  }

  linkChildToGuardian()
  {
    let dialogRef = this.dialog.open(ChildLinkModalComponent, { width: '600px', autoFocus: false });
    dialogRef.componentInstance.parentId = this.id;
    dialogRef.componentInstance.formType = 'add';
    dialogRef.componentInstance.relationType = this.formDetail.listing[0].type;
    // dialogRef.afterClosed().subscribe(() =>
    // {
    //   this.getDetail();
    // })

  }
  setLanguageId(form)
  {
    // let language = this.firstLanguages.find(x => x.language == form.get('languageLabel').value);
    // form.get('firstLanguageId').setValue(language ? language.id : null);

    let language = this.firstLanguages.find(x => x.language == this.Form.get('languageLabel').value);
    form.get('firstLanguageId').setValue(language ? language.id : null);
  }

  countForInvoice(count)
  {
    console.log("Count for invoice", count);
    if (count > 1)
    {
      this.showInvoiceCheckbox = true;
    }
  }

  ngOnDestroy(): void {
    this.sub2.unsubscribe();
  }

}
