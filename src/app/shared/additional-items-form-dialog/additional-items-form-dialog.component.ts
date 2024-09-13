import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { map, startWith } from 'rxjs/operators';
import { AlertService, ApiService, AutocompleteFiltersService } from 'src/app/services';
import { config } from 'src/config';

@Component({
  selector: 'app-additional-items-form-dialog',
  templateUrl: './additional-items-form-dialog.component.html',
  styleUrls: ['./additional-items-form-dialog.component.scss']
})
export class AdditionalItemsFormDialogComponent implements  OnInit {

  Form: FormGroup;
  calendar: String = "assets/images/sdn/ic_event_24px.svg"
  additionalItems: any[] = [];
  amount: any;
  total: number;
  additionalItemsPostData: any[] = [];
  type = 'add';
  currentDate = new Date();
  minDate: any;
  maxDate: any;
  mode: any;
  filteredAdditionalItems = [];
  children = [];
  filteredChildren = [];

  constructor(protected dialogRef: MatDialogRef<AdditionalItemsFormDialogComponent>, 
              protected apiService: ApiService,
              protected filterService: AutocompleteFiltersService, 
              protected alertService: AlertService) { 

    this.Form = new FormGroup({
      additionalItemId: new FormControl(null),
      date: new FormControl(null),
      // additionalAmount: new FormControl(null),
      rate: new FormControl(0, [Validators.required]),
      quantity: new FormControl(1, [Validators.required]),
      comment: new FormControl(null),
      additionalLabel: new FormControl(null),
      childLabel: new FormControl(null),
      childId: new FormControl(null, [Validators.required]),
    }); 

    // Populate autcomplete data for additional item
    let item = this.Form.get('additionalLabel').valueChanges.pipe(
      startWith(''),
      map(value => this.filterService._filterAdditionalItems(value, this.additionalItems))
    );
    item.subscribe((d)=> {this.filteredAdditionalItems =  d; console.log(d)});
     // End

    // Populate autcomplete data for children
    let child = this.Form.get('childLabel').valueChanges.pipe(
      startWith(''),
      map(value => this.filterService._filterChildrens(value, this.children))
    );
    child.subscribe((d)=> {this.filteredChildren =  d; console.log(d)});
  // End

   }

  itemOptions = [
    {label: 'Birthday Cake', val: 'birthdayCake'},
    {label: 'Late Collection Fee', val: 'lateCollectionFee'},
    {label: 'Lunch', val: 'lunch'},
    {label: 'Nappy Change', val: 'nappyChange'},
    {label: 'Registration Fee', val: 'registrationFee'},
    {label: 'Tea', val: 'tea'},
    {label: 'Sun Cream', val: 'sunCream'},
    {label: 'Costume', val: 'costume'},
    {label: 'Breakage', val: 'breakage'},
    {label: 'Late Payment Charge', val:'latePaymentCharge'},
    {label:'Packed Meal', val: 'packedMeal' },
    {label: 'Adjustment', val: 'adjustment' },
    {label: 'Term Time Only Surcharge', val: 'termTimeOnlySurcharge' },
  ]

  ngOnInit(): void {
    this.getAdditionaltems();

    if (this.mode == 'edit') {
      // Setting child items manually for autocomplete
      let child = this.children.find(x => x.childId == this.Form.get('childId').value);
      this.Form.get('childLabel').setValue(child ? child.name : null);
      // End
    }
    console.log(this.Form.value);
  }

  checkForAmount(id) {

    let exist = this.additionalItems.find(x=> x.id == id);
    if (exist) {
      this.amount = exist.amount;
      this.Form.get('rate').setValue(this.amount);
      // this.Form.get('additionalAmount').disable();
    } else {
      this.amount = 0;
      this.Form.get('rate').setValue(null);
      // this.Form.get('additionalAmount').enable();
    }
  }

  dateChangeStatic(Form, controlName, event: MatDatepickerInputEvent<Date>)
  {
      const formattedDate = moment(new Date(event.value)).format(config.serverDateFormat);
      Form.get(controlName).setValue(formattedDate);
  }

