import { MultipleBookingsComponent } from './../../../shared/multiple-bookings/multiple-bookings.component';
import { Component, ElementRef, Input, OnInit, ViewChild, } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, CommunicationService, PermissionService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import * as moment from 'moment';
import { config } from 'src/config';
import * as momentTz from 'moment';
import { AdditionalItemsFormDialogComponent } from 'src/app/shared/additional-items-form-dialog/additional-items-form-dialog.component';

// import html2canvas from 'html2canvas';

@Component({
	selector: 'app-invoice',
	templateUrl: './invoice.component.html',
	styleUrls: ['/src/app/views/shared-style.scss', './invoice.component.scss']
})
export class InvoiceComponent extends GlobalFormComponent implements OnInit {
	Form: FormGroup;
	calendar: String = "assets/images/sdn/ic_event_24px.svg"
	tableConfigAndProps: any = {};
	footerProps: any;
	childs: any;
	buttonHeaderProps: any;
  bookings: any[] = [];
  additionalItems: any[] = [];
  additionalItemsPostData: any[] = [];
  total = 0;
  selectedTabIndex = 0;
  type = '';
  currentDate = new Date();
  amount = 0;
  timeZone = momentTz().tz(moment.tz.guess()).format('Z');
  minDate: any;
  maxDate: any;
  isDraft = false;
  sessionDays = [];
  weekWithDayList = [];
  childInvoiceList = [];
  tableRefs: any[] = [];
  singleAdditionalItems = [];
  @ViewChild('main') componentContainer: ElementRef;
  totalMonthlyDiscountedAmount = 0;
  totalPayableMonthly = 0;
  additionalItemSubTotal = 0;

	// dataSource = new MatTableDataSource();

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
	dataSource = new MatTableDataSource([]);

	inputData = {
		'actionColumn': 'Actions',
		'buttonEvent': "output",
		'hasCheckBox': false,
    'hasViewMore': true,
    'viewMoreColumn': 'comment'
    // 'hasViewMore': true
	}
	Actionbuttons = [
    { buttonLabel: "Edit", type: 'edit', buttonRoute: "", visibility: true },
		{ buttonLabel: "Delete", type: 'delete', buttonRoute: "",  visibility: true },
	]

  columnHeader = {
    'category': 'Category', 'itemLabel': 'Item', 'childLabel':'Child', 'displayDate': 'Date' ,'displayTotalPrice': 'Amount', 'quantity': 'Quantity', 'comment': 'Note', 'Actions': 'Actions',
  }

  amountObj: any = {};
  totalHourObj: any = {};
  fundedHoursObj: any = {};
  totalPayable: number;
  totalFundedHours: number;
  surchargePercentage: number;
  surChargeAmount: number;


