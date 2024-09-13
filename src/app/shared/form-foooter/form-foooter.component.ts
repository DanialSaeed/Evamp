import { Component, OnInit, Input,Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AlertService, CommunicationService } from 'src/app/services';

@Component({
  selector: 'app-form-foooter',
  templateUrl: './form-foooter.component.html',
  styleUrls: ['./form-foooter.component.scss']
})
export class FormFoooterComponent implements OnInit
{
  activated = true;
  isUnsavedForm = false;
  @Input() save: any = 'Save';
  @Output() subButtonEvent = new EventEmitter<string>();
  @Output() saveInfoEvent = new EventEmitter<string>();
  @Output() clearEvent = new EventEmitter<string>();
  @Output() backEvent = new EventEmitter<string>();
  @Output() cancelEvent = new EventEmitter<string>();
  @Output() popUpCloseEvent = new EventEmitter<string>();

  cancel: any = 'Clear';
  @Input() footerProps: {
    buttonLabel:any
    type: any,
    hasButton:true,
    hasSubButton: any,
    subButtonLabel: any,
    hasbackButton: false,
    backButtonLabel: any,
    hasClearButton: false,
    hasClearForm:false,
    clearButtonLabel: any,
    subButtonRoute: any,
    color:any,
    hasCancelButton:any,
    hasCancelButtonLabel:any
    hasCancel:any,
    hasCancelLabel:any,
    removeUnsavedForm:false

  };

  constructor(protected router: Router, protected location: Location, protected alertService: AlertService, protected communicationService: CommunicationService) {
    this.communicationService.unSavedForm.subscribe((val)=> {
       if (val) {
         this.isUnsavedForm = true;
       } else {
         this.isUnsavedForm = false;
       }
    })
  }

  ngOnInit(): void
  {
    if (this.footerProps?.type == "view")
    {
      this.activated = false;
      // this.cancel = "Back"
    }
  }

  onSubButton(): void
  { if(this.footerProps.type==="navigate")
    {
      if (this.footerProps.subButtonRoute)
      {
        this.router.navigateByUrl('/main/' + this.footerProps.subButtonRoute + '/new');
      }
      else
      {
      }
    }
    else if(this.footerProps.type==="output")
    {
      this.saveInfoEvent.emit();
    }


    // this.router.navigate(['/main/' + this.props.buttonRoute], {
    // 	state: { type: this.props.buttonLabel }
    //   });
  }

  clearNow()
  {
      this.clearEvent.emit()
  }

  onBack()
  {
    if (this.isUnsavedForm && !this.footerProps.removeUnsavedForm)
    {
      let heading = 'Confirmation';
      let message = 'You have unsaved changes, are you sure you want to leave ?';
      let leftButton = 'Cancel';
      let rightButton = 'Leave';
      this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then((val)=> {
         if (val) {
          this.backEvent.emit();
          this.communicationService.unSavedForm.next(false);
         }
      })
    }
    else if (this.footerProps.removeUnsavedForm){
      this.backEvent.emit();
      this.communicationService.unSavedForm.next(false);
    }
    else {
      if (!this.footerProps['isPopup']) {
        this.backEvent.emit();
      } else {
        this.popUpCloseEvent.emit();
      }
    }

  }
  onCancel(){
    this.cancelEvent.emit();
  }
}
