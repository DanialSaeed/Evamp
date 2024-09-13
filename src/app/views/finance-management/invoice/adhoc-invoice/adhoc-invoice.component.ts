import { map, startWith } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, AutocompleteFiltersService, CommunicationService, PermissionService, UtilsService } from 'src/app/services';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { BookingDetailComponent } from 'src/app/views/child-management/child-booking/add-booking/booking-detail/booking-detail.component';
import { config } from 'src/config';
import { Observable } from 'rxjs';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import * as moment from 'moment';
import { getBasicInfoFieldMsg, getInvoiceFieldMsg } from 'src/app/shared/field-validation-messages';
import { FilterControlComponent } from 'src/app/core/filter-control/filter-control.component';

@Component({
  selector: 'app-adhoc-invoice',
  templateUrl: './adhoc-invoice.component.html',
  styleUrls: ['./adhoc-invoice.component.scss', '/src/app/views/shared-style.scss']
})
export class AdhocInvoiceComponent extends GlobalFormComponent implements OnInit {

	Form: FormGroup;
	calendar: String = "assets/images/sdn/ic_event_24px.svg"
	tableConfigAndProps = {};
	footerProps: any;
	childs: any;
	buttonHeaderProps: any;

  selectedChild: any;
  additionalItems: any[] = [];
  additionalItemsList = [];
  additionalItemsPostData: any[] = [];
  total = 0;
  type = '';
  branchId = localStorage.getItem('branchId');
  // childrens : any[] = [ {id: 1, firstName: 's'} , {id: 2, firstName: 'sd'} ];
  childrens : any[] = [];
  filteredChildrens : any[] = [];
  currentDate = new Date();
  amount = 0;
  maxDate: any;
  isDraft = false;
  filteredAdditionalItems = [];
  mode = 'add';
  dataToEdit: any;

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
	// dataSource = new MatTableDataSource();

	data =
		[
			{
			  'days': 'Monday', 'sessionName': 'AM', 'attendedHrs': '3.00 hrs', 'fundedHrs': '3.00 hrs', 'qty': '4', 'rate': '0.00', 'amount': '0.00',
			},
			{
				'days': 'Tuesday', 'sessionName': 'AM', 'attendedHrs': '3.00 hrs', 'fundedHrs': '3.00 hrs', 'qty': '4', 'rate': '0.00', 'amount': '0.00',
			  },
			  {
				'days': 'Wednesday', 'sessionName': 'AM', 'attendedHrs': '3.00 hrs', 'fundedHrs': '3.00 hrs', 'qty': '4', 'rate': '0.00', 'amount': '0.00',
			  },
			  {
				'days': 'Thursday', 'sessionName': 'AM', 'attendedHrs': '3.00 hrs', 'fundedHrs': '3.00 hrs', 'qty': '4', 'rate': '0.00', 'amount': '0.00',
			  },
			  {
				'days': 'Friday', 'sessionName': 'AM', 'attendedHrs': '3.00 hrs', 'fundedHrs': '3.00 hrs', 'qty': '4', 'rate': '0.00', 'amount': '0.00',
			  },
		]
	dataSource = new MatTableDataSource(this.additionalItems);

	inputData = {
		'actionColumn': 'Actions',
		'buttonEvent': "output",
		'hasCheckBox': false,
    'hasViewMore': true,
    'viewMoreColumn': 'comment'

	}
	Actionbuttons = [
    { buttonLabel: "Edit", type: 'edit', buttonRoute: "", visibility: true },
		{ buttonLabel: "Delete", type: 'delete', buttonRoute: "", visibility: true }
	]

	// columnHeader = {
	// 	'days': 'Days', 'sessionName': 'Session Name', 'attendedHrs': 'Attended Hrs', 'fundedHrs': 'Funded Hrs', 'qty': 'Qty', 'rate': 'Rate', 'amount': 'Amount', 'Actions': 'Actions'
	// };

  columnHeader = {};


