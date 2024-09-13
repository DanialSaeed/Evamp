import { GlobalListComponent } from 'src/app/shared/global-list';
import { Component, OnInit, Input, AfterViewChecked, AfterViewInit, EventEmitter, Output, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, PermissionService, CommunicationService } from 'src/app/services';
import { config } from 'src/config';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
declare let $: any;

@Component({
  selector: 'app-invoice-table',
  templateUrl: './invoice-table.component.html',
  styleUrls: ['./invoice-table.component.scss']
})
export class InvoiceTableComponent extends GlobalListComponent implements OnInit, OnDestroy {

  @Input() tab: any;
  @Output() selectedInvoices: EventEmitter<any> = new EventEmitter<any>();
  @Output() invoiceTab: EventEmitter<any> = new EventEmitter<any>();


  idAscend = false;
  dateAscend = false;
  childNameAsc = false;
  amountAsc = false;
  totalAmount = 0;

  sortBy = '';
  sortOrder = '';
  sub: Subscription;

  /* ------- Table Component Variables -----------*/

  buttonHeaderProps: any;
  tableConfigAndProps = {};
  footerProps: any;
  Actionbuttons: any[] = [];
  selectedInvoiceArr = [];
  headerCheckBoxValue: boolean = false;

  sortFields: any[] = [
    { asc: false, field: 'trackingCode' },
    { asc: false, field: 'createdDate' },
    { asc: false, field: 'childName' },
    //{asc: false, field: 'parentName'}, 
    { asc: false, field: 'amountAfterDiscount' }
  ];

  @ViewChild('table') table;
  // dataSource: any;

  // @Output() onDeleteShift: EventEmitter<any> = new EventEmitter<any>();
  layoutAlign = "start start"
  headerProps = {
    searchConfig: { label: 'Enter Child Name or Parent Name', key: 'branchId', value: '', extraControl: 'invoiceId', extraControlLabel: 'Enter Invoice Id' },
    builtInFilters: { key: 'branchId', value: localStorage.getItem('branchId') },
    filterArray: [
      {
        label: 'Select Room',
        type: 'search',
        key: 'roomId',
        selected: 'All',
        options: this.rooms
      },
    ],
    fxFlexIn: "310px"
  };

  inputData = {
    'actionColumn': 'Actions',
    'buttonEvent': "output",
    'hasCheckBox': true,
    'checkBoxCol': "checkbox",
    'onlyOneCheck': false,
    'hasHeaderCheckBox': true,

  }

  columnHeader: any = {
    'trackingCode': 'Invoice ID', 'invoiceDate': 'Date', 'childName': 'Child', 'parentName': 'Parent', 'roomNames': 'Room', 'amountAfterDiscountLabel': 'Amount', 'invoiceType': 'Type', 'invoiceStatus': 'Status', 'Actions': 'Actions'
  };

