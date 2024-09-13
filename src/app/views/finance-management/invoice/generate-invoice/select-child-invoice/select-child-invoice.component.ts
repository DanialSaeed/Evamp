import { GlobalListComponent } from './../../../../../shared/global-list';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray } from '@angular/forms';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { addDays } from 'date-fns';
import * as moment from 'moment';
import { AlertService, ApiService, CommunicationService } from 'src/app/services';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { config } from 'src/config';
import { getSpecieFieldMsg } from '../../../../../shared/field-validation-messages';
import { MatTableDataSource } from '@angular/material/table';

export class selectedItem
{
    id: string;
    name: string;
    room?: string;
}

@Component({
	selector: 'app-select-child-invoice',
	templateUrl: './select-child-invoice.component.html',
	styleUrls: ['/src/app/views/shared-style.scss', './select-child-invoice.scss']
})
export class SelectChildInvoiceComponent extends GlobalListComponent implements OnInit
{
  //Inputs & Outputs
  @Input() pageHeading: any;
  @Input() filterHeading: any;
  @Input() columnHeader: any;
  @Input() footerProps: any;
  @Input() filters: any; // array of object > key : value
  @Input() headerProps: any;
  @Input() hasHeaderCheckBox: any;
  @Input() inputData : any;
  @Input() selectedItems: selectedItem[] = [];
  @Output() emitSelectedItems: EventEmitter<any> = new EventEmitter<any>();
  @Output() emitSelectionDone: EventEmitter<any> = new EventEmitter<any>();

  @Input() invoiceData: any;

  headerCheckBoxValue: boolean = false;
  customBtnLabel = 'Generate Invoice';

  tableConfigAndProps = {};
  checkedBoxes = 0;
  checkedOne = null;
  dataSource = new MatTableDataSource();
  layoutAlign = "start start";

  // variables for recurrsion
  currentIndex = 0;
  splittedGuradiansArr: any[] = [];
  chunkSize = 20;
  numberOfChunks = 0;

  constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService,
    protected communicationService: CommunicationService) {
    super(router, apiService, alertService);
    this.actionButtons = [];
    this.customMessage = 'No children have active booking(s) in this period';
  }

  ngOnInit()
  {
    // https://api-internal.sdnapp.net/api/v1/sdn/staff/v3/view/childForInvoices
    this.listApi = config.base_url_slug +'v3/view/childForInvoices';
    this.pageHeading = this.pageHeading !== 'undefined' && this.pageHeading !== null ? this.pageHeading : "Select Parents";
    this.filterHeading = this.filterHeading !== 'undefined' && this.filterHeading !== null ? this.filterHeading : "Enter Child Name or Parent Name";
    this.hasHeaderCheckBox = this.hasHeaderCheckBox !== 'undefined' && this.hasHeaderCheckBox !== null ? this.hasHeaderCheckBox : false;
    this.footerProps =  this.footerProps !== 'undefined' && this.footerProps !== null ? this.footerProps : {
      'subButtonLabel': "Add Booking",
      'hasSubButton': true,
      'type': 'output'
    };

    this.headerProps =  this.headerProps !== 'undefined' && this.headerProps !== null ? this.headerProps : {
      searchConfig: {
        label: this.filterHeading,
        key: 'branchId',
        value: '',
      },
      builtInFilters: {
        key: 'branchId',
        value: localStorage.getItem('branchId')
      },
      filterArray:[],
      fxFlexInSearch:"170px",
    };

    this.columnHeader = this.columnHeader !== 'undefined' && this.filters !== null ? this.columnHeader : {'checkbox': '', 'id': 'ID'};
    this.filters = this.filters !== 'undefined' && this.filters !== null ? this.filters : [{ 'key': 'activeBooking', 'value': false }];

    this.inputData = this.inputData !== 'undefined' && this.inputData !== null ? this.inputData : {
      'roundedTable': false,
      'hasSwitch': false,
      'buttonEvent': "output",
      'hasCheckBox': true,
      'checkBoxCol': "checkbox",
      'onlyOneCheck': true,
    };

    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: this.dataSource,
      checkedBoxes:this.checkedBoxes,
      checkedOne : this.checkedOne,
      pagination: this.pagination
    };

    console.log(this.invoiceData);
    

    super.ngOnInit();
  }

  afterListResponse(): void {
    this.dataItems.forEach(element => {
      let child;
      element['isSeparateInvoice'] = element.generateSeperateInvoice == '1' ? true: false;
      if(this.selectedItems != null && this.selectedItems.length > 0)
      {
        child = this.selectedItems?.find(t => element.id === t.id);
      }
      if (child)
      {
        element['checkbox'] = true;
        element['fillBackground'] = true;
        element['isSeparateInvoice'] = true;
      }
      // else{
      //   element['isSeparateInvoice'] = false;
      // }
      this.selectedItems?.forEach(item => {
        if (item['id'] === element.id) {
          element['checkbox'] = true;
          element['fillBackground'] = true;
          element['isSeparateInvoice'] = true;
          if(!child)
          {
            this.selectedItems.push({
              'id': element.id,
              'name': element.name,
              'room': element.room
            });
          }
        }
      });
      // element['seprateInvoice'] = element.type == 'primary' ? true : false;
      element['seprateInvoice'] = element.childFullName.includes(',') ? true : false;
    });
    console.log(this.dataItems);
    

    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: new MatTableDataSource(this.dataItems),
      checkedBoxes:this.checkedBoxes,
      checkedOne : this.checkedOne,
      pagination: this.pagination
    };
  }

  onSelectedCheckBoxAllEmit(input)
  {
      this.dataItems.forEach(item => {
        let child = this.selectedItems.find(t => item.id === t.id);
        if (child)
        {
          if(input == false)
          {
            const index = this.selectedItems.indexOf(child, 0);
            if (index > -1) {
              this.selectedItems.splice(index, 1);
            }
          }
        }
        else
        {
          this.selectedItems.push(item);
        }
      });

      if (this.selectedItems.length > 0) {
        this.invoiceData.guardianData = this.selectedItems;
        // this.emitSelectedItems.emit(this.selectedItems);
      } else {
        this.invoiceData.guardianData = [];
      }
  }

  onSelectedCheckBoxEmit(res) {
    if (res.checked == true) {
      let child = this.selectedItems.find(t => res.element.id === t.id);
      if (!child)
      {
        this.selectedItems.push(res.element);
      }
    } else {
      for (var i = 0; i < this.selectedItems.length; i++) {
        if (this.selectedItems[i].id == res.element.id) {
          this.selectedItems.splice(i, 1);
          break;
        }
      }
    }

    if (this.selectedItems.length > 0) {
      this.invoiceData.guardianData = this.selectedItems;
      // this.emitSelectedItems.emit(this.selectedItems); // this.selectedItems.map(e => e.id);
    } else {
      this.invoiceData.guardianData = [];
    }
  }

  onHeaderCheckBoxValueEmit(input)
  {
    this.headerCheckBoxValue = input;
    // this.onSelectedCheckBoxAllEmit(input);
  }

  onItemSelected()
  {
    if (this.selectedItems.length > 0) {
      this.emitSelectionDone.emit(this.selectedItems);
    } else {
      this.alertService.alertInfo('Leaving?', 'Please select the list item first.');
    }
  }

  clearForm() {
    this.selectedItems = null;
    this.getList(this.filterUrl);
  }

  filnalFilters(event): void {
    let filterUrl = '';
    // this.filters.forEach(element => {
    //   event.filter.push(element);
    // });
    // Project related filters
    if (event.filter.length > 0) {
      filterUrl = '&attributes=' + JSON.stringify(event.filter);
    } else if (event.filter.length == 0) {
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
    }
    if (event.date) {
      filterUrl = filterUrl + event.date;
    }
    filterUrl = filterUrl + "&otherAttributes=" + JSON.stringify([{
      'key': 'bookedStudents',
      'value': true
    }]);

    filterUrl += '&invoiceDate=' + this.invoiceData.invoiceDate;
    this.getList(filterUrl);
  }

  //------------- Code for Create Invoice API ----------------//

  confirmInvoiceGenerate() {
	let heading = 'Confirmation';
	let message = 'Draft invoice for this period already exists. if you proceed existing draft(s) will be removed';
	let rightButton = 'Generate';
	let leftButton = 'Cancel';

	this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then((result) =>
	  {
		if (result)
		{
		//   this.dialogRef.close({ status: 'close', type: this.type });
		this.onSubmit();

		}
	  });
  }

  checkForInvoiceValidation() {
    console.log("this.invoiceData",this.invoiceData);


    if (!this.invoiceData.guardianData || this.invoiceData.guardianData.length == 0) {
      this.alertService.alertError('WARNING', 'Please select child');
      return;
    }

    console.log(this.invoiceData.guardianData);

    // Logic for dividing 20 selected guardians into parts with seperate api calls

    const length = this.invoiceData.guardianData.length;
    this.numberOfChunks = Math.ceil(length / this.chunkSize);
    console.log('Number of chunks:', this.numberOfChunks);
    const originalArray = this.invoiceData.guardianData;
    const resultArray = [];
    for (let i = 0; i < originalArray.length; i += this.chunkSize) {
      const chunk = originalArray.slice(i, i + this.chunkSize);
      resultArray.push(chunk);
    }

    this.splittedGuradiansArr = resultArray;

    // End
    
    this.onSubmit();

	  // let url = config.base_url_slug + 'child/invoice/preInvoiceValidation';
	  // this.apiService.post(url,this.invoiceData).then((res)=> {

		// if (res.code == 200) {
		// 	this.onSubmit();
		// } else if (res.code == 208) {
		// 	this.confirmInvoiceGenerate()
		// } else {
		// 	this.alertService.alertError('ERROR', 'Something Went Wrong, Try Again');
		// }
	  // })

  }

  onSubmit() {
    let url = config.base_url_slug + 'generate/generateRevampInvoice';

    this.invoiceData.guardianData = this.splittedGuradiansArr[this.currentIndex];

    this.apiService.post(url, this.invoiceData, false).then((res)=> {
       if (res.code == 200 || res.code == 201) {

        if ((this.currentIndex + 1) == this.numberOfChunks) {
          localStorage.setItem('invoiceTab', JSON.stringify(1));
          this.currentIndex = 0;
          this.alertService.alertSuccess('SUCCESS', res.message).then(()=> {
            window.history.back();
          });
        } else {
          // recurrsion for another api call
          this.currentIndex += 1;
          this.onSubmit();
        }

       }
    })
  }
}