	constructor(protected router: Router,
		protected _route: ActivatedRoute,
		protected alertService: AlertService,
		protected apiService: ApiService,
		protected formbuilder: FormBuilder,
		protected dialog: MatDialog,
    protected util: UtilsService,
    protected filterService: AutocompleteFiltersService,
    protected permissionService: PermissionService,
		protected communicationService: CommunicationService) {

		super(router, _route, alertService, apiService, formbuilder, dialog, permissionService);
		// this.Form = this.formbuilder.group({});
		// this.Form.addControl('invoiceId', new FormControl(null));
		// this.Form.addControl('invoiceDate', new FormControl('', [Validators.required]));
		// this.Form.addControl('status', new FormControl('', [Validators.required]));
		// this.Form.addControl('dueDate', new FormControl('', [Validators.required]));
		// this.Form.addControl('child', new FormControl('', [Validators.required]));
		// this.Form.addControl('guardian', new FormControl('', [Validators.required]));
		// this.Form.addControl('address', new FormControl('', [Validators.required]));
		// this.Form.addControl('item', new FormControl('', [Validators.required]));
		// this.Form.addControl('selectDate', new FormControl('', [Validators.required]));
		// this.Form.addControl('amount', new FormControl('', [Validators.required]));

    this.Form.addControl('id', new FormControl(null));
    this.Form.addControl('trackingCode', new FormControl(null));
		this.Form.addControl('invoiceDate', new FormControl('', [Validators.required]));
		this.Form.addControl('invoiceStatus', new FormControl('Unsent', [Validators.required]));
		this.Form.addControl('dueDate', new FormControl('', [Validators.required]));
		this.Form.addControl('child', new FormControl('', [Validators.required]));
		this.Form.addControl('guardian', new FormControl('', [Validators.required]));
		this.Form.addControl('address', new FormControl('', [Validators.required]));
    // this.Form.addControl('addedDiscount', new FormControl('', [Validators.required]));
		this.Form.addControl('item', new FormControl(null));
		this.Form.addControl('selectDate', new FormControl(null));
		this.Form.addControl('additionalAmount', new FormControl(null));
    this.Form.addControl('quantity', new FormControl(null));
    this.Form.addControl('comment', new FormControl(null));
    this.Form.addControl('additionalLabel', new FormControl(null, [this.util.trimWhitespaceValidator]));

		// let date = new Date();
		// this.Form.get('matDate').setValue(date);
		// this.Form.get('date').setValue(date);

    this.columnHeader = {
      'itemLabel': 'Item', 'displayDate': 'Date', 'quantity': 'Qty', 'displayRate': 'Rate ' ,'displayTotalPrice': 'Amount', 'comment': 'Note', 'Actions': 'Actions',
    }

		this.tableConfigAndProps = {
			ActionButtons: this.Actionbuttons,
			inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
		};

		// this.listApi = config.base_url_slug +'view/childs';
		// this.getList()

		super.ngOnInit();
		// this.footerProps = {
		// 	'subButtonLabel': "Save Info",
		// 	'hasSubButton': true,
		// 	'hasbackButton': true,
    //   'backButtonLabel': 'Cancel',
		// 	'type': 'output'
		// };

    this.sub = this._route.params.subscribe(params =>
      {
          this.id = params['id'];
          this.type = params['type'];
          console.log(params);
          console.log(this.type);


            //   this.Form.controls['id'].disable()
          if (this.type == 'new') {
            this.getAdditionaltems();
            this.Form.get('quantity').setValue(1);
          }
            
          if (this.type != 'new') {
            this.detailApi = config.base_url_slug + 'v2/view/invoice/' + this.id;
            this.getDetail();
          }

          this.footerProps = {
            'subButtonLabel': "Save Info",
            'hasSubButton': true,
            'hasbackButton': true,
            'backButtonLabel': 'Cancel',
            'type': 'output'
          };

          // this.formApi = config.base_url_slug + 'update/invoice/' + this.id;
      });

      // Populate autcomplete data for additional items
        let item = this.Form.get('additionalLabel').valueChanges.pipe(
          startWith(''),
          map(value => this.filterService._filterAdditionalItems(value, this.additionalItemsList))
        );
        item.subscribe((d)=> {this.filteredAdditionalItems =  d; console.log(d)});
      // End

      this.editPermit = this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Invoice').update
	}
	ngOnInit() {
    this.getChildData();
    this.getAdditionaltems();

    let x = this.Form.get('child').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
    x.subscribe((d)=>
    this.filteredChildrens =  d);

    let min = new Date().setMonth(this.currentDate.getMonth() - 1); 
    let final = new Date(min).setDate(1);
    this.minDate = new Date(final);
    this.maxDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
		// this.formApi = config.base_url_slug + "add/childs/additional-item";

	}

