import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { map, startWith } from 'rxjs/operators';
import { AlertService, ApiService, CommunicationService } from 'src/app/services';
import { PeriodicElement } from 'src/app/views/child-management/child-booking/add-booking/multiple-booking-detail/multiple-booking-detail.component';
import { config } from 'src/config';
import { OverrideReccuringDialogComponent } from '../override-reccuring-dialog/override-reccuring-dialog.component';
import * as moment from 'moment';

@Component({
  selector: 'app-advanced-settings-dialog',
  templateUrl: './advanced-settings-dialog.component.html',
  styleUrls: ['./advanced-settings-dialog.component.scss']
})
export class AdvancedSettingsDialogComponent implements OnInit {

  joiningDate: any;
  childId: any;
  type: string;
  selectedSessions: any;
  discountCheck = true;
  fundingCheck = true;
  Form: FormGroup;
  filteredGuardians: any[] = [];
  guardians: any[] = [];
  guardiansForSecond: any[] = [];
  filteredSecondGuardians: any[] = [];
  selectedGuardian = null;
  selectedSecondGuardian = null;
  allGuardians: any[] = [];
  invoiceSplittingDetails: any[] = [];
  specifiySecondPayee = false;
  selectedGuardian1: any;
  selectedGuardian2: any;
  validityType: any;
  bookingType: any;
  hasBeenCalled: any;
  emptyForm1: any;
  isUnsavedForm: any;

  constructor(protected alertService: AlertService,
              protected apiService: ApiService,
              protected communicationService: CommunicationService,
              protected dialogRef: MatDialogRef<OverrideReccuringDialogComponent>) {

    this.Form = new FormGroup({
      guardian: new FormControl(null, [Validators.required]),
      secondGuardian: new FormControl(null),
      guardianId: new FormControl(null),
      secondGuardianId: new FormControl(null),
      amount1: new FormControl('100.00', [Validators.required]),
      amount2: new FormControl('50.00'),
      specifySecond: new FormControl(null),
      address1: new FormControl(null,[Validators.required]),
      address2: new FormControl(null),
    }); 

    let guardian1 = this.Form.get('guardian').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
    guardian1.subscribe((d)=>
    this.filteredGuardians =  d);

    let guardian2 = this.Form.get('secondGuardian').valueChanges.pipe(
      startWith(''),
      map(value => this._filter2(value))
    );
    guardian2.subscribe((d)=>
    this.filteredSecondGuardians =  d);
    
  }

  selection = new SelectionModel<PeriodicElement>(true, []);
  displayedColumns: string[] = ['day', 'room', 'session', 'funding', 'discount', 'addOns'];
  dataSource = new MatTableDataSource([]);
  sessionIds: number[] = [];
  addOns: any[] = [{name: 'Milk'}, {name: 'cheese'}];