  headerButtons = [
    // { buttonLabel: "Export as CSV", color: "#E2AF2A", buttonRoute: "", type: "output", visibility: false },
    { buttonLabel: "Generate Invoice", color: "#E2AF2A", buttonRoute: "finance/generate-invoice/add", isMultiple: false, firstFormName: 'select-child', visibility: this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Booking Manager').create },
    { buttonLabel: "Ad Hoc Invoice", color: "#00AFBB", buttonRoute: "finance/adHocInvoice/add", isMultiple: false, firstFormName: 'select-child', visibility: this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Booking Manager').create },
  ];
  filterValues: { searchValue: any; extraValue: any; dateValue: any; startDateValue: any; endDateValue: any; tab: any };
  selectedTotalAmount: any = 0;

  /* ------- End -----------*/

  constructor(private dialog: MatDialog, protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected permissionService: PermissionService, protected communicationService: CommunicationService) {
    super(router, apiService, alertService, permissionService);

    this.buttonHeaderProps = {
      headingLabel: "All Invoices",
      ActionButtons: this.headerButtons,
      hasButton: true,
      hasHeading: true,
      labelMargin: '0px',
      float: 'right',
      textclass: 'text-bolder text-color',
      buttonsMargin: '0px 10px 0px',
      margin: '10px'
    };

    this.listApi = config.base_url_slug + 'fetch/invoice';

    this.tableConfigAndProps = {
      ActionButtons: this.Actionbuttons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: new MatTableDataSource(this.dataItems),
      onlyDelete: false,
      hasDownload: true
    };

    // this.communicationService.getlistingFilters.next({type: 'set', list: 'invoiceFilters'});
    super.ngOnInit();
  }

  filnalFilters(event): void {
    console.log(event);
    let filterUrl = '';
    // if (event.date)
    //     {
    //   const urlParams = new URLSearchParams(event.date);
    //   const dt = urlParams.get('date');
    //   event.filter.push({'key': 'status', 'value': 'unset' });
    //     }

    if (event.filter.length > 0) {
      filterUrl = '&attributes=' + JSON.stringify(event.filter);
    }
    else if (event.filter.length == 0) {
      filterUrl = '&attributes=[]';
    }

    if (event.sort) {
      filterUrl = filterUrl + event.sort;
    }
    if (event.range) {
      filterUrl = filterUrl + event.range;
    }
    if (event.search) {
      filterUrl = filterUrl + event.search;
      this.paginationUrl = '&page=' + '1' + '&perPage=' + this.perPage;
    }

    if (event.extraValue) {
      filterUrl = filterUrl + '&invoiceId=' + event.extraValue;
    }

    let roomObj = event.filter.find(x => x.key == 'roomId')
    if (event.filter.length > 0 && roomObj) {
      filterUrl = '&roomId=' + roomObj.value;
    }

    // Checks for tabs (url queryParams)
    let param = '';
    switch (this.tab) {
      case 'drafts':
        param = '&invoiceStatus=draft&isExported=0';
        this.selectedTotalAmount = 0;
        this.selectedInvoiceArr = [];
        break;

      case 'approved':
        param = '&invoiceStatus=publish&isExported=0';
        break;

      case 'published':
        param = '&isExported=1';
        break;

      default:
        param = '';
        break;
    }

    filterUrl += param;

    this.filterValues = {
      searchValue: event.searchValue,
      extraValue: event.extraValue,
      dateValue: event.dateValue,
      startDateValue: event.startDateValue,
      endDateValue: event.endDateValue,
      tab: this.tab
    }
    // localStorage.setItem('invoiceFilters', JSON.stringify(filterValues));


    // if (this.tab == 'approved' || this.tab == 'published') {
    //   filterUrl = filterUrl + '&invoiceStatus=sent';
    // } else if ( this.tab == 'drafts' ) {
    //   filterUrl = filterUrl + '&invoiceStatus=unSent';
    // }

    this.getList(filterUrl)
  }

  afterRoom() {
    this.rooms.unshift({ label: 'All', value: 'All' });
    this.headerProps.filterArray[0].options = this.rooms;
  }

  afterListResponse(): void {
    this.tableConfigAndProps['dataSource'] = new MatTableDataSource(this.dataItems);
    this.tableConfigAndProps['ActionButtons'] = this.Actionbuttons;
    this.tableConfigAndProps['pagination'] = this.pagination;
    this.totalAmount = this.baseResponse?.aggregation?.amountAfterDiscount;

    console.log(this.tableConfigAndProps);

    this.dataItems.forEach((invoice) => {
      invoice.childName = invoice.childNames.length != 0 ? invoice.childNames.join(', ') : '';
      invoice.parentName = invoice.guardianName;
      // this.totalAmount += invoice.amountAfterDiscount;
      invoice.amountAfterDiscountLabel = '£' + invoice.amountAfterDiscount.toFixed(2);
      invoice.createdDate = moment(new Date(invoice.createdDate)).format(config.cmsDateFormat);
      invoice.invoiceDate = invoice.invoiceDate ? moment(new Date(invoice.invoiceDate)).format(config.cmsDateFormat) : '-';
      invoice.invoiceType = invoice.invoiceType == 'regular' ? 'Regular' : 'AdHoc';
      invoice.roomNames = invoice.roomNames ? invoice.roomNames : '-';
      invoice.invoiceStatus = this.getType(invoice);

      if (localStorage.getItem('invoiceRow') && invoice.id == localStorage.getItem('invoiceRow')) {
        invoice['highlight'] = 'rgb(222, 244, 255)';
      }
    })

    // this.selectedInvoiceArr = this.selectedInvoiceArr.filter((element) => this.dataItems.some((item) => item.id === element.id));
    // this.selectedInvoices.emit(this.selectedInvoiceArr);

    // this.selectedInvoiceArr.forEach(x => {
    //   let invoice = this.dataItems.find(d => d.id != x.id);

    //   if (invoice) {
    //     this.selectedInvoiceArr.splice(this.selectedInvoiceArr.indexOf(invoice),1);
    //   }
    // })
  }

  getType(invoice) {
    switch (invoice.invoiceStatus) {
      case 'draft':
        return 'Draft'

      case 'publish':
        let status = invoice.isExported ? 'Published' : 'Approved'
        return status

      default:
        return ''
    }
  }

  ngOnInit(): void {
    console.log(this.tab);

    // Refresh Invoice List

    this.sub = this.communicationService.updateInvoiceListing.subscribe((data) => {

      if (data) {
        if (this.tab == data) {
          this.selectedTotalAmount = 0;
          this.getList(this.filterUrl);
        }
      } else {
        this.getList(this.filterUrl);
      }
      this.table.headerCheckBoxValue = false;
      this.selectedInvoiceArr = [];
    });

    // Checks for tabs (columns)

    if (this.tab != 'all') {
      this.tableConfigAndProps['columnHeader'] = {
        'checkbox': '', 'trackingCode': 'Invoice ID', 'invoiceDate': 'Date', 'childName': 'Child', 'parentName': 'Parent', 'roomNames': 'Room', 'amountAfterDiscountLabel': 'Amount', 'invoiceType': 'Type', 'invoiceStatus': 'Status', 'Actions': 'Actions'
      };
    }

    // Checks for tabs (Dropdown Options)

    switch (this.tab) {
      case 'drafts':
        this.Actionbuttons = [
          // { buttonLabel: "View", type: 'view', buttonRoute: "finance/invoice", visibility: this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Invoice').read },
          { buttonLabel: "Edit", type: 'edit', buttonRoute: "finance/invoice", visibility: this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Invoice').update },
          { buttonLabel: "Delete", type: 'delete', buttonRoute: "finance/invoice", visibility: this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Invoice').delete },
          { buttonLabel: "Download PDF", type: 'download', buttonRoute: "finance/invoice", visibility: this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Invoice').read },
        ]
        this.tableConfigAndProps['onlyDelete'] = true;
        this.tableConfigAndProps['hasApprove'] = true;

        break;

      default:
        this.Actionbuttons = [
          { buttonLabel: "Edit", type: 'edit', buttonRoute: "finance/invoice", visibility: this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Invoice').read },
          { buttonLabel: "Download PDF", type: 'download', buttonRoute: "finance/invoice", visibility: this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Invoice').read },
        ]
        break;
    }
    this.tableConfigAndProps['hasEdit'] = true;

    if (localStorage.getItem('invoiceFilters')) {

      let data = JSON.parse(localStorage.getItem('invoiceFilters'));
      if (data.tab == this.tab) {
        this.headerProps.searchConfig['searchValue'] = data.searchValue ? data.searchValue : null;
        this.headerProps.searchConfig['dateValue'] = data.dateValue ? data.dateValue : null;
        this.headerProps.searchConfig['extraValue'] = data.extraValue ? data.extraValue : null;
        this.headerProps.searchConfig['startDateValue'] = data.startDateValue ? data.startDateValue : null;
        this.headerProps.searchConfig['endDateValue'] = data.endDateValue ? data.endDateValue : null;
      }
    }

    this.getRoomsforDropdown(localStorage.getItem('branchId'));
  }

  // onSelectedCheckBoxAllEmit(input)
  // {


  //   if (input) {
  //     this.selectedInvoiceArr = this.dataItems;
  //   } else {
  //     this.selectedInvoiceArr = [];
  //   }
  //   console.log(this.selectedInvoiceArr);
  //   this.selectedInvoices.emit(this.selectedInvoiceArr);

  // console.log(input);
  // this.dataItems.forEach(item => {
  //   let child = this.selectedInvoiceArr.find(t => item.id === t.id);
  //   if (child)
  //   {
  //     if(input == false)
  //     {
  //       const index = this.selectedInvoiceArr.indexOf(child, 0);
  //       if (index > -1) {
  //         this.selectedInvoiceArr.splice(index, 1);
  //       }
  //     }
  //   }
  //   else
  //   {
  //     this.selectedInvoiceArr.push({
  //       'id': item.id,
  //       'name': item.name,
  //       'room': item.room
  //     });
  //   }
  // });
  // }

  onSelectedCheckBoxAllEmit(input) {
    this.dataItems.forEach(item => {
      let child = this.selectedInvoiceArr.find(t => item.id === t.id);
      if (child) {
        if (input == false) {
          const index = this.selectedInvoiceArr.indexOf(child, 0);
          if (index > -1) {
            this.selectedInvoiceArr.splice(index, 1);
          }
        }
      }
      else {
        this.selectedInvoiceArr.push(item);
      }
    });
    console.log(this.selectedInvoiceArr);

    if (this.selectedInvoiceArr.length > 0) {
      this.selectedInvoices.emit(this.selectedInvoiceArr);
    } else {
      this.selectedInvoices.emit([]);
    }

    if (this.tab == 'drafts') {
      this.selectedTotalAmount = 0;
      this.selectedInvoiceArr.forEach(invoice => {
        this.selectedTotalAmount += invoice.amountAfterDiscount;
      })
    }
  }

  onSelectedCheckBoxEmit(res) {
    console.log(res);
    if (res.checked == true) {
      console.log(res);
      let child = this.selectedInvoiceArr.find(t => res.element.id === t.id);
      if (!child) {
        this.selectedInvoiceArr.push(res.element);
      }
    } else {
      for (var i = 0; i < this.selectedInvoiceArr.length; i++) {
        if (this.selectedInvoiceArr[i].id == res.element.id) {
          this.selectedInvoiceArr.splice(i, 1);
          break;
        }
      }
    }
    console.log(this.selectedInvoiceArr);

    if (this.tab == 'drafts') {
      this.selectedTotalAmount = 0;
      this.selectedInvoiceArr.forEach(invoice => {
        this.selectedTotalAmount += invoice.amountAfterDiscount;
      })
    }


    this.selectedInvoices.emit(this.selectedInvoiceArr);
    localStorage.setItem(this.tab, JSON.stringify(this.selectedInvoiceArr));
  }


  onHeaderCheckBoxValueEmit(input) {
    this.headerCheckBoxValue = input;
    // this.onSelectedCheckBoxAllEmit(input);
  }

  actionButtonOutput(e) {
    console.log(e);
    // now click on row will open the viewPdf link and action will open edit section
    let type = e.item ? e.item.type : 'viewPdf';

    switch (type) {

      case 'view':
        this.goToView(e);
        break;

      case 'edit':
        this.goToEdit(e);
        break;

      case 'viewPdf':
        this.openPdfWindow(e.row.invoiceDownloadUrl);
        break;

      case 'approve':
        this.confirmInvoiceApprove(e);
        break;

      case 'delete':
        this.deleteInvoice(e.row.id);
        break;

      case 'download':
        this.downloadPdf(e.row.invoiceDownloadUrl);
        break;

      case 'regenerate':
        this.regenerateInvoice(e.row.id);
        break;

      default:
        break;
    }

    localStorage.setItem('invoiceRow', e.row.id);

    // this.filterValues['type'] = 'get';
    // this.filterValues['list'] = 'invoiceFilters';
    // this.communicationService.getlistingFilters.next(this.filterValues);
    localStorage.setItem('invoiceFilters', JSON.stringify(this.filterValues));
    // localStorage.setItem('invoices', JSON.stringify({search: this.headerProps?.searchConfig?.value, invoice: this.headerProps?.searchConfig?.extraControlValue  }));
  }

  downloadPdf(url) {
    let link = document.createElement('a');
    link.href = url;
    link.download = url.substr(url.lastIndexOf('/') + 1);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  openPdfWindow(url) {
    // let myWindow = window.open("", "PDF View", "width=600,height=600");
    // myWindow.document.write(`<iframe src="https://sdn-staging.s3.eu-west-2.amazonaws.com/invoiceStaging/LeaveDate ChildTwo_February_2023_2785.pdf" frameborder="0" width="900" height="900"></iframe>`);
    window.open(`https://docs.google.com/viewerng/viewer?url=${url}`);
  }

  goToView(e) {
    if (e.row.invoiceType == 'Regular') {
      this.router.navigate([`main/finance/invoice/${e.row.id}/view`]);
    } else {
      this.router.navigate([`main/finance/adHocInvoice/${e.row.id}/view`]);
    }
  }

  goToEdit(e) {
    if (e.row.invoiceType == 'Regular') {
      this.router.navigate([`main/finance/invoice/${e.row.id}/edit`]);
    } else {
      this.router.navigate([`main/finance/adHocInvoice/${e.row.id}/edit`]);
    }
    $('.main-layout').mCustomScrollbar("update");
  }

  deleteInvoice(id) {
    let url = `staff/remove/invoice/${id}`;
    this.apiService.delete(url).then((res) => {
      console.log(res);
      if (res.code == 200 || res.code == 201) {
        this.alertService.alertSuccess('SUCCESS', 'Invoice Deleted Successfully');
        this.getList(this.filterUrl);
      }
    })
      .catch(err => console.log(err));
  }

  regenerateInvoice(id) {
    let url = `staff/generate/regenerateInvoice`;
    this.apiService.post(url, { invoiceId: id }).then((res) => {
      console.log(res);
      if (res.code == 200 || res.code == 201) {
        this.alertService.alertSuccess('SUCCESS', 'Invoice regenerated Successfully');
        this.getList(this.filterUrl);
      }
    })
      .catch(err => console.log(err));
  }

  approveInvoice(item) {
    let endpoint = config.base_url_slug + 'approve/invoice';
    let invoiceIds = [item.row.id];
    let data = { invoiceIds: invoiceIds };
    this.apiService.post(endpoint, data, false).then((res) => {
      let message = res.code == 200 ? 'Invoice Approved' : res.message;
      this.invoiceTab.emit(2);
      this.alertService.alertSuccess(res.status, message).then(result => {
        this.getList(this.filterUrl);
        this.selectedTotalAmount = 0;
      })
    })
      .catch(err => {
        this.alertService.alertError(err.error.status, err.error.message).then(result => {
          this.getList(this.filterUrl);
        })
      })
  }

  confirmInvoiceApprove(item) {
    let heading = 'Confirmation';
    let message = 'Are you sure you want to approve the invoice(s) ?';
    let rightButton = 'Approve';
    let leftButton = 'Cancel';

    this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then((result) => {
      if (result) {
        this.approveInvoice(item);
      }
    });
  }

  sortColumn(e) {

    this.sortBy = e.field;

    if (e.field == 'trackingCode') {
      this.sortBy = 'id';
    }

    if (e.field == 'childName') {
      this.sortBy = 'childNames';
    }

    if (e.field == 'parentName') {
      this.sortBy = 'lastName';
    }

    // this.sortUrl = e.order != 'def' ? `&sortBy=${this.sortBy}&sortOrder=${e.order}` : '';

    this.sortUrl = `&sortBy=${this.sortBy}&sortOrder=${e.order}`;
    this.getList(this.filterUrl);
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.sub.unsubscribe();

  }

}