  private _filter(value: any): any[] {
    console.log(value);
    let filterValue = '';
    console.log(this.Form.get('child').value);
    if (typeof(value) == 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.firstName.toLowerCase();
    }

    // this.setChildData();
      return this.childrens.filter(option => option.firstName.toLowerCase().includes(filterValue));

  }

	getCount(): any {
		let rate = 0;
		this.data.forEach(element => {
			rate = rate + parseInt(element.rate);
		});
		return rate;
	}

  checkForAmount(id) {
    let exist = this.additionalItemsList.find(x=> x.id == id);
    if (exist) {
      this.amount = exist.amount;
      this.Form.get('additionalAmount').setValue(this.amount);
      // this.Form.get('additionalAmount').disable();
    } else {
      this.amount = 0;
      this.Form.get('additionalAmount').setValue(null);
      // this.Form.get('additionalAmount').enable();
    }
  }

	onAddItem(): void {
    console.log(this.Form.get('item').value);
    let tPrice: any = (this.Form.get('additionalAmount').value * this.Form.get('quantity').value);
    let item = this.additionalItemsList.find(x => x.name == this.Form.get('additionalLabel').value);

    let Item = {
      item: this.Form.get('additionalLabel').value,
      additionalItemId: this.Form.get('item').value,
      quantity: this.Form.get('quantity').value,
      rate: this.Form.get('additionalAmount').value,
      displayRate: Number(this.Form.get('additionalAmount').value).toFixed(2),
      date: this.Form.get('selectDate').value,
      totalPrice: tPrice,
      displayTotalPrice: tPrice.toFixed(2),
      displayDate: moment(this.Form.get('selectDate').value).format(config.cmsDateFormat),
      itemLabel: this.Form.get('additionalLabel').value,
      // childId: (this.selectedChild.id || null),
      category: item.category,
      comment: this.Form.get('comment').value
    }

    if (this.mode == 'add') {
      let exist = this.additionalItems.find(x=> x.item == Item.item && x.date == Item.date);

      if (exist) {
        let existingRate = this.additionalItems[this.additionalItems.indexOf(exist)].rate;
  
        if (existingRate != Item.rate) {
          this.total += (Item.rate * Item.quantity);
          this.additionalItems.push({...Item});
        } else {
          this.additionalItems[this.additionalItems.indexOf(exist)].quantity += Item.quantity;
          // this.additionalItemsPostData[this.additionalItems.indexOf(exist)].quantity += Item.quantity;
          this.total += (existingRate * Item.quantity);
          this.additionalItems[this.additionalItems.indexOf(exist)].totalPrice += (existingRate * Item.quantity);
          this.additionalItems[this.additionalItems.indexOf(exist)].displayTotalPrice = this.additionalItems[this.additionalItems.indexOf(exist)].totalPrice.toFixed(2);
        }
  
  
      } else {
        // Item.rate = Item.rate.toFixed(2);
        // Item.totalPrice = Item.totalPrice.toFixed(2);
        this.total += (Item.rate * Item.quantity);
  
        this.additionalItems.push({...Item});
        // this.additionalItemsPostData.push({...Item});
      }
    } else {
      let prevQuantity = this.dataToEdit.quantity;
      let prevAmount = this.dataToEdit.rate;
      this.dataToEdit.item = Item.item;
      this.dataToEdit.itemLabel = Item.itemLabel;
      this.dataToEdit.rate = Number(Item.rate).toFixed(2);
      this.dataToEdit.displayTotalPrice = Item.displayTotalPrice;
      this.dataToEdit.quantity = Item.quantity;
      this.dataToEdit.category = Item.category;
      this.dataToEdit.comment = Item.comment;
      // this.dataToEdit.childId = Item.childId;

      this.total -= (prevQuantity * prevAmount);
      this.total += (Item.quantity * Number(Item.rate));
      this.mode = 'add';
    }


    // this.additionalItemsPostData.push({...Item});
    console.log(this.additionalItemsPostData);
    // debugger;
    // this.additionalItems.forEach(item => {
    //   if (!item.id) {
    //     item.rate = item.rate.toFixed(2);
    //   }
    // });



    // Updating table data
    this.dataSource = new MatTableDataSource(this.additionalItems);
		this.tableConfigAndProps = {
			ActionButtons: this.Actionbuttons,
			inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
		};

    this.clearAdditionalItem();
    this.Form.get('additionalAmount').enable();

	}

