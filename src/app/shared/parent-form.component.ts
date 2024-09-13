import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlertService, ApiService, CommunicationService, PermissionService } from '../services';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { getFieldMsg } from './field-validation-messages';
import { AddressComponent } from 'src/app/core/address/address.component';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import * as moment from 'moment';
import { config } from 'src/config';
import { log } from 'console';


@Component({
  selector: 'app-parent-form',
  template: ``
})
export class ParentFormComponent implements OnInit, OnDestroy
{
  @Output() back = new EventEmitter<string>();
  @Output() emitFormData = new EventEmitter<any>();
  @Input() parentId: any = -1;
  @Input() childId: any = -1;

  formDetailApi: any = '';

  currentDate = new Date();
  Form: FormGroup;
  sub: Subscription;
  sub2: Subscription;
  formApi: string;
  id: any;
  detailApi: string;
  formDetail: any;
  otherForm: any;
  formValueChanged: any;
  type: any;
  title: any;
  onlyImage: boolean = false;
  hasFile: boolean = false;
  branches: any[] = [];
  rooms: any[] = [];
  species: any[] = [];
  minDate: Date;
  sdnUser: any;
  responseData: any;
  isMultiple: any = false;
  footerProps: any
  disableInput = false;
  // parentId: any;
  formNo: any;
  route: any;
  showSuccess = true;
  location: String = "assets/images/sdn/location.svg"
  clock: String = "assets/images/sdn/clock.svg"
  calendar: String = "assets/images/sdn/calendar.svg"
  isParentForm = false;
  addressRequire = true;

  nationalities: any[] = [];
  religions: any[] = [];
  ethnicOrigins: any[] = [];
  firstLanguages: any[] = [];
  guardians: any[] = []

  emptyForm: any;
  isUpdate = false;
  beforeSubmitReturn = false;
  noFormCheck = false;
  childrens: any[] = []


  // @HostListener('window:popstate', ['$event'])
  // KeyUp(event: KeyboardEvent) {
  //   this.checkBrowserBack();
  // }


  constructor(protected router: Router,
    protected _route: ActivatedRoute,
    protected alertService: AlertService,
    protected apiService: ApiService,
    protected formbuilder: FormBuilder,
    protected dialog: MatDialog,
    protected communicationService: CommunicationService,
    protected permissionsService?: PermissionService)
  {
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 74, 0, 1);

    this.Form = this.formbuilder.group({});