	constructor(protected router: Router,
		protected _route: ActivatedRoute,
		protected alertService: AlertService,
		protected apiService: ApiService,
		protected formbuilder: FormBuilder,
		protected dialog: MatDialog,
    protected permissionService: PermissionService,
		protected communicationService: CommunicationService) {

		super(router, _route, alertService, apiService, formbuilder, dialog, permissionService);
		// this.Form = this.formbuilder.group({});
		this.Form.addControl('id', new FormControl(null));
    this.Form.addControl('trackingCode', new FormControl(null));
		this.Form.addControl('createdDate', new FormControl('', [Validators.required]));
		this.Form.addControl('invoiceStatus', new FormControl('', [Validators.required]));
		this.Form.addControl('dueDate', new FormControl('', [Validators.required]));
		this.Form.addControl('child', new FormControl('', [Validators.required]));
		this.Form.addControl('guardian', new FormControl('', [Validators.required]));
		this.Form.addControl('address', new FormControl('', [Validators.required]));
    this.Form.addControl('discount', new FormControl('', [Validators.required]));
		this.Form.addControl('item', new FormControl(null));
		this.Form.addControl('selectDate', new FormControl(null));
		this.Form.addControl('additionalAmount', new FormControl(null));
    this.Form.addControl('quantity', new FormControl(null));

		// let date = new Date();
		// this.Form.get('matDate').setValue(date);
		// this.Form.get('date').setValue(date);


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
          //   this.Form.controls['id'].disable()
        this.detailApi = config.base_url_slug + 'view/invoice/' + this.id;
        this.getDetail();
        this.formApi = config.base_url_slug + 'update/invoice/' + this.id;

        this.footerProps = {
          'subButtonLabel': "Save Info",
          'hasSubButton': true,
          'hasbackButton': true,
          'backButtonLabel': 'Cancel',
          'type': 'output'
        };
    });

    this.editPermit = this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Invoice').update
    console.log('called');
    

	}
	ngOnInit() {
    let min = new Date().setMonth(this.currentDate.getMonth() - 1); 
    let final = new Date(min).setDate(1);
    this.minDate = new Date(final);
    this.maxDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    // this.createData();
		// this.formApi = config.base_url_slug + "add/childs/additional-item";

	}



  afterDetail(): void
	{
    // this.total = 0;
    // console.log(this.formDetail);
    // let status = this.formDetail.invoice.invoiceStatus;
    // this.formDetail.invoice.invoiceStatus = this.getInvoiceStatus(this.formDetail.invoice);
    // this.Form.patchValue(this.formDetail.invoice);
    // this.additionalItems = [...this.formDetail.invoiceChildAdditionalItem];
    // this.additionalItemsPostData = [...this.formDetail.invoiceChildAdditionalItem];
    // this.additionalItems.forEach( i => {
    //   this.total += (i.rate * i.quantity);
    //   i.itemLabel = this.itemOptions.find(x => x.val == i.item).label;
    // });
    // console.log(this.additionalItems);

    // let data = this.formDetail.invoice;
    // this.bookings = data.invoiceChildBookingDetail;

    // // Calculate subtotal for booking sessions
    // this.bookings.forEach((book)=> {
    //   let subTotal = 0;

    //     book.invoiceChildBookingSessionDetail.forEach(session => {
    //       subTotal += session.totalPrice;

    //       if (!session.session) {
    //         session.session = {};
    //         session.session.name = '-';
    //       }
    //       session.day = session.day[0].toUpperCase() + session.day.substring(1);
    //       session.price = session.price.toFixed(2);
    //       session.totalPrice = session.totalPrice.toFixed(2);
    //       session.numberOfHours = session.numberOfHours.toFixed(2) + ' Hrs';
    //       session.fundedHours = session.fundedHours.toFixed(2) + ' Hrs';
    //     });
    //   book['subTotal'] = subTotal.toFixed(2);
    // });

    // this.Form.get('child').setValue(data.child.firstName + ' ' + data.child.lastName);
    // this.Form.get('guardian').setValue(data.child.childGuardianDetails[0].name);
    // this.Form.get('address').setValue(data.child.childGuardianDetails[0].address);

    // if (this.type == 'edit') {
    //   this.Form.disable();
    //   this.Form.get('item').enable();
    //   this.Form.get('selectDate').enable();
    //   this.Form.get('additionalAmount').enable();
    //   this.Form.get('quantity').enable();
    //   this.Form.get('quantity').setValue(1);
    // }

    this.formDetail.invoice.invoiceStatus = this.getInvoiceStatus(this.formDetail.invoice);
    
    this.createData();
  }

  setTabIndex(event) {
    this.selectedTabIndex = event.index;
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

  // getTabIndex(index) {
  //   this.selectedTabIndex = index;
  // }

  getProps(booking) {
    this.tableConfigAndProps = {
      ActionButtons: this.Actionbuttons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: new MatTableDataSource(booking.invoiceChildBookingSessionDetail),
    };

    return this.tableConfigAndProps;
  }

	getCount(): any {
		let rate = 0;
		this.data.forEach(element => {
			rate = rate + parseInt(element.rate);
		});
		return rate;
	}

	onAddItem(): void {
    console.log(this.Form.get('item').value);
    let Item = {
      item: this.Form.get('item').value.val,
      quantity: this.Form.get('quantity').value,
      rate: this.Form.get('additionalAmount').value,
      date: this.Form.get('selectDate').value,
      itemLabel: this.Form.get('item').value.label
    }

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

	actionButtonOutput(event, childInvoice?) {

    console.log(event);
    console.log(childInvoice);
    // let additionalItems = childInvoice.adhocAdditionalItem;
    
		if (event.item.type === "delete") {
			let heading = 'Delete Item?';
			let message = 'Are you sure you want to delete ?';
			let rightButton = 'Delete';
			let leftButton = 'Cancel';
			this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then(result => {
				if (result) {
          let itemToDelete = this.singleAdditionalItems[this.singleAdditionalItems.indexOf(event.row)];
          this.singleAdditionalItems.splice(this.singleAdditionalItems.indexOf(event.row), 1);
          // childInvoice.additionalItemSubTotal = childInvoice.additionalItemSubTotal - (itemToDelete.quantity * Number(itemToDelete.rate));
          this.additionalItemSubTotal = this.additionalItemSubTotal - (itemToDelete.quantity * Number(itemToDelete.rate));



          // Updating table data
          this.dataSource = new MatTableDataSource(this.singleAdditionalItems);

          this.tableConfigAndProps = {
            ActionButtons: this.Actionbuttons,
            inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
          };
				}
			});
		} else {
      this.openAdditionalItemDialog(childInvoice, event.item.type ,event.row);
    }
	}

  checkForAmount() {

    let exist = this.additionalItems.find(x=> x.item == this.Form.get('item').value.val);
    if (exist) {
      this.amount = exist.rate;
      this.Form.get('additionalAmount').setValue(this.amount);
      // this.Form.get('additionalAmount').disable();
    } else {
      this.amount = 0;
      this.Form.get('additionalAmount').setValue(null);
      // this.Form.get('additionalAmount').enable();
    }
  }

  approveInvoice() {
    let endpoint = config.base_url_slug +'approve/invoice';
    let invoiceIds = [this.formDetail.invoice.id];
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
    let message = 'Are you sure you want to approve this invoice ?';
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

	onSaveInfo() {

    let additionalItemsData = [];
    console.log(this.childInvoiceList);

    this.childInvoiceList.forEach((child)=> {

      child.adhocAdditionalItem.forEach(element => {
        // Set item to itemname if object
        element.item = (typeof element.item === 'string') ? element.item : element.item.name; 
      });

      let obj = {
        childId: child.childInfo.id,
        addtionalItems: this.singleAdditionalItems.filter(x => x.childId == child.childInfo.id),
      };
      
      additionalItemsData.push(obj)
    })
    
    // if (this.Form.invalid)
    // {
    //   this.alertService.alertError('WARNING', 'Please fill the required data.');
    //   return;
    // }

    // if (this.additionalItems.length == 0)
    // {
    //   this.alertService.alertError('WARNING', 'Please add the item to continue');
    //   return;
    // }
    
    console.log('saved')
    // this.additionalItems.forEach(item => delete item['itemLabel']);

    // let id = this.Form.get('id').value;
    let url = `staff/add/invoice/${this.id}/additionlItem`;
    // let data = {childId: this.formDetail.invoice.child.id, addtionalItems: this.additionalItems, timeZone: this.timeZone};
    let data = additionalItemsData;
    console.log(data);

    this.apiService.post(url,data).then((res)=> {
      console.log(res);
      if (res.code == 200) {
        this.router.navigate(['main/finance/allInvoice']);
        this.alertService.alertSuccess('SUCCESS', 'Additional Items saved successfully');
        console.log('success');
      }
    })
    .catch(err => console.log(err));
	}

  openEditBooking() {
    let dialogRef = this.dialog.open( MultipleBookingsComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      width: '100%',
      data: {
        event: event,
      }
    });

    // dialogRef.componentInstance.isPopup = true;

       dialogRef.componentInstance.invoiceData = this.formDetail;
       dialogRef.componentInstance.dialog = dialogRef;



    dialogRef.afterClosed().subscribe(result =>
    {
      if (result.status == "success" && result.type == "add")
      {
        this.router.navigateByUrl('/main/staff');
      }
    })
  }

  clearAdditionalItem() {
    this.Form.get('item').setValue(null);
    this.Form.get('selectDate').setValue(null);
    this.Form.get('additionalAmount').setValue(null);
    this.Form.get('quantity').setValue(1);
  }

  goBack() {
    window.history.back();
  }

  isAdditonalFieldsInvalid() {
    return ( this.Form.get('child').value == null ||
             this.Form.get('selectDate').value == null ||
             this.Form.get('additionalAmount').value == null ||
             this.Form.get('quantity').value == null)
  }

	afterSuccessfullyAdd() {
		// localStorage.removeItem('additionalItems')
		this.router.navigateByUrl('main/additional-items')
	}

  //--------------- New Implementation TS -------------//
  createData() {

    this.childInvoiceList = [];
    this.weekWithDayList = [];
    this.totalMonthlyDiscountedAmount = 0;
    this.totalPayableMonthly = 0;
    this.additionalItemSubTotal = 0;

    let days = ['monday','tuesday','wednesday','thursday','friday'];
    this.childInvoiceList = this.formDetail.invoiceUpdatedRespone;

    this.singleAdditionalItems = this.childInvoiceList[0].adhocAdditionalItem;
    console.log(this.singleAdditionalItems);
    

    this.totalPayable = 0;
    this.totalFundedHours = 0;              
    this.surchargePercentage = 0;
    this.surChargeAmount = 0;

    // Loop on each child
    this.childInvoiceList.forEach(child => {    
      
      child['totalMonthlyDiscountedAmount'] = 0;
      child['totalPayableMonthly'] = 0;
      child['additionalItemSubTotal'] = 0;
      // child['totalFundedHours'] = 0;
      // child['totalPayable'] = 0;
      // child['surchargePercentage'] = 0;
      // child['surChargeAmount'] = 0;

      // Combine current and previous month invoice into one array
      child.allMonthsInvoice = [...child.currentMonthInvoice, ...child.previousMonthInvoice];

      // Loop on bookings of child
      child.allMonthsInvoice.forEach(month => {       
        let obj = {};
        
        obj['weekHeaders'] = [];
        obj['weekDataRows'] = [];
        obj['amountCells'] = [];
        obj['totalHourCells'] = [];
        obj['fundedHoursCells'] = [];
        obj['amountObj'] = {};
        obj['totalHourObj'] = {};
        obj['fundedHoursObj'] = {};
        // obj['totalMonthlyDiscountedAmount'] = 0;
  
        // Loop on days array to pick value of each day object
        days.forEach((day, j) => {

          let weekObj = {};

          weekObj['day'] = day.slice(0,3);
          weekObj['weekCells'] = [];

          // Loop on week keys of a month
          Object.keys(month).forEach((key, index)=> {

            if (!['bookingEndDate','bookingStartDate','invoiceMonth','childBookingDetailId'].includes(key)) {
              // Create keys of week1, week2 week3 ...
              weekObj['week' + (index + 1) ] = month[key][day];

              if (month[key][day].sessions) {
                // setting each session starttime endtime to london timezone
                month[key][day].sessions.forEach(element => {
                  element.startTime = (element.startTime * 1000) + (new Date(element.startTime * 1000).getTimezoneOffset()*60000);
                  element.endTime = (element.endTime * 1000) + (new Date(element.endTime * 1000).getTimezoneOffset()*60000);
                });
              }
              weekObj['weekCells'].push(month[key][day]);

              if (month[key].surchargePercentage != 0 && this.surchargePercentage == 0) {
                this.surchargePercentage = month[key].surchargePercentage;                
              }
            }

            // Run this only once
            if (j == 0) {

              if (!['bookingEndDate','bookingStartDate','invoiceMonth','childBookingDetailId'].includes(key)) {

                this.totalFundedHours += Number(month[key]['totalFundedHours']);              
                this.totalPayable += Number(month[key]['totalPayable']);
                // this.surchargePercentage += Number(month[key]['surchargePercentage']);
                this.surChargeAmount += Number(month[key]['surChargeAmount']);

                // Setting keys for invoice splits
                obj['isSplitted'] = month[key].currentPayeePercentage < 100 ? true: false;
                obj['splitAmount'] = month[key].currentPayeePercentage;

                // child['totalMonthlyDiscountedAmount'] += Number(month[key].totalDiscountedAmount);
                this.totalMonthlyDiscountedAmount +=Number(month[key].totalDiscountedAmount);
                console.log('total monthly => ',this.totalMonthlyDiscountedAmount);
                
                // child['totalPayableMonthly'] += Number(month[key].totalPayable);
                this.totalPayableMonthly += Number(month[key].totalPayable);
                console.log('total Payable => ',this.totalPayableMonthly);

                
                // Setting keys for objects of (Amount, Total Hours, Funded Hours) Static Rows
                obj['amountObj']['week' + (index + 1) ] = month[key].totalSessionCharges;
                obj['totalHourObj']['week' + (index + 1) ] = month[key].totalHours;
                obj['fundedHoursObj']['week' + (index + 1) ] = month[key].totalFundedHours;
  
                let totalSession = Number(month[key].totalSessionCharges) + Number(month[key].totalAddsOnAmount);
                obj['amountCells'].push(totalSession.toFixed(2)); 
                obj['totalHourCells'].push(month[key].totalHours);
                obj['fundedHoursCells'].push(month[key].totalFundedHours);

                // Setting labels for table headers
                const [_, week, startDate, endDate] = key.split("_");

                // Formatting the variables
                // const weekLabel = `Week ${week}`;
                const start = month[key]['startOfTheWeekDate'] || startDate;
                const end = month[key]['endOfTheWeekDate'] || endDate;
                const datesLabel = `${moment(new Date(start)).format(config.cmsDateFormat)} - ${moment(new Date(end)).format(config.cmsDateFormat)}`;
                obj['weekHeaders'].push({datesLabel});
              }

              // Calculation of totals here
              // obj['totalFundedHours'] += Number(month[key]['totalFundedHours']);
              // obj['totalPayable'] += Number(month[key]['totalPayable']);
              // obj['surchargePercentage'] += Number(month[key]['surchargePercentage']);
              // obj['surChargeAmount'] += Number(month[key]['surChargeAmount']);


              // Setting table heading keys
              obj['bookingStartDate'] = month.bookingStartDate;
              obj['bookingEndDate'] = month.bookingEndDate;
              obj['invoiceMonth'] = month.invoiceMonth;

            }

          })

          obj['weekDataRows'].push(weekObj);

        });

        this.weekWithDayList.push(obj);

      });

      // Adding a new key to child, setting the prepared list for frontend
      child['childInvoiceTableList'] = this.weekWithDayList;
      this.weekWithDayList = [];

    });

    // Setting keys in additionalItems before setting tabledata
    // child.adhocAdditionalItem.forEach(element => {
    this.singleAdditionalItems.forEach(element => {
      // child['additionalItemSubTotal'] += Number(element.totalPrice);
      this.additionalItemSubTotal += Number(element.totalPrice);
      element['itemLabel'] = element.invoiceAdditionalItems.name;
      element['item'] = element.invoiceAdditionalItems;
      element['displayDate'] = moment(element.date).format(config.cmsDateFormat);
      element['displayTotalPrice'] = element.rate;
      element['note'] = 'note here';
      element['childLabel'] = element.childInfo.firstName + ' ' + element.childInfo.lastName;
      element['category'] = element.invoiceAdditionalItems.category == 'additional_item' ? 'Additional Item/Service' : 'Meal';
    });

    this.tableConfigAndProps.dataSource = new MatTableDataSource(this.singleAdditionalItems);

    // Creating array of objects for child
    const childArray = this.formDetail.childId.map((id, index) => ({
      childId: id,
      name: this.formDetail.childnames.split(',')[index].trim()
    }));

    this.formDetail['childArray'] = childArray;
    console.log(this.formDetail);
    
    // End

    console.log(this.childInvoiceList);
    
  }

  getTableConfig(additionalItems?) {
    
    // this.dataSource = new MatTableDataSource([]);
    // this.tableConfigAndProps = {
    //   ActionButtons: this.Actionbuttons,
    //   inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
    // }; 

    return this.tableConfigAndProps;

  }

  openAdditionalItemDialog(child, type, dataToEdit?) {

    // let additionalItems = child.adhocAdditionalItem;
    
    let dialogRef = this.dialog.open( AdditionalItemsFormDialogComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      width: '40%',
      data: {
        event: event,
      }
    });
    dialogRef.componentInstance.mode = this.type;
    dialogRef.componentInstance.children = this.formDetail.childArray;


    if (type == 'edit') {
      dialogRef.componentInstance.Form.patchValue(dataToEdit);
      dialogRef.componentInstance.type = 'edit';
    }


    dialogRef.afterClosed().subscribe(result =>
    {
      if (result.data)
      {
        if (type == 'edit') {
          let updatedData = result.data;
          let prevQuantity = dataToEdit.quantity;
          let prevAmount = dataToEdit.rate;
          dataToEdit.item = updatedData.item;
          dataToEdit.itemLabel = updatedData.itemLabel;
          dataToEdit.rate = Number(updatedData.rate).toFixed(2);
          dataToEdit.displayTotalPrice = updatedData.displayTotalPrice;
          dataToEdit.quantity = updatedData.quantity;
          dataToEdit.category = updatedData.category;
          dataToEdit.comment = updatedData.comment;
          dataToEdit.childId = updatedData.childId;
          dataToEdit.childLabel = updatedData.childLabel;

          // Update the subtotal
          // child.additionalItemSubTotal -= (prevQuantity * prevAmount);
          // child.additionalItemSubTotal += (updatedData.quantity * Number(updatedData.rate));
          this.additionalItemSubTotal -= (prevQuantity * prevAmount);
          this.additionalItemSubTotal += (updatedData.quantity * Number(updatedData.rate));

        } else {

          // Update in total and quantity if existing item is adding again on same date
          let exist = this.singleAdditionalItems.find(x=> x.additionalItemId == result.data.additionalItemId && x.date == result.data.date && x.childId == result.data.childId);

          if (exist) {
            let existingRate = this.singleAdditionalItems[this.singleAdditionalItems.indexOf(exist)].rate;
            this.singleAdditionalItems[this.singleAdditionalItems.indexOf(exist)].quantity += result.data.quantity;
            // child.additionalItemSubTotal += (existingRate * result.data.quantity);
            this.additionalItemSubTotal += (existingRate * result.data.quantity);
          } else {
            // child.additionalItemSubTotal += (result.data.rate * result.data.quantity);
            this.additionalItemSubTotal += (result.data.rate * result.data.quantity);

            this.singleAdditionalItems.push(result.data);
          }
        }

        // Updating table data
        this.dataSource = new MatTableDataSource(this.singleAdditionalItems);
        this.tableConfigAndProps = {
          ActionButtons: this.Actionbuttons,
          inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
        };
      }
    })
  }

  //-------------------------End -----------------------//

  getAddOnLabels(arr) {
    let txt = '';
    arr.forEach((element, i) => {
      txt += element.name;
      if (i != arr.length -1) {
       txt += ',';
      }
    });
    return txt;
  }

  goToEdit() {
    this.router.navigate([`main/finance/invoice/${this.id}/edit`]);
  }

}