  onBlurEvent(event)
	{
    if (event.target.value < 0) {
      this.Form.get('additionalAmount').setValue(null);
      return;
    }

	  if (event.target.value.includes('.')) {
		  event.target.value = parseFloat(parseFloat(event.target.value).toFixed(2));
		  this.Form.get('additionalAmount').setValue(event.target.value);
	  } else {
		this.Form.get('additionalAmount').setValue(event.target.value);
	  }
	}

  afterDetail(): void
	{
    console.log(this.formDetail);
    this.total = 0;
    let status = this.formDetail.invoiceStatus;
    this.formDetail.invoiceStatus = this.getInvoiceStatus(this.formDetail);
    this.Form.patchValue(this.formDetail);
    this.Form.get('trackingCode').setValue(this.formDetail.id);
    this.additionalItems = [...this.formDetail.invoiceChildAdditionalItem];

    let childName = this.formDetail.childInfo.firstName;
    this.Form.get('child').setValue(childName);
    // this.additionalItemsPostData = [...this.formDetail.invoiceChildAdditionalItem];
    this.additionalItems.forEach( i => {
      this.total += (i.rate * i.quantity);
      // i.itemLabel = this.itemOptions.find(x => x.val == i.item).label;
      i.itemLabel = i.item;
      i.displayRate = typeof(i.rate) != 'string' ? i.rate.toFixed(2): i.rate;
      // i.totalPrice = i.totalPrice.toFixed(2);
      i.displayTotalPrice = i.totalPrice.toFixed(2);
      i.displayDate =  moment(i.date).format(config.cmsDateFormat);
    });
    console.log(this.additionalItems);

    let data = this.formDetail;


    // this.bookings = data.invoiceChildBookingDetail;

    // Calculate subtotal for booking sessions
    // this.bookings.forEach((book)=> {
    //   let subTotal = 0;
    //   book.invoiceChildBookingSessionDetail.forEach(session => {
    //     subTotal += session.price;
    //   });
    //   book['subTotal'] = subTotal;
    // });
    this.selectedChild = data.childInfo;

    if (this.Form.get('child').value != ''){
      let guardianName = data.guardian.name ? data.guardian.name : data.guardian.organizationName;
      this.Form.get('guardian').setValue(guardianName);
      this.Form.get('address').setValue(data.guardian.address);
    }

    this.Form.get('child').setValue(data.childInfo.firstName + ' ' + data.childInfo.lastName);
    this.Form.get('guardian').setValue(data.guardian.name);
    this.Form.get('address').setValue(data.guardian.address);
    // this.Form.get('addedDiscount').setValue(data.child.discount);

    if (this.type == 'edit') {
      this.Form.disable();
      this.Form.get('item').enable();
      this.Form.get('additionalLabel').enable();
      this.Form.get('selectDate').enable();
      this.Form.get('additionalAmount').enable();
      this.Form.get('quantity').enable();
      this.Form.get('comment').enable();
      this.Form.get('quantity').setValue(1);
    }

    if (this.type == 'view') {
      this.columnHeader = {
        'itemLabel': 'Item', 'displayDate': 'Date', 'quantity': 'Qty', 'displayRate': 'Rate ', 'displayTotalPrice': 'Amount',
      }
    } else {
      this.columnHeader = {
        'itemLabel': 'Item', 'displayDate': 'Date', 'quantity': 'Qty', 'displayRate': 'Rate ' ,'displayTotalPrice': 'Amount', 'Actions': 'Actions',
      }
    }

    // Updating table data
    this.dataSource = new MatTableDataSource(this.additionalItems);
    this.tableConfigAndProps = {
      ActionButtons: this.Actionbuttons,
      inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
    };

  }