  onBlurEvent(event)
	{
    if (event.target.value < -99999 || event.target.value > 99999 ) {
      this.Form.get('rate').setValue(null);
      return;
    }

	  if (event.target.value.includes('.')) {
		  event.target.value = parseFloat(parseFloat(event.target.value).toFixed(2));
		  this.Form.get('rate').setValue(event.target.value);
	  } else {
		this.Form.get('rate').setValue(event.target.value);
	  }
	}

  onAddItem(): void {
    console.log(this.Form.get('additionalItemId').value);
    let Item = {
      additionalItemId: this.Form.get('additionalItemId').value,
      item: this.additionalItems.find(x => x.id == this.Form.get('additionalItemId').value).name,
      quantity: this.Form.get('quantity').value,
      rate: this.Form.get('rate').value,
      date: this.Form.get('date').value,
      itemLabel: this.additionalItems.find(x => x.id == this.Form.get('additionalItemId').value).name,
      category: this.Form.get('additionalItemId').value.category == 'additional_item' ? 'Additional Item' : 'Meal',
      displayDate: moment(new Date(this.Form.get('date').value)).format(config.cmsDateFormat),
      displayTotalPrice: Number(this.Form.get('rate').value).toFixed(2),
      comment: this.Form.get('comment').value,
      childId: this.Form.get('childId').value,
      childLabel: this.Form.get('childLabel').value,
    }

    this.dialogRef.close({data: Item});
    return;

    // let exist = this.additionalItems.find(x=> x.item == Item.item);

    // if (exist) {
    //   let existingRate = this.additionalItems[this.additionalItems.indexOf(exist)].rate;
    //   this.additionalItems[this.additionalItems.indexOf(exist)].quantity += Item.quantity;
    //   this.total += (existingRate * Item.quantity);
    // } else {
    //   this.additionalItems.push(Item);
    //   this.total += (Item.rate * Item.quantity);
    // }
    // this.additionalItemsPostData.push(Item);

    let exist = this.additionalItems.find(x=> x.item == Item.item && x.date == Item.date);

    if (exist) {

      let existingRate = this.additionalItems[this.additionalItems.indexOf(exist)].rate;

      if (existingRate != Item.rate) {
        this.total += (Item.rate * Item.quantity);
        this.additionalItems.push({...Item});
      } else {
        this.additionalItems[this.additionalItems.indexOf(exist)].quantity += Item.quantity;
        this.total += (existingRate * Item.quantity);
        // this.additionalItemsPostData[this.additionalItems.indexOf(exist)].quantity += Item.quantity;
      }

    } else {
      this.additionalItems.push({...Item});
      this.total += (Item.rate * Item.quantity);
      this.additionalItemsPostData.push({...Item});
    }
    console.log(this.additionalItemsPostData);

    this.clearAdditionalItem();
	}

  setValue() {
		let item = this.additionalItems.find(x => x.name == this.Form.get('additionalLabel').value);
		this.Form.get('additionalItemId').setValue(item ? item.id : null);
    this.checkForAmount(item.id);
	}

  setChildValue() {
		let child = this.children.find(x => x.name == this.Form.get('childLabel').value);
		this.Form.get('childId').setValue(child ? child.childId : null);
	}

  getAdditionaltems() {
  
    let endpoint = `${config.base_url_slug}view/global/additionalItem?branchId=${localStorage.getItem('branchId')}`;
    this.apiService.get(endpoint).then((res)=> {
  
      if (res.code == 200 || res.code == 201) {
        this.additionalItems = res.data.listing;

        // Setting additional items manually for autocomplete
          let additionalItem = this.additionalItems.find(x => x.id == this.Form.get('additionalItemId').value);
          this.Form.get('additionalLabel').setValue(additionalItem ? additionalItem.name : null);
        // End
        console.log(this.children);
        
      }
  
    })
    .catch(err => {
      this.alertService.alertError(err.error.status, err.error.message).then(result => {
        // this.getList(this.filterUrl);
      })
    })
  }

  isAdditonalFieldsInvalid() {
    return ( 
            //  this.Form.get('child').value == null ||
             this.Form.get('date').value == null ||
             this.Form.get('rate').value == null ||
             this.Form.get('quantity').value == null)
  }

  clearAdditionalItem() {
    this.dialogRef.close(false);
    // this.Form.get('additionalItemId').setValue(null);
    // this.Form.get('date').setValue(null);
    // this.Form.get('rate').setValue(null);
    // this.Form.get('quantity').setValue(1);
  }

}
