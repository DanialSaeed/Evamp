import { config } from './../../../../../config';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, PermissionService, CommunicationService } from 'src/app/services';
import { GlobalListComponent } from 'src/app/shared/global-list';
import * as moment from 'moment-timezone';
import * as momentTz from 'moment';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-all-invoice-listing',
  templateUrl: './all-invoice-listing.component.html',
  styleUrls: ['/src/app/views/shared-style.scss', './all-invoice-listing.component.scss']
})
export class AllInvoiceListingComponent extends GlobalListComponent implements OnInit, OnDestroy {

  /* ------- Table Component Variables -----------*/

  buttonHeaderProps: any;
  tableConfigAndProps = {};
  footerProps: any;
  dataSource = new MatTableDataSource([]);
  tabIndex = 0;
  selectedInvoices: any[] = [];
  timeZone = momentTz().tz(moment.tz.guess()).format('Z');
  zip = new JSZip();

  inputData = {
    'actionColumn': 'Actions',
    'buttonEvent': "output",
    'hasCheckBox': false,

  }
  Actionbuttons = [
    { buttonLabel: "Delete", type: 'delete', buttonRoute: "" },
  ]

  columnHeader = {
    'days': 'Days', 'sessionName': 'Session Name', 'attendedHrs': 'Attended Hrs', 'fundedHrs': 'Funded Hrs', 'qty': 'Qty', 'rate': 'Rate', 'amount': 'Amount', 'Actions': 'Actions'
  };