  getAdditionaltems() {
  
    let endpoint = `${config.base_url_slug}view/global/additionalItem?branchId=${localStorage.getItem('branchId')}`;
    this.apiService.get(endpoint).then((res)=> {
  
      if (res.code == 200 || res.code == 201) {
        this.additionalItemsList = res.data.listing;
        this.filteredAdditionalItems = [...this.additionalItemsList];

        if (this.type != 'new') {
        // Setting additional items manually for autocomplete
          // let additionalItem = this.additionalItemsList.find(x => x.id == this.Form.get('additionalItemId').value);
          // this.Form.get('additionalLabel').setValue(additionalItem ? additionalItem.name : null);
        // End
        }

      }
  
    })
    .catch(err => {
      this.alertService.alertError(err.error.status, err.error.message).then(result => {
        // this.getList(this.filterUrl);
      })
    })
  }

  getInvoiceStatus(invoice) {
    let status = invoice.invoiceStatus;

    if (status == 'unSent') {
      return 'Unsent'
    }

    if (status == 'draft') {
      this.isDraft = true;
      return 'Draft'
    }

    if (status == 'publish' && !invoice.isExported) {
      return 'Approved'
    }

    if (status == 'publish' && invoice.isExported) {
      return 'Published'
    }

    return status;
  }

	actionButtonOutput(event) {

    console.log(event);
    if (this.type == 'view') return;

		if (event.item.type === "delete") {
			let heading = 'Delete Item?';
			let message = 'Are you sure you want to delete ?';
			let rightButton = 'Delete';
			let leftButton = 'Cancel';
			this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then(result => {
				if (result) {
					// for (var i = 0; i < this.data.length; i++) {
					// 	// if (this.data[i].id == event.row.id) {
					// 	// 	this.data.splice(i, 1);

					// 	// }
					// }
          // if (event.row.id) {

          // } else {
            let itemToDelete = this.additionalItems[this.additionalItems.indexOf(event.row)];
            // let itemToDelete = this.additionalItemsPostData[this.additionalItems.indexOf(event.row)];
            this.additionalItems.splice(this.additionalItems.indexOf(event.row), 1);
            // this.additionalItemsPostData.splice(this.additionalItemsPostData.indexOf(event.row), 1);
            this.total = this.total - (itemToDelete.quantity * itemToDelete.rate);
          // }
          console.log(this.additionalItems);
          console.log(this.additionalItemsPostData);

          // Updating table data
          this.dataSource = new MatTableDataSource(this.additionalItems);
          this.tableConfigAndProps = {
            ActionButtons: this.Actionbuttons,
            inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
          };

					// this.tableConfigAndProps = {
					// 	ActionButtons: this.Actionbuttons,
					// 	inputData: this.inputData,
					// 	columnHeader: this.columnHeader,
					// 	dataSource: new MatTableDataSource(this.data),
					// };

					// if (this.data.length == 0) {
					// 	this.Form.enable();
					// }
				}
			});
		} else {
      this.mode = 'edit';
      this.dataToEdit = event.row;
      let data = event.row;
      this.Form.get('item').setValue(data.item);
      this.Form.get('selectDate').setValue(data.date);
      this.Form.get('additionalAmount').setValue(data.rate);
      this.Form.get('quantity').setValue(data.quantity);
      this.Form.get('additionalLabel').setValue(data.item);
      this.Form.get('comment').setValue(data.comment);
    }
	}

