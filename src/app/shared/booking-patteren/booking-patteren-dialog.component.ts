import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { ApiService, AlertService, UtilsService } from 'src/app/services';
import { config } from 'src/config';
import { EndBookingDialogComponent } from '../end-booking-dialog/end-booking-dialog.component';

@Component({
  selector: 'app-booking-patteren-dialog',
  templateUrl: './booking-patteren-dialog.component.html',
  styleUrls: ['./booking-patteren-dialog.component.scss']
})
export class BookingPatterenDialogComponent implements OnInit {
  form: FormGroup;
  formData: any;
  childDetail: any;
  sessionDetails: any;
  sessions: any;
  rooms: any[];
  childId: any;
  allGuardians = [];
  initialChildDetail: any;
  initialSessions: any;
  tempSessions = []
  addOns= []
  changedKeys: any[] = [];


  constructor(protected formbuilder: FormBuilder, 
              protected apiService: ApiService, 
              protected utilsService: UtilsService,
              protected dialogRef: MatDialogRef<EndBookingDialogComponent>,
              protected alertService: AlertService) {
   
   }

  ngOnInit(): void {
    this.getGuardians();
    this.getAddOns();
    this.formData = this.form.value;
    console.log(this.sessionDetails);
  
    this.sessionDetails = this.formData.sessionDetail.filter(x=> x.startTime);
    this.tempSessions = this.initialSessions.filter(x=> x.startTime);
    this.tempSessions.forEach(session=> {
       session.startTime = (session.startTime * 1000) + (new Date().getTimezoneOffset() * 60000);
       session.endTime = (session.endTime * 1000) + (new Date().getTimezoneOffset() * 60000);
    })
    this.sessionDetails.forEach(session=> {
      session.startTime = (session.startTime * 1000) + (new Date().getTimezoneOffset() * 60000);
      session.endTime = (session.endTime * 1000) + (new Date().getTimezoneOffset() * 60000);
   })
    console.log(this.initialSessions);
  
  }

  checkStatus(f) {
    console.log(this.changedKeys);
    
    return this.changedKeys.includes(f);
  }

  onCancelClick() {
    this.dialogRef.close(false);
  }

  onSubmitClick() {
    this.dialogRef.close(true);
  }

  getSessionName(id) {
    return this.sessions.find(x => x.id == id).name;
  }

  getRoomName(id) {
    return this.rooms.find(x => x.value == id).label;
  }

  getGuardianName(id) {
    return this.allGuardians.find(x => x.id == id).name;
  }

  getNumberWithSuffix(num) {
    return this.utilsService.addNumberSuffix(num);
  }

  getValidityLabel(val) {
    let value = '';
    switch (val) {
      case 'nonTerm':
         value = 'Non Term Time';
        break;
     
        case 'termOnly':
          value = 'Term-Time Only';
         break;
         
         case 'fullYear':
          value = 'All Year';
         break;
    
      default:
        break;
    }
    return value;
  }

  getAddOns() {
  
    let endpoint = `${config.base_url_slug}view/global/additionalItem?branchId=${localStorage.getItem('branchId')}&perPage=100&category=meal`;
    this.apiService.get(endpoint).then((res)=> {
  
      if (res.code == 200 || res.code == 201) {
        this.addOns = res.data.listing;
      }
  
    })
    .catch(err => {
      this.alertService.alertError(err.error.status, err.error.message).then(result => {
        // this.getList(this.filterUrl);
      })
    })
  }

  getAddonLabels(ids) {
    let text = '';
    if (ids) {
      ids.forEach((id,i) => {
        let addOn = this.addOns.find(x=> x.id == id);
        if (addOn) {
           text += addOn.name;
           if (i != ids.length -1) {
            text += ',';
           }
        }
      });
    }

    return text ? `(${text})` : '';
  }

  getPercent(val) {
    let typeVal = typeof val;
    if (typeVal == 'number') {
      return val.toFixed(2);
    } else {
      return val;
    }
  }

  getGuardians() {
    let url = `${config.base_url_slug}view/linked-guardians/${this.childId}?page=1&perPage=20&paginationObject=0`;
    this.apiService.get(url).then((res)=> {
      console.log(res);
      if (res.code == 200 || res.code == 201) {
        let guardianList = res.data.listing;
        this.allGuardians = guardianList.length !== 0 ? guardianList.map(x=> { return {name: x.guardians.type == 'guardian' ? x.guardians.name : x.guardians.organizationName, address: x.guardians.address, id: x.guardians.id, type : x.type}}) : [];
      }
    })
    .catch(err => console.log(err));
  }

}