    this.sdnUser = JSON.parse(localStorage.getItem('sdnUser'));
  }

  ngOnInit()
  {
    this.setDropDownValues();
    this.sub = this._route.params.subscribe(params =>
    {
      this.id = params['id'];
      this.type = params['type'];

      if (this.type == 'view' || this.type == 'edit')
      {
        this.parentId = this.id;
      }
      // else if(this.type == 'edit')
      // {
      //     this.parentId = this.id;
      //     this.Form.valueChanges.subscribe((val)=> {
      // 		if (JSON.stringify(this.emptyForm) != JSON.stringify(this.Form.value))
      //         {
      // 		   this.communicationService.unSavedForm.next(true);
      // 		}
      // 	});
      // }

      // else
      // {
        if (!this.noFormCheck)
        {
          this.sub2 = this.Form.valueChanges.subscribe((val) =>
          {
            if (JSON.stringify(this.emptyForm) != JSON.stringify(this.Form.value))
            {
              this.communicationService.unSavedForm.next(true);
            }
          });
        }
      // }

      this.checkFormUrls();
      this.checkType();
    });
    this.emptyForm = this.Form.value; console.log('ggggg');

  }

  // checkBrowserBack() {
  //     if (JSON.stringify(this.emptyForm) != JSON.stringify(this.Form.value)) {
  //         this.alertService.alertAsk('sd', 'sds', 'r', 'f', false).then((val)=> {
  //             if (val) {
  //                 history.back();
  //             } else {
  //               history.pushState(null, null, window.location.pathname);
  //             }
  //         });
  //     }
  // }

  checkFormUrls(): void
  {

  }

  setDropDownValues()
  {
    if (localStorage.getItem('predefinedValues'))
    {
      let dropDownValues = JSON.parse(localStorage.getItem('predefinedValues'));
      this.ethnicOrigins = dropDownValues.predefinedEthinicOrigin;
      this.firstLanguages = dropDownValues.predefinedLanguages;
      this.nationalities = dropDownValues.predefinedNationalities;
      this.religions = dropDownValues.predefinedReligions;
    }
  }

  getField(field: any, form?: any): any
  {
    if (form)
    {
      return form.hasError('whitespace') ? true : form.get(field).invalid;
    }
    return this.Form.hasError('whitespace') ? true : this.Form.get(field).invalid;
  }

  getErrorMessage(field: any): any
  {
    return getFieldMsg[field];
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
          'buttonLabel': "Update Info",
          'hasButton': true,
          'hasSubButton': false,
          'hasClearButton': true,
          'clearButtonLabel': 'Clear',

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
    }
  }

  onLocationBack(): void
  {
    window.history.back();
  }

  goBack()
  {
    if (this.type == 'new')
    {
      this.back.emit();
    } else
    {
      this.type = 'view';
      this.checkType();
    }
  }

  onSubmit(redirectUrl = '', isPatch = false): void
  {
    this.beforeSubmit();

    if (this.beforeSubmitReturn) return;

    if (this.Form.invalid)
    {
      this.alertService.alertError('WARNING', 'Please fill the required data.');
      return;
    }

    if (isPatch)
    {
      let formData = this.Form.value;
      this.onSubmitCall(formData, "patch", redirectUrl);
      return;
    }

    if (this.type == "view")
    {

    }
    else
    {
      let formData = this.Form.value;
      if (this.formValueChanged)
      {
        formData = this.otherForm;
      }

      if (this.Form.value.hasOwnProperty('dateOfBirth'))
      {
        if (this.Form.value.hasOwnProperty('matDateOfBirth'))
        {
          formData['dateOfBirth'] = moment(this.Form.get('matDateOfBirth').value).format(config.serverDateFormat);
        }
      }

      if (this.type == 'edit')
      {
        if (this.isParentForm)
        {
          if (this.parentId != -1)
          {
            this.onSubmitCall(formData, "patch", redirectUrl);
          } else
          {
            this.onSubmitCall(formData, "post", redirectUrl);
          }
        } else
        {
          if (this.parentId != -1)
          {
            if (this.childId != -1)
            {
              this.onSubmitCall(formData, "patch", redirectUrl);
            }
            else
            {
              this.onSubmitCall(formData, "post", redirectUrl);
            }
          }
          else
          {
            this.onSubmitCall(formData, "post", redirectUrl);
          }
        }
      }
      else
      {
        if (this.isParentForm)
        {
          if (this.parentId != -1)
          {
            this.onSubmitCall(formData, "patch", redirectUrl);
          } else
          {
            this.onSubmitCall(formData, "post", redirectUrl);
          }
        } else
        {
          if (this.parentId != -1)
          {
            if (this.childId != -1)
            {
              this.onSubmitCall(formData, "patch", redirectUrl);
            }
            else
            {
              this.onSubmitCall(formData, "post", redirectUrl);
            }
          }
          else
          {
            this.onSubmitCall(formData, "post", redirectUrl);
          }
        }
      }
    }
  }

  onSubmitCall(formData, callType, url = '')
  {
    if (callType == "patch")
    {
      //patch
      this.apiService.patch(this.formApi, formData, this.hasFile).then(response =>
      {
        if (response.code == 201 || response.code == 200)
        {
          this.responseData = response.data
          this.communicationService.unSavedForm.next(false);

          if (this.showSuccess)
          {
            this.alertService.alertSuccess(response.status, response.message).then(result =>
            {
              console.log(this.isMultiple);
              console.log(url, 'URL');

              if (url)
              {
                console.log(url, 'URL');
                this.router.navigate([url]);
              } else
              {
                console.log(url, 'BACK');
                if (!this.isMultiple)
                {
                  this.onLocationBack();
                }
              }
            });
          }
          this.afterSuccessfullyAdd();
        }
        else
        {
          this.alertService.alertError(response.status, response.message);
        }
      })
    }
    else
    {
      //post
      this.apiService.post(this.formApi, formData, this.hasFile).then(response =>
      {
        if (response.code == 201 || response.code == 200)
        {
          this.responseData = response.data
          this.communicationService.unSavedForm.next(false);

          if (this.showSuccess)
          {
            this.alertService.alertSuccess(response.status, response.message).then(result =>
            {
              if (url)
              {
                this.router.navigate([url]);
              } else
              {
                if (!this.isMultiple)
                {
                  this.onLocationBack();
                }
              }
            });
          }
          this.afterSuccessfullyAdd();
        }
        else
        {
          this.alertService.alertError(response.status, response.message);
        }
      })
    }
  }

  beforeSubmit()
  {
  }

  afterSuccessfullyAdd(): void
  {
  }

  getDetail(method?): void
  {
    let type = 'get'
    if (method)
    {
      type = method
    }
    this.apiService[type](this.detailApi).then(result =>
    {
      if (result.code === 200 && result.data)
      {
        this.formDetail = result.data;
        this.Form.patchValue(this.formDetail);
        this.afterDetail();
      }
      else if (result.code == 202)
      {
        this.afterDetail();
      }
      else
      {
        this.formDetail = {};
        this.alertService.alertError(result.status, result.message);
      }
    });
  }

  afterDetail(): void
  {

  }

  getImage(item): any
  {
    if (this.formDetail)
    {
      let file = this.formDetail[item];
      if (file)
        return file;
      else
        return '';
    }
    else
    {
      return '';
    }
  }

  onFileSelect(event)
  {
    if (event.valid)
    {
      this.Form.get(event.controlName).setValue(event.file);
    }
    else
    {
      this.Form.get(event.controlName).setValue(event.file);
      this.alertService.alertError('Image', 'Selected file is not valid.');
    }
  }

  onDeleteFile(event): void
  {
    this.Form.get(event.controlName).setValue(null);
  }

  returnFirstWord(title)
  {
    var val;
    val = title.substr(0, title.indexOf(" "));
    if (val == "edit")
    {
      return "Update";
    }
    else
    {
      return val;
    }
  }

  genericHeadingProps(label, textClass, margin)
  {
    var props;
    props = {
      headingLabel: label,
      hasButton: false,
      hasHeading: true,
      hasRightLabel: false,
      showBack: false,
      labelMargin: '10px',
      textclass: textClass,
      margin: margin
    }
    return props;
  }

  getBranches(newUrl?: any): any
  {
    let data = [];
    let url = config.base_url_slug + 'view/branches?sortBy=name&sortOrder=DESC&attributes=[{"key": "status","value": "1" }]';
    if (newUrl)
    {
      url = url + newUrl;
    }
    this.apiService.get(url).then(res =>
    {
      if (res.code == 200)
      {
        res.data.listing.forEach(element =>
        {
          let dict = {
            key: 'branchId',
            value: element.id,
            label: element.name,
            isHeadOffice: element.isHeadOffice
          }
          data.push(dict);
        });

        this.branches = data;

        this.afterBranchResponse();
      }
      else
      {
        this.branches = [];
      }
    });
  }

  getRooms(branchId: any): any
  {
    let data = [];
    let url = config.base_url_slug + 'view/rooms?sortBy=name&sortOrder=DESC&attributes=[{"key": "branchId","value": "' + branchId + '" }]';
    this.apiService.get(url).then(res =>
    {
      if (res.code == 200)
      {
        res.data.listing.forEach(element =>
        {
          let dict = {
            key: 'branchId',
            value: element.id,
            label: element.name,
          }
          data.push(dict);
        });

        this.rooms = data;
        this.afterRoom();
      }
      else
      {
        this.rooms = [];
      }
    });
  }

  getRoomsforDropdown(branchId: any): any
  {
    let data = [];
    let url = config.base_url_slug + 'view/rooms?sortBy=name&sortOrder=DESC&fetchType=dropdown&attributes=[{"key": "branchId","value": "' + branchId + '" }]';
    console.log(branchId, url);
    this.apiService.get(url).then(res =>
    {
      if (res.code == 200)
      {
        res.data.forEach(element =>
        {
          // console.log("element====>", element)
          let dict = {
            key: 'branchId',
            value: element.id,
            label: element.name,
            totalCapacity: element.totalCapacity
          }
          data.push(dict);
        });

        this.rooms = data;
        this.afterRoom();
      }
      else
      {
        this.rooms = [];
      }
    });
  }

  getGuardians(id: any)
  {
    let branchId = localStorage.getItem('branchId');
    let attributes = 'attributes=[{ "key": "branchId", "value": ' + branchId + ' }]'
    let url = config.base_url_slug + 'view/guardians?' + attributes + '&childId=' + id;
    this.apiService.get(url).then(response =>
    {
      this.guardians = response.data.listing;
      this.guardians.forEach(element =>
      {
        element.name = element.name ? element.name : element.organizationName
      });
      this.afterGuardians()
    })
  }

  getChildrens(branchId: any)
  {
    let attributes = '?attributes=[{"key": "branchId","value":' + branchId + '}]&perPage=1000';
    this.apiService.get(config.base_url_slug + 'v4/view/childs' + attributes).then(res =>
    {
      this.childrens = res.data.listing;
      this.childrens.forEach(element =>
        {
          element.name = element.firstName + " " + element.lastName
        });
        this.afterChildrens()
    })
  }

  openAddressDialog(Form)
  {
    let dialogRef = this.dialog.open(AddressComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      width: '50%'
    });

    dialogRef.componentInstance.data = Form.value;
    dialogRef.componentInstance.addressRequire = this.addressRequire;

    dialogRef.afterClosed().subscribe(result =>
    {
      if (result)
      {
        console.log(result);

        Form.patchValue(result);
      }

    })
  }

  clearForm()
  {
    this.beforeClear();
    this.Form.reset();

  }

  beforeClear()
  {

  }

  dateChange(form, controlName, event: MatDatepickerInputEvent<Date>)
  {
    form.get(controlName).setValue(event.value.getTime() / 1000);
  }

  // YYYY-MM-DD
  dateChangeStatic(Form, controlName, event: MatDatepickerInputEvent<Date>)
  {
    const formattedDate = moment(new Date(event.value)).format(config.serverDateFormat);
    Form.get(controlName).setValue(formattedDate);
  }

  public findInvalidControls(form)
  {
    const invalid = [];
    const controls = form.controls;
    for (const name in controls)
    {
      if (controls[name].invalid)
      {
        invalid.push(name);
      }
    }
    return invalid;
  }

  setDateFormat(form: FormGroup, realField, event: MatDatepickerInputEvent<Date>)
  {
    form.get(realField).setValue(moment(new Date(event.value)).format(config.serverDateFormat));
  }

  replaceDate(form: FormGroup, realField, tempField)
  {
    let date = form.get(tempField).value;
    form.get(realField).setValue(moment(new Date(date)).format(config.serverDateFormat));
  }

  ngOnDestroy(): void {
    // this.sub2.unsubscribe();
  }

  afterRoom() { }

  afterBranchResponse() { }
  afterGuardians() { }
  afterChildrens(){}
}

