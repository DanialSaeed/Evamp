import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, CommunicationService } from 'src/app/services'
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { config } from 'src/config';
import { ParentFormComponent } from 'src/app/shared/parent-form.component';
@Component({
  selector: 'app-enrolment',
  templateUrl: './enrolment.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class EnrolmentComponent extends ParentFormComponent implements OnInit
{
  formNo = 1;
  route: any;
  parentId: any;
  formDetail: any;
  id: any;

  guardianInfoId = -1;
  medicalInfoId = -1;
  emergencyDetailId = -1;
  fundingId = -1;
  roomManagementId = -1;
  private subscription: Subscription
  isUnsavedForm = false;
  isResponseSaved = false;

  constructor(protected router: Router,
    protected _route: ActivatedRoute,
    protected alertService: AlertService,
    protected apiService: ApiService,
    protected formbuilder: FormBuilder,
    protected dialog: MatDialog,
    protected communicationService: CommunicationService)
  {

    super(router, _route, alertService, apiService, formbuilder, dialog, communicationService);
    this.subscription = this.communicationService.getChild().subscribe(data =>
    {
      // here fetch data from the session storage
      this.route = this._route;
      this.onFormClick(data['number']);
    })
  }

  ngOnInit(): void
  {

    // this.parentId = localStorage.getItem('child-id')
    this.route = this._route
    let sub = this._route.params.subscribe(params =>
    {
      this.id = params['id'];
      this.type = params['type'];
      if (this.type == 'view' || this.type == 'edit')
      {
        this.parentId = this.id;

        this.detailApi = config.base_url_slug + 'view/child/' + this.id;
        this.getDetail();
      } else
      {

        this.communicationService.unSavedForm.subscribe((val) =>
        {
          if (val)
          {
            this.isUnsavedForm = true;
          } else
          {
            this.isUnsavedForm = false;
          }
        })
      }
    });
    super.ngOnInit();
  }

  getId(childId)
  {
    this.parentId = childId;
    console.log("my get id is =", this.parentId);
  }


  onFormClick(number)
  {
    if (!this.isResponseSaved && this.type != 'new') return;

    if (number == this.formNo || this.parentId == -1) return;

    if (this.isUnsavedForm)
    {

      let heading = 'Confirmation';
      let message = 'You have unsaved changes, are you sure you want to leave ?';
      let leftButton = 'Cancel';
      let rightButton = 'Leave';
      this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then((val) =>
      {
        if (val)
        {
          if (number > 1 && this.parentId == -1)
          {
            return;
          }

          this.formNo = number;
          this.communicationService.unSavedForm.next(false);
        }
      })
    } else
    {
      if (number > 1 && this.parentId == -1)
      {
        return;
      }

      // if(this.id == 'add')
      // {
      // 	if (number < this.formNo)
      // 	{
      // 		return;
      // 	}
      // }
      this.formNo = number;
    }
    console.log('onFormClick', number, this.parentId);
    if (this.id == 'add' && number == 5)
    {
      this.detailApi = config.base_url_slug + 'view/child/' + this.parentId;
      this.getDetail();
    }
    else if (this.id != 'add')
    {
      this.getDetail();

    }
  }

  afterDetail(): void
  {
    console.log('afterDetail', this.formDetail);
    this.isResponseSaved = true;
    this.formDetail = this.formDetail;
    if (this.formDetail.childEmergencyDetails.length > 0)
    {
      this.emergencyDetailId = 100;
    }

    if (this.formDetail.childGuardianDetails.length > 0)
    {
      this.guardianInfoId = 100;
    }

    if (this.formDetail.childMedicalInformation != null)
    {
      this.medicalInfoId = 100;
    }

    if (this.formDetail.childFinanceDetail != null)
    {
      this.fundingId = 100;
    }
    if (this.formDetail.roomManagmentDetail != null)
    {
      this.roomManagementId = 100;
    }

    console.log("this is what i got", this.formDetail)
  }

  tickCheck(toCheck, isForm)
  {
    let returnVal = true;
    if (this.formDetail)
    {
      if (isForm)
      {
        this.formDetail[toCheck] == null ? returnVal = false : returnVal = true;

      }
      else
      {
        this.formDetail[toCheck]?.length == 0 ? returnVal = false : returnVal = true;

      }
    }
    else
    {
      return false;
    }
    return returnVal
  }

  onEmitFormData(event)
  {
    console.log('onEmitFormData', event);
    if (event.submit == "success")
    {
      this.isUnsavedForm = false
    }
    if (event.type == 'parent')
    {
      this.parentId = event.value;
      this.formDetailApi = config.base_url_slug + 'view/staff-member/' + this.parentId;
    }
    else if (event.type == 'child')
    {
      this[event.key] = event.value;
    }
  }

  public ngOnDestroy(): void
  {
    this.subscription.unsubscribe();
    // localStorage.removeItem('child-id');
  }

  onBack()
  {
    if (this.formNo == 1)
    {
      this.router.navigate(['main/children']);
    }

    if (this.formNo > 1)
    {
      this.formNo = this.formNo - 1;
    }
  }

}
