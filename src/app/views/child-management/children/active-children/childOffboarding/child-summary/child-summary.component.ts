import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { AlertService, CommunicationService } from 'src/app/services';
import { config } from '../../../../../../../config';
import { ApiService } from '../../../../../../services/api.service';

@Component({
  selector: 'app-child-summary',
  templateUrl: './child-summary.component.html',
  styleUrls: ['./child-summary.component.scss']
})
export class ChildSummaryComponent implements OnInit
{
  time = new Date();
  timer;
  @Input() previousForm: any;
  @Input() formDetail: any;
  editPermit: any;
  leaveDate: any;
  noticeGiven: any;

  user: any
  type: any = 'add';
  id: any;
  offboardingDetails: any;

  constructor(protected apiService: ApiService, protected alertService: AlertService, protected communicationService: CommunicationService)
  {
    this.communicationService.getChild().subscribe(childData => console.log(childData));
    this.timer = setInterval(() =>
    {
      this.time = new Date();
    }, 1000);
    this.editPermit = true
  }
  staffInfo: any;
  ngOnInit(): void
  {
    this.user = JSON.parse(localStorage.getItem('sdnUser'));
    if (this.previousForm)
    {
      this.getChildOtherInfo();
      this.leaveDate = moment(new Date(this.previousForm.leaveDate)).format(config.cmsDateFormat);
      this.noticeGiven = moment(new Date(this.previousForm.noticeGiven)).format(config.cmsDateFormat)
    }
    if (this.formDetail.childOffboardingStatus || this.formDetail.scheduleForOffboard)
    {
      this.offboardingDetails = JSON.parse(localStorage.getItem('offboardingDetail'));
      if (this.offboardingDetails)
      {
        this.type = 'view';
        this.id = this.offboardingDetails.id;
        this.user.name = this.offboardingDetails.staffName;
        this.staffInfo = this.offboardingDetails;
        let date = new Date(this.offboardingDetails.updatedTime * 1000)
        this.offboardingDetails.updatedDate = date;
        this.leaveDate = moment(new Date(this.previousForm.leaveDate)).format(config.cmsDateFormat);
        this.noticeGiven = moment(new Date(this.previousForm.noticeGiven)).format(config.cmsDateFormat)
      }
      else
      {
        this.type = 'add';
      }
    }
  }
  getChildOtherInfo()
  {
    let url = config.base_url_slug + 'view/child/child-other-details/' + this.previousForm.childId
    this.apiService.get(url).then(response =>
    {
      console.log(response);
      this.staffInfo = response.data
    })
  }
  goToEdit()
  {
    this.type = 'edit';
    this.user = JSON.parse(localStorage.getItem('sdnUser'));
    this.getChildOtherInfo();
  }
  onUpdateOffboarding()
  {
    let url;
    let type;
    if (this.type == 'add')
    {
      url = config.base_url_slug + 'add/child/child-offboarding';
      type = 'post';
    }
    else if (this.type == 'edit')
    {
      url = config.base_url_slug + `update/child/${this.id}/child-offboarding` // id from list of child offoboarding
      type = 'patch'
    }
    this.apiService[type](url, this.previousForm).then(response =>
    {
      console.log(response);
      if (response.code == 200 || response.code == 201)
      {
        this.alertService.alertSuccess(response.status, response.message).then(result =>
        {
          localStorage.removeItem('offboardingDetail');
          window.history.back();
        })
      }
      else
      {
        this.alertService.alertError(response.error.status, response.error.message);
      }

    })
  }
  goBack()
  {
    console.log("Back method called");
    let data = {
      'number': 3,
      'url': 'offboarding-funding-info',
      'prevForm': '',
      'currentForm': 'child-summary',
      'isForm': true,
    }
    this.communicationService.setChild(data);
  }
  onCancel()
  {
    window.history.back();
  }
}
