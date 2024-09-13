import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlertService, ApiService, PermissionService } from '../services';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { getFieldMsg } from './field-validation-messages';
import { AddressComponent } from 'src/app/core/address/address.component';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import * as moment from 'moment';
import { config } from 'src/config';


@Component({
    selector: 'app-global-form',
    template: ``
})
export class GlobalFormComponent implements OnInit
{
    @Output() back = new EventEmitter<string>();
    @Output() emitFormData = new EventEmitter<any>();
    @Input() parentId: any = -1;
    @Input() childId: any = -1;

    formDetailApi: any = '';

    currentDate = new Date();
    Form: FormGroup;
    sub: Subscription;
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
    // calendar: String = "assets/images/sdn/calendar.svg"
    calendar: String = "assets/images/sdn/ic_event_24px.svg"
    isParentForm = false;
    editPermit: any;

    constructor(protected router: Router,
        protected _route: ActivatedRoute,
        protected alertService: AlertService,
        protected apiService: ApiService,
        protected formbuilder: FormBuilder,
        protected dialog: MatDialog,
        protected permissionsService?: PermissionService)
    {
        const currentYear = new Date().getFullYear();
        this.minDate = new Date(currentYear - 74, 0, 1);

        this.Form = this.formbuilder.group({});

        this.sdnUser = JSON.parse(localStorage.getItem('sdnUser'));
    }

    ngOnInit()
    {
        this.sub = this._route.params.subscribe(params =>
        {
            this.id = params['id'];
            this.type = params['type'];

            if (this.type == 'view' || this.type == 'edit')
            {
                this.parentId = this.id;
            }

            this.checkFormUrls();
            this.checkType();
        });
    }

    checkFormUrls(): void
    {

    }

    getField(field: any, form?: any): any
    {
        if (form)
        {
            return form.get(field).invalid;
        }
        return this.Form.get(field).invalid;
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
        if (this.type == 'new') {
            this.back.emit();
        } else {
            this.type = 'view';
            this.checkType();
        }
    }

    onSubmit(): void
    {
        this.beforeSubmit();
console.log("Final Form ----",this.Form.value);

        if (this.Form.invalid)
        {
            this.alertService.alertError('WARNING', 'Please fill the required data.');
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

                this.onSubmitCall(formData, "patch");

            }
            else
            {
                if (this.isParentForm)
                {
                    if (this.parentId != -1)
                    {
                        this.onSubmitCall(formData, "patch");
                    } else
                    {
                        this.onSubmitCall(formData, "post");
                    }
                } else
                {
                    if (this.parentId != -1)
                    {
                        if (this.childId != -1)
                        {
                            this.onSubmitCall(formData, "patch");
                        }
                        else
                        {
                            this.onSubmitCall(formData, "post");
                        }
                    }
                    else
                    {
                        this.onSubmitCall(formData, "post");
                    }
                }
            }
        }
    }

    onSubmitCall(formData, callType)
    {
        if (callType == "patch")
        {
            //patch
            this.apiService.patch(this.formApi, formData, this.hasFile).then(response =>
            {
                if (response.code == 201 || response.code == 200)
                {
                    this.responseData = response.data
                    if (this.showSuccess)
                    {
                        this.alertService.alertSuccess(response.status, response.message).then(result =>
                        {
                            if (!this.isMultiple)
                            {
                                this.onLocationBack();
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
                    if (this.showSuccess)
                    {
                        this.alertService.alertSuccess(response.status, response.message).then(result =>
                        {
                            console.log("multi ", this.isMultiple);
                            if (!this.isMultiple)
                            {
                                console.log("multi ", this.isMultiple);

                                this.onLocationBack();
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

    getDetail(): void
    {
        this.apiService.get(this.detailApi).then(result =>
        {
            if (result.code === 200 && result.data)
            {
                this.formDetail = result.data;
                this.Form.patchValue(this.formDetail);
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
                    }
                    data.push(dict);
                });

                this.branches = data;
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
                        ageLabel: element.label ? element.label : null,
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

    openAddressDialog(Form)
    {
        let dialogRef = this.dialog.open(AddressComponent, {
            autoFocus: false,
            maxHeight: '90vh',
            width: '50%'
        });

        dialogRef.componentInstance.data = Form.value;

        dialogRef.afterClosed().subscribe(result =>
        {
            if (result)
            {
                Form.patchValue(result);
            }

        })
    }

    clearForm()
    {
        this.beforeClear();
        this.Form.reset()
    }

    beforeClear()
    { }

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

    afterRoom() { }

    goToEdit() {
		// this.router.navigateByUrl(`/main/enrolment/${this.id}/edit`);
		this.type = 'edit';
		this.checkType();
	}
}