  ngOnInit(): void {

    this.selectedSessions.forEach(element => {
      element['startTimeDisplay'] = element.startTime ? moment((element.startTime * 1000) + (new Date(element.startTime * 1000).getTimezoneOffset()*60000)) : 0;
      element['endTimeDisplay'] = element.endTime ? moment((element.endTime * 1000) + (new Date(element.endTime * 1000).getTimezoneOffset()*60000)) : 0;
    });
    
    this.dataSource = new MatTableDataSource(this.selectedSessions);
    this.patchDataForEdit();
    this.getAddOns();
    this.getGuardians();
    if (this.type == 'view' || this.type == 'view-logs') {
      this.Form.disable();
      this.communicationService.unSavedForm.next(false);
    }

    this.Form.valueChanges.subscribe((val) => {
      if (val) {
        this.detectFormChanges(val);
      }
    })
  }


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  onCheckboxChange(e, type) {
    this.selectedSessions.forEach(element => element[type] = e.checked ? 'yes' : 'no');
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

  getGuardians() {
    let url = `${config.base_url_slug}view/linked-guardians/${this.childId}?page=1&perPage=20&paginationObject=0`;
    this.apiService.get(url).then((res)=> {
      console.log(res);
      if (res.code == 200 || res.code == 201) {
        let guardianList = res.data.listing;
        this.allGuardians = guardianList.length !== 0 ? guardianList.map(x=> { return {name: x.guardians.type == 'guardian' ? x.guardians.name : x.guardians.organizationName, address: x.guardians.address, id: x.guardians.id, type : x.type}}) : [];
        // let guardianSecondList = res.data.listing;
        this.guardians = guardianList.length !== 0 ? guardianList.map(x=> { return {name: x.guardians.type == 'guardian' ? x.guardians.name : x.guardians.organizationName, address: x.guardians.address, id: x.guardians.id, type : x.type}}) : [];
        this.guardiansForSecond = guardianList.length !== 0 ? guardianList.map(x=> { return {name: x.guardians.type == 'guardian' ? x.guardians.name : x.guardians.organizationName, address: x.guardians.address, id: x.guardians.id, type : x.type}}) : [];

        if (this.invoiceSplittingDetails.length == 0) {

            let primaryGuardian = guardianList.find(x=> x.type ==  'primary');
            if (primaryGuardian) {
              this.Form.get('guardianId').setValue(primaryGuardian ? primaryGuardian.guardianId : null);
              this.Form.get('address1').setValue(primaryGuardian ? primaryGuardian.guardians.address : null);
              // this.Form.get('guardian').setValue(primaryGuardian ? primaryGuardian.map(x=> { return {name: x.guardians.type == 'guardian' ? x.guardians.name : x.guardians.organizationName, address: x.guardians.address, id: x.guardians.id}}) : null);
              this.Form.get('guardian').setValue(primaryGuardian.guardians.type == 'guardian' ? primaryGuardian.guardians.name : primaryGuardian.guardians.organizationName);
              this.selectedGuardian = primaryGuardian ? {name: primaryGuardian.guardians.type == 'guardian' ? primaryGuardian.guardians.name : primaryGuardian.guardians.organizationName, address: primaryGuardian.guardians.address, id: primaryGuardian.guardians.id, type : primaryGuardian.type} : null;
            }

        } else {

          let guardian1 = guardianList.find(x=> x.guardianId ==  this.invoiceSplittingDetails[0].guardian);
          this.selectedGuardian = guardian1 ? {name: guardian1.guardians.type == 'guardian' ? guardian1.guardians.name : guardian1.guardians.organizationName, address: guardian1.guardians.address, id: guardian1.guardians.id, type : guardian1.type} : null;
          this.Form.get('guardian').setValue(guardian1 ? guardian1.guardians.type == 'guardian' ? guardian1.guardians.name : guardian1.guardians.organizationName : null);
          this.Form.get('address1').setValue(guardian1 ? guardian1.guardians.address : null);

          if (this.invoiceSplittingDetails.length > 1) {
            let guardian2 = guardianList.find(x=> x.guardianId ==  this.invoiceSplittingDetails[1].guardian);
            if (guardian2) {
              this.Form.get('secondGuardian').setValue(guardian2.guardians.type == 'guardian' ? guardian2.guardians.name : guardian2.guardians.organizationName);
              this.Form.get('address2').setValue(guardian2 ? guardian2.guardians.address : null);
              this.selectedSecondGuardian = guardian2 ? {name: guardian2.guardians.type == 'guardian' ? guardian2.guardians.name : guardian2.guardians.organizationName, address: guardian2.guardians.address, id: guardian2.guardians.id, type : guardian2.type} : null;
            }
          }

        }

        this.filteredGuardians = [...this.guardians];
        this.filteredSecondGuardians = [...this.guardiansForSecond];
        console.log(this.guardians);
        
        // this.router.navigate(['main/finance/allInvoice']);
        // this.alertService.alertSuccess('SUCCESS', 'Item Added Successfully');
      }
    })
    .catch(err => console.log(err));
  }

  onCancelClick() {

    if (this.isUnsavedForm && this.isFormDirty()) {
			let heading = 'Confirmation';
			let message = 'You have unsaved changes, are you sure you want to leave ?';
			let leftButton = 'Cancel';
			let rightButton = 'Leave';
			this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then((val)=> {
			   if (val) {
				this.communicationService.unSavedForm.next(false);
				 this.dialogRef.close({data : {}, status: false});
			   }
			})
		} else {
      this.communicationService.unSavedForm.next(false);
			 this.dialogRef.close({data : {}, status: false});
		}

   
  }

  onSubmitClick() {
    let arrayData = [];

    this.Form.markAllAsTouched();

    if (this.Form.invalid) {
      this.alertService.alertError('WARNING', 'Please fill the required data.');
      return;
    }

    let {guardianId,secondGuardianId,amount1,amount2} = this.Form.value;

    arrayData[0] = {guardian: guardianId, amountPaidPercentage: amount1 }; 

    if (this.specifiySecondPayee) {
      arrayData[1] = {guardian: secondGuardianId, amountPaidPercentage: amount2 }; 
    }

    let data = {invoiceSplittingDetails: arrayData, sessionDetails: this.selectedSessions}

    this.dialogRef.close({data : data, status: true});
  }

  private _filter(value: any): any[] {
    console.log(value);
    let filterValue = '';
    if (typeof(value) == 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value?.name?.toLowerCase();
    }

    return this.guardians.filter(option => option.name.toLowerCase().includes(filterValue));

  }

  private _filter2(value: any): any[] {
    console.log(value);
    let filterValue = '';
    if (typeof(value) == 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value?.name?.toLowerCase();
    }

    return this.guardiansForSecond.filter(option => option.name.toLowerCase().includes(filterValue));

  }

  setGuardianData() {
    this.selectedGuardian = this.Form.get('guardian').value;
    this.Form.get('guardianId').setValue(this.selectedGuardian.id);
    this.Form.get('guardian').setValue(this.selectedGuardian.name);

    // this.guardiansForSecond = this.allGuardians.filter(x => x.guardianId != this.selectedGuardian.id);
    // this.filteredSecondGuardians = this.filteredSecondGuardians.filter(x => x.id != this.selectedGuardian.id);

    console.log(this.guardians);
    console.log(this.filteredGuardians);
    
    

    if (this.Form.get('guardian').value != '') {
      this.Form.get('address1').setValue(this.selectedGuardian.address);
    } else {
      this.Form.get('address1').setValue(null);
    }

  }

  setSecondGuardianData() {
    // this.selectedGuardian = this.Form.get('child').value;
    // this.Form.get('child').setValue(this.selectedChild.firstName);
    this.selectedSecondGuardian = this.Form.get('secondGuardian').value;
    this.Form.get('secondGuardianId').setValue(this.selectedSecondGuardian.id);
    this.Form.get('secondGuardian').setValue(this.selectedSecondGuardian.name);

    // this.guardians = this.allGuardians.filter(x => x.guardianId != this.selectedSecondGuardian.id);
    // this.filteredGuardians = this.filteredGuardians.filter(x => x.id != this.selectedSecondGuardian.id);

    console.log(this.guardiansForSecond);
    console.log(this.filteredSecondGuardians);

    if (this.Form.get('secondGuardian').value != '') {
      this.Form.get('address2').setValue(this.selectedSecondGuardian.address);
    } else {
      this.Form.get('address2').setValue(null);
    }

  }

  onCheckChange() {
    this.Form.get('amount1').setValue(this.specifiySecondPayee ? '50.00' : '100.00');
    this.Form.get('amount2').setValue(this.specifiySecondPayee ? '50.00' : '0.00');

    if (this.specifiySecondPayee) {
      this.Form.get('secondGuardian').setValidators(Validators.required);
      this.Form.get('amount2').setValidators(Validators.required);
    } else {
      this.Form.get('secondGuardian').clearValidators();
      this.Form.get('amount2').clearValidators();
      this.Form.get('secondGuardian').setValue(null);
      this.Form.get('secondGuardianId').setValue(null);
      this.Form.get('address2').setValue(null);
    }
    this.Form.get('secondGuardian').updateValueAndValidity();
    this.Form.get('amount2').updateValueAndValidity();
  }

  onAmountChange(inp, event) {

    let amount1 = inp == 'amount1' ? event.target.value : this.Form.get('amount1').value;
    let amount2 = inp == 'amount2' ? event.target.value : this.Form.get('amount2').value;
    
    const sum = amount1 + amount2;

    if (sum !== 100 && amount2 !== null) {
      if (inp == 'amount1') {
        amount2 = 100 - amount1;
      } else {
        amount1 = 100 - amount2;
      }
    }

    this.Form.get('amount1').setValue(amount1);
    this.Form.get('amount2').setValue(amount2);
  }

  onBlurEvent(event,controlName)
	{

		console.log(event);
    if (event.target.value > 100.00 || event.target.value <= 0.00 || event.target.value == "")
		{
			this.Form.controls[controlName].setValue(null);
      return;
		}

		if (event.target.value !== "")
		{
			// event.target.value = parseFloat(event.target.value).toFixed(2);


      let amount1 =  parseInt(this.Form.get('amount1').value);
      let amount2 = parseInt(this.Form.get('amount2').value);
      
      const sum = amount1 + amount2;
      if (event.target.value == 100.00 && this.specifiySecondPayee) {
        amount1 = controlName == 'amount1' ? 99 : 1;
        amount2 = controlName == 'amount2' ? 99 : 1;
      }
      else if (sum !== 100 && amount2 !== null) {
        if (controlName == 'amount1') {
          amount2 = 100 - amount1;
        } else {
          amount1 = 100 - amount2;
        }
      }

      this.Form.get('amount1').setValue(amount1.toFixed(2));
      this.Form.get('amount2').setValue(amount2.toFixed(2));
		}

		// else
		// {
		// 	this.Form.controls[controlName].patchValue(parseFloat(event.target.value))
    //   this.Form.get('amount1').setValue(amount1);
    //   this.Form.get('amount2').setValue(amount2);
		// }


	}

  getField(field: any, form?: any): any
  {
    if (form)
    {
      return form.get(field).invalid;
    }
    return this.Form.get(field).invalid;
  }

  getCheckedValue(type) {
    return this.selectedSessions.every(x=> x[type] == 'yes');
  }

  patchDataForEdit() {
    this.fundingCheck = this.selectedSessions.every(x=> x['allowFunding'] == 'yes');
    this.discountCheck = this.selectedSessions.every(x=> x['allowDiscount'] == 'yes');
    if (this.invoiceSplittingDetails.length != 0) {
      this.Form.get('amount1').setValue(parseFloat(this.invoiceSplittingDetails[0].amountPaidPercentage).toFixed(2));
      // this.Form.get('guardian').setValue('dd');
      this.Form.get('guardianId').setValue(this.invoiceSplittingDetails[0].guardian);

      if (this.invoiceSplittingDetails.length > 1) {
        this.Form.get('amount2').setValue(parseFloat(this.invoiceSplittingDetails[1].amountPaidPercentage).toFixed(2));
        // this.Form.get('secondGuardian').setValue('dd');
        this.Form.get('secondGuardianId').setValue(this.invoiceSplittingDetails[1].guardian);
        this.specifiySecondPayee = true;
      }
    }
  }

  // checkValidations() {
  //   this.Form.get('').valueChanges.subscribe(value => {
  //     if (value) {
  //       this.Form.get('repeatPeriod').setValidators(Validators.required);
  //       this.Form.get('repeatEvery').setValidators(Validators.required);
  //     } else {
  //       this.Form.get('repeatPeriod').clearValidators();
  //       this.Form.get('repeatEvery').clearValidators();
  //     }
  //     this.Form.get('repeatPeriod').updateValueAndValidity();
  //     this.Form.get('repeatEvery').updateValueAndValidity();
  //   });
  // }

  // onAmountChange2() {
    
  // }

  detectFormChanges(form) {

    if (!this.hasBeenCalled) {
      this.emptyForm1 = form;
    }

    if (JSON.stringify(this.emptyForm1) != JSON.stringify(form)) {
      this.communicationService.unSavedForm.next(true);
    }
    else {
      this.communicationService.unSavedForm.next(false);
    }

    this.communicationService.unSavedForm.subscribe((val)=> {
			if (val) {
			  this.isUnsavedForm = true;
			} else {
			  this.isUnsavedForm = false;
			}
		 })
    this.hasBeenCalled = true;

  }

  isFormDirty(): boolean {
    return this.Form.dirty;
  }

}