  // Overiding datechange from Global Form

  dateChangeStatic(Form, controlName, event: MatDatepickerInputEvent<Date>)
  {
    if (moment(event.value).format('dddd') == 'Saturday' || moment(event.value).format('dddd') == 'Sunday')
    {
      Form.get(controlName).setValue(null);
      this.alertService.alertInfo('Warning', 'Selection not allowed on Saturday and Sunday');
      return;
    }

      const formattedDate = moment(new Date(event.value)).format(config.serverDateFormat);
      Form.get(controlName).setValue(formattedDate);

      let start = moment(Form.get('invoiceDate').value);
      if (controlName == 'invoiceDate') {
        let daysAdded = moment(start).add(8, 'days').format('YYYY-MM-DD');
        Form.get('dueDate').setValue(daysAdded);
      }
  }

  setValue() {
		let item = this.additionalItemsList.find(x => x.name == this.Form.get('additionalLabel').value);
		this.Form.get('item').setValue(item ? item.id : null);
    this.checkForAmount(item.id);
	}

  getField(field: any, form?: any): any
  {
      if (form)
      {
          return form.get(field).invalid;
      }
      return this.Form.get(field).invalid;
  }

  getErrorMessage(field: any, form?): any
	{
		if (form) {
			return form.get(field) && form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getInvoiceFieldMsg[field];
		}
		return this.Form.get(field) && this.Form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getInvoiceFieldMsg[field];
	}

  checkValidations()
	{
		if (this.Form.invalid)
		{
			//  console.log("its invalid ===>",this.childDoctorDetail)
			this.Form.markAllAsTouched()
			return false;
		}
		return true;
	}

	onSaveInfo() {

    //Check for Invalid controls
    console.log(this.Form);
    let url = '';
    let data = {};

    if (this.checkValidations() == false) {
			this.Form.setErrors({ 'invalid': true });
		}

    if (this.Form.invalid)
    {
      this.alertService.alertError('WARNING', 'Please fill the required data.');
      return;
    }

    if (this.additionalItems.length == 0)
    {
      this.alertService.alertError('WARNING', 'Please add the item to continue');
      return;
    }


    this.additionalItems.forEach(item => {
      delete item['itemLabel']; item.rate = Number(item.rate);
      item['childId'] = this.selectedChild.id
    });

    if (this.type == 'new') {
      url = 'staff/v2/generate/invoice';

      data = {
        "childId": this.selectedChild.id,
        "totalPrice": this.total,
        "branchId" : Number(this.branchId),
        "invoiceDate": this.Form.get('invoiceDate').value,
        "dueDate": this.Form.get('dueDate').value,
        "addtionalItems": this.additionalItems,
        "guardianId": this.selectedChild.guardians[0].id
      }
    } else {
      url = `staff/add/invoice/${this.id}/additionlItem`;
      // url = `staff/v2/add/invoice/${this.id}/additionlItem`;
      data = [
        {
        "childId": this.selectedChild.id,
        // "totalPrice": this.total,
        "addtionalItems": this.additionalItems
      }
     ];
  }
    console.log(data);
    // let data = {childId: this.formDetail.invoiceDetails.child.id, addtionalItems: this.additionalItemsPostData};

    this.apiService.post(url,data).then((res)=> {
      console.log(res);
      if (res.code == 200 || res.code == 201) {
        this.router.navigate(['main/finance/allInvoice']);
        this.alertService.alertSuccess('SUCCESS', 'Invoice Generated Successfully');
      }
    })
    .catch(err => console.log(err));


	}

