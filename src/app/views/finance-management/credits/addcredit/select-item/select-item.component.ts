import { Component, EventEmitter, Input, OnInit, Output,} from '@angular/core';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, CommunicationService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';
import { config } from 'src/config';

export class selectedItem
{
    id: string;
    name: string;
    room?: string;
}

@Component({
  selector: 'app-select-item',
  templateUrl: './select-item.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class SelectItemComponent extends GlobalListComponent implements OnInit {
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


  headerCheckBoxValue: boolean = false;

  tableConfigAndProps = {};
  checkedBoxes = 0;
  checkedOne = null;
  dataSource = new MatTableDataSource();
  layoutAlign = "start start";
  customBtnLabel = 'Add Credit';

  constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService,
    protected communicationService: CommunicationService) {
    super(router, apiService, alertService);
    this.actionButtons = [];
    this.listApi = config.base_url_slug +'view/childs';
  }

  ngOnInit()
  {
    this.pageHeading = this.pageHeading !== 'undefined' && this.pageHeading !== null ? this.pageHeading : "Select Children";
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
        value: ''
      },
      builtInFilters: {
        key: 'branchId',
        value: localStorage.getItem('branchId')
      },
      filterArray:[],
      fxFlexInSearch:"310px",
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

    super.ngOnInit();
  }

  afterListResponse(): void {
    this.dataItems.forEach(element => {
      let child;
      if(this.selectedItems != null && this.selectedItems.length > 0)
      {
        child = this.selectedItems?.find(t => element.id === t.id);
      }
      if (child)
      {
        element['checkbox'] = true;
        element['fillBackground'] = true;
      }
      element['name'] = element['firstName'] + " " + element['lastName'];
      this.selectedItems?.forEach(item => {
        if (item['id'] === element.id) {
          element['checkbox'] = true;
          element['fillBackground'] = true;
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
    });

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
          this.selectedItems.push({
            'id': item.id,
            'name': item.name,
            'room': item.room
          });
        }
      });

      if (this.selectedItems.length > 0) {
        this.emitSelectedItems.emit(this.selectedItems);
      }
  }

  onSelectedCheckBoxEmit(res) {
    if (res.checked == true) {
      let child = this.selectedItems.find(t => res.element.id === t.id);
      if (!child)
      {
        this.selectedItems.push({
          'id': res.element.id,
          'name': res.element.name,
          'room': res.element.room
        });
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
      this.emitSelectedItems.emit(this.selectedItems);
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
      this.alertService.alertInfo('Leaving?', 'Please select child first.');
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
    this.getList(filterUrl);
  }
}