  headerButtons = [
    { buttonLabel: "Generate Invoice", color: "#E2AF2A", buttonRoute: "finance/generate-invoice/add", isMultiple: false, firstFormName: 'select-child', visibility: this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Invoice').create },
    { buttonLabel: "Ad Hoc Invoice", color: "#00AFBB", buttonRoute: "finance/adHocInvoice/add", isMultiple: false, firstFormName: 'select-child', visibility: this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Invoice').create },

    // { buttonLabel: "Marked as Approved", color: "#E2AF2A", buttonRoute: "child-Invoice/add", isMultiple: false, firstFormName: 'select-child', visibility: this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Invoice').create },

    // { buttonLabel: "Ad Hoc Invoice", color: "#00AFBB", buttonRoute: "child-Invoice/add", isMultiple: false, firstFormName: 'select-child', visibility: this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Invoice').create },

  ];

  /* ------- End -----------*/

  // ----- Variables for recurrsion ----//
    currentIndex = 0;
    splittedInvoicesArr: any[] = [];
    chunkSize = 20;
    numberOfChunks = 0;

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

    this.tableConfigAndProps = {
      ActionButtons: this.Actionbuttons,
      inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
    };
  }

  ngOnInit(): void {
    if (localStorage.getItem('invoiceTab')) {
      this.tabIndex = Number(localStorage.getItem('invoiceTab'));
      this.setTabIndex(this.tabIndex, false);
    }
  }

  setTabIndex(index, setTab) {
    this.tabIndex = index;
    if (setTab) {
      localStorage.setItem('invoiceTab', JSON.stringify(this.tabIndex));
    }

    // Refreshing Listing of selected Tab

    let tabName = this.tabIndex == 0 ? 'all' : this.tabIndex == 1 ? 'drafts' : this.tabIndex == 2 ? 'approved' : 'published';
    this.communicationService.updateInvoiceListing.next(tabName);

    // Setting listing of selected Tab

    switch (this.tabIndex) {
      case 0:
        this.buttonHeaderProps['ActionButtons'] = [
          { buttonLabel: "Generate Invoice", color: "#E2AF2A", buttonRoute: "finance/generate-invoice/add", isMultiple: false, firstFormName: 'select-child', visibility: this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Invoice').create },
          { buttonLabel: "Ad Hoc Invoice", color: "#00AFBB", buttonRoute: "finance/adHocInvoice/add", isMultiple: false, firstFormName: 'select-child', visibility: this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Invoice').create },
        ]
        break;

      case 1:
        this.buttonHeaderProps['ActionButtons'] = [
          { buttonLabel: "Download PDF", color: "#E2AF2A", buttonRoute: "", type: "output", visibility: false },
          { buttonLabel: "Marked as Approved", color: "#00AFBB", type: 'output', isMultiple: false, firstFormName: 'select-child', visibility: this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Invoice').update, disabled: true },
          { buttonLabel: "Delete", color: "#EB3026", type: 'output', isMultiple: false, firstFormName: 'select-child', visibility: this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Invoice').delete, disabled: true },
        ]
        break;

      case 2:
        this.buttonHeaderProps['ActionButtons'] = [
          { buttonLabel: "Download PDF", color: "#E2AF2A", buttonRoute: "", type: "output", visibility: false },
          { buttonLabel: "Export as CSV", color: "#E2AF2A", type: 'output', isMultiple: false, firstFormName: 'select-child', visibility: this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Invoice').read, disabled: true },
        ]
        break;

      case 3:
        this.buttonHeaderProps['ActionButtons'] = [
          { buttonLabel: "Download PDF", color: "#E2AF2A", buttonRoute: "", type: "output", visibility: false },
          // { buttonLabel: "Export as CSV", color: "#E2AF2A", buttonRoute: "child-Invoice/add", isMultiple: false, firstFormName: 'select-child', visibility: this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Invoice').create },
        ]
        break;

      default:
        break;
    }

  }

  getSelectedInvoices(invoices) {
    this.selectedInvoices = invoices;
    if (this.tabIndex == 1 || this.tabIndex == 2) {
      if (this.selectedInvoices.length == 0) {
        this.buttonHeaderProps.ActionButtons[1].disabled = true;
        this.buttonHeaderProps.ActionButtons[2].disabled = true;
      } else {
        delete this.buttonHeaderProps.ActionButtons[1]['disabled'];
        delete this.buttonHeaderProps.ActionButtons[2]['disabled'];
      }
    }
    this.setVisibilityPdf();
  }

  headerOutputAction(event) {
    console.log(event);
    let currentScreen = this.tabIndex == 1 ? 'drafts' : this.tabIndex == 2 ? 'approved' : 'published';

    if (this.selectedInvoices.length == 0) {
      return;
    }

    if (event.buttonLabel == 'Download PDF') {
      this.downloadSelectedPdf(currentScreen);
    }

    if (event.buttonLabel == 'Export as CSV') {
      this.initiateCSVExport();
    }

    if (event.buttonLabel == 'Marked as Approved') {
      this.confirmInvoiceApprove();
    }

    if (event.buttonLabel == 'Delete') {
      this.askDelete();
    }
  }

  approveInvoices() {
    let endpoint = config.base_url_slug + 'approve/invoice';
    let invoices = this.selectedInvoices.map(invoice => invoice.id);
    let data = { invoiceIds: invoices };
    this.apiService.post(endpoint, data, false).then((res) => {

      this.buttonHeaderProps.ActionButtons[0].visibility = false;
      this.buttonHeaderProps.ActionButtons[1].disabled = true;
      this.selectedInvoices = [];

      this.alertService.alertSuccess(res.status, 'Invoice(s) Approved').then(result => {
        this.communicationService.updateInvoiceListing.next();
        this.tabIndex = 2;
        this.setTabIndex(this.tabIndex, true)
      })
      console.log(res);
    })
      .catch(err => {
        this.alertService.alertError(err.error.status, err.error.message).then(result => {
          this.communicationService.updateInvoiceListing.next();
        })
      })
  }

  confirmInvoiceApprove() {
    let heading = 'Confirmation';
    let message = 'Are you sure you want to approve the invoice(s) ?';
    let rightButton = 'Approve';
    let leftButton = 'Cancel';

    this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then((result) => {
      if (result) {
        this.approveInvoices();
      }
    });
  }

  deleteInvoices() {
    let url = config.base_url_slug + 'v2/remove/invoice';
    let invoices = this.selectedInvoices.map(invoice => invoice.id);
    let data = { invoiceIds: invoices };
    this.apiService.post(url, data).then((res) => {
      console.log(res);
      if (res.code == 200 || res.code == 201) {

        // setTimeout(() => {
        this.communicationService.updateInvoiceListing.next('drafts');
        // }, 2500);

        // this.router.navigate(['main/finance/allInvoice']);
        // this.buttonHeaderProps.ActionButtons[0].visibility = false;
        this.buttonHeaderProps.ActionButtons[0].visibility = false;
        this.buttonHeaderProps.ActionButtons[1].disabled = true;
        this.buttonHeaderProps.ActionButtons[2].disabled = true;
        // this.selectedInvoices = [];
        // this.downloadPdf(res.data);
        // this.communicationService.updateInvoiceListing.next('approved');
        // this.alertService.alertSuccess('SUCCESS', 'Invoice Generated Successfully');
      } else {
        this.alertService.alertInfo('Message', 'Data not available');
      }
    })
      .catch(err => console.log(err));
  }

  initiateCSVExport() {

      // Logic for dividing 20 selected guardians into parts with seperate api calls

      const length = this.selectedInvoices.length;
      this.numberOfChunks = Math.ceil(length / this.chunkSize);
      console.log('Number of chunks:', this.numberOfChunks);
      const originalArray = this.selectedInvoices;
      const resultArray = [];
      for (let i = 0; i < originalArray.length; i += this.chunkSize) {
        const chunk = originalArray.slice(i, i + this.chunkSize);
        resultArray.push(chunk);
      }
  
      this.splittedInvoicesArr = resultArray;
  
      // End

      this.exportCsv();
  }

  csvUrls = [];
  async exportCsv() {
    let url = config.base_url_slug + 'generate/invoice-csv';
    let tempInvoices = this.splittedInvoicesArr[this.currentIndex];
    let invoices = tempInvoices.map(invoice => invoice.id);
    let data = { invoiceIds: invoices, timeZone: this.timeZone };
    this.apiService.post(url, data).then((res) => {
      if (res.code == 200 || res.code == 201 || res.code == 202) {
        console.log('exportCsv', res);

        
        this.csvUrls.push(res.data);
        if ((this.currentIndex + 1) == this.numberOfChunks) 
        {
          // this.router.navigate(['main/finance/allInvoice']);
          console.log('csv urls', this.csvUrls);
          this.buttonHeaderProps.ActionButtons[0].visibility = false;
          this.buttonHeaderProps.ActionButtons[1].disabled = true;
          this.selectedInvoices = [];
          this.fetchCSV();
          // setTimeout(()=> {
          //   this.downloadPdf(res.data);
          // }, 1000);
          this.communicationService.updateInvoiceListing.next('approved');
          setTimeout(() => {
            this.tabIndex = 3;
            this.setTabIndex(this.tabIndex, true)
          }, 300);
          // this.alertService.alertSuccess('SUCCESS', 'Invoice Generated Successfully');
        } 
        else 
        {
          // Recurrsion for another api call
          this.currentIndex += 1;
          // this.fetchCSV(res.data, this.currentIndex)
          setTimeout(()=> {
            // this.downloadPdf(res.data);
            this.exportCsv();
          }, 1000);
          // this.exportCsv();
        }

      }
    })
      .catch(err => console.log(err));
  }

  async fetchCSV()
  {
    let count = 0;
    for (let url of this.csvUrls) {
      await fetch(url)
      .then(response =>response.blob())
      .then(data => {
        count++;
        let fileName = url.split('/').pop();
        this.zip.file(fileName, data);
        if (count == this.csvUrls.length) {
          this.zip.generateAsync({type:"blob"}).then(function(content) {
              saveAs(content, "Invoices.zip");
          });
          this.zip.files = {};
        }
      });
    }
  }

  downloadPdf(url) {
    let link = document.createElement('a');
    link.href = url;
    link.download = url.substr(url.lastIndexOf('/') + 1);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadSelectedPdf(currentScreen) {
    let invoiceIds = this.selectedInvoices.map(x => x.id);
    let url = 'staff/download/invoice/pdf';
    this.apiService.post(url, { invoiceIds }).then((res) => {
      console.log(res);
      if (res.code == 200 || res.code == 201) {
        this.downloadPdf(res.data);
        // this.alertService.alertSuccess('SUCCESS', 'Invoice Deleted Successfully');
        this.communicationService.updateInvoiceListing.next(currentScreen);
        this.selectedInvoices = [];
        this.setVisibilityPdf();
      } else {
        this.alertService.alertError('ERROR', 'Data Not available');
      }
    })
      .catch(err => console.log(err));
  }

  setVisibilityPdf() {
    if (this.selectedInvoices.length > 0 && this.tabIndex != 0) {
      this.buttonHeaderProps['ActionButtons'][0].visibility = true;
    }
    else {
      this.buttonHeaderProps['ActionButtons'][0].visibility = false;
    }
  }

  askDelete() {
    let heading = 'Delete Item?';
    let message = 'Are you sure you want to delete ?';
    let rightButton = 'Delete';
    let leftButton = 'Cancel';
    this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then(result => {
      if (result) {
        this.deleteInvoices();
      }
    })

  }

  getUpdatedTab(indexTab) {
    this.setTabIndex(indexTab, true);
  }

  ngOnDestroy(): void {
    console.log('destroyy');
    // localStorage.removeItem('invoiceTab');
  }

}