  clearAdditionalItem() {
    this.mode = 'add';
    this.Form.get('item').setValue(null);
    this.Form.get('selectDate').setValue(null);
    this.Form.get('additionalAmount').setValue(null);
    this.Form.get('quantity').setValue(1);
    this.Form.get('additionalLabel').setValue(null);
    this.Form.get('comment').setValue(null);
  }

  // openEditBooking() {
  //   let dialogRef = this.dialog.open( BookingDetailComponent, {
  //     autoFocus: false,
  //     maxHeight: '90vh',
  //     width: '70%',
  //     data: {
  //       event: event,
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe(result =>
  //   {
  //     if (result.status == "success" && result.type == "add")
  //     {
  //       this.router.navigateByUrl('/main/staff');
  //     }
  //   })
  // }

  getChildData() {
    // let url = 'staff/v2/view/childs?branchId=' + this.branchId;
    let url = config.base_url_slug + `v4/view/childs?attributes=[{"key":"branchId","value": ${this.branchId}}]`;
    this.apiService.get(url).then((res)=> {
      console.log(res);
      if (res.code == 200 || res.code == 201) {
        this.childrens = res.data.listing;
        this.childrens.forEach(x=> x['name'] = x.firstName + ' ' + x.lastName);
        this.filteredChildrens = [...this.childrens];
        // this.router.navigate(['main/finance/allInvoice']);
        // this.alertService.alertSuccess('SUCCESS', 'Item Added Successfully');
      }
    })
    .catch(err => console.log(err));
  }

  setChildData() {
    this.selectedChild = this.Form.get('child').value;
    this.Form.get('child').setValue(this.selectedChild.name);
    console.log(this.selectedChild);
    console.log(this.Form.get('child').value);
    if (this.Form.get('child').value != ''){
      let guardianName = this.selectedChild.guardians[0].name ? this.selectedChild.guardians[0].name : this.selectedChild.guardians[0].organizationName;
      this.Form.get('guardian').setValue(guardianName);
      this.Form.get('address').setValue(this.selectedChild.guardians[0].address);
    } else {
      this.Form.get('guardian').setValue(null);
      this.Form.get('address').setValue(null);
    }

  }

  approveInvoice() {
    let endpoint = config.base_url_slug +'approve/invoice';
    let invoiceIds = [this.formDetail.id];
    let data = {invoiceIds: invoiceIds};
    this.apiService.post(endpoint, data, false).then((res)=> {
      let message = res.code == 200 ? 'Invoice Approved' : res.message;
        this.alertService.alertSuccess(res.status, message).then(result => {
          // this.getList(this.filterUrl);
          this.isDraft = false;
          this.getDetail();
        })
    })
    .catch(err => {
      this.alertService.alertError(err.error.status, err.error.message).then(result => {
        // this.getList(this.filterUrl);
        this.getDetail();
      })
    })
  }

  confirmInvoiceApprove() {
    let heading = 'Confirmation';
    let message = 'Are you sure you want to approve this adhoc invoice ?';
    let rightButton = 'Approve';
    let leftButton = 'Cancel';
  
    this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then((result) =>
      {
      if (result)
      {
      this.approveInvoice();      
      }
      });
    }

  goBack() {
    window.history.back();
  }

	afterSuccessfullyAdd() {
		// localStorage.removeItem('additionalItems')
		this.router.navigateByUrl('main/additional-items')
	}

  isAdditonalFieldsInvalid() {
    return ( this.Form.get('child').value == null ||
             this.Form.get('selectDate').value == null ||
             this.Form.get('additionalAmount').value == null ||
             this.Form.get('quantity').value == null)
  }

  goToEdit() {
    this.router.navigate([`main/finance/adHocInvoice/${this.id}/edit`]);
  }

}
