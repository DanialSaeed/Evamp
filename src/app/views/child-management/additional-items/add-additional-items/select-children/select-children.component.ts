import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  GlobalListComponent
} from 'src/app/shared/global-list';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import {
  ApiService,
  AlertService,
  CommunicationService
} from 'src/app/services';
import {
  MatTableDataSource
} from '@angular/material/table';
import { config } from 'src/config';

@Component({
  selector: 'app-select-children',
  templateUrl: './select-children.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class SelectChildrenComponent extends GlobalListComponent implements OnInit {

  @Output() sendchildData = new EventEmitter<any>();
  @Output() back = new EventEmitter<string>();
  @Input() itemData: any;
  selectedChilds = [];
  tableConfigAndProps = {};
  footerProps: any;
  dataSource = new MatTableDataSource();
  headerCheckBoxValue: boolean = false;
  layoutAlign = "start start";
  customBtnLabel = 'Next';

  headerProps = {
    searchConfig: {
      label: 'Enter Child Name or Parent Name',
      key: 'branchId',
      value: ''
    },
    filterArray: [],
    fxFlexIn: "310px",
    builtInFilters: {
      key: 'branchId',
      value: localStorage.getItem('branchId')
    }
  };

  inputData = {
    'roundedTable': false,
    'hasSwitch': false,
    'buttonEvent': "output",
    'hasCheckBox': true,
    'checkBoxCol': "checkbox",
    'onlyOneCheck': false,
    'hasHeaderCheckBox': true,
  };

  Actionbuttons = [];

  columnHeader = {
    'checkbox': '',
    'id': 'ID',
    'name': 'Childs Name',
    'lastName': 'Parents Name',
    'room': 'Room Name'
  };

  constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService,
    protected communicationService: CommunicationService) {
    super(router, apiService, alertService);

    this.tableConfigAndProps = {
      ActionButtons: this.Actionbuttons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: this.dataSource,
    };
    this.listApi = config.base_url_slug +'v3/view/childs';
    // this.getList()

    this.footerProps = {
      'subButtonLabel': "Next",
      'hasSubButton': true,
      'hasbackButton': true,
      'backButtonLabel': 'Cancel',
      'type': 'output',
      'color': '#e2af2a'
    };
    super.ngOnInit();
  }

  ngOnInit() {
    this.getRooms(localStorage.getItem('branchId'));
  }

  afterRoom() {
    this.headerProps = {
      searchConfig: {
        label: 'Enter Child Name or Parent Name',
        key: 'branchId',
        value: ''
      },
      builtInFilters: {
        key: 'branchId',
        value: localStorage.getItem('branchId')
      },
      filterArray: [{
        label: 'Select Room',
        type: 'search',
        key: 'roomId',
        selected: 'All',
        options: this.rooms
      }, ],
      fxFlexIn: "310px"
    };
  }

  afterListResponse(): void {
    // let booking = JSON.parse(localStorage.getItem('additionalItems'));
    this.dataItems.forEach(element => {
      let child = this.selectedChilds.find(t => element.id === t.id);
      if (child)
      {
        element['checkbox'] = true;
        element['fillBackground'] = true;
      }
      element['name'] = element['firstName'] + " " + element['lastName'];

      // booking?.forEach(booking => {
      //   if (booking['id'] === element.id) {
      //     element['checkbox'] = true;
      //     element['fillBackground'] = true;
      //     if(!child)
      //     {
      //       this.selectedChilds.push({
      //         'id': element.id,
      //         'name': element.name,
      //         'room': element.room
      //       })
      //     }
      //   }
      // });
      this.itemData?.forEach(booking => {
        console.log("booking ", booking.id);
        if (booking.id === element.id) {
          element['checkbox'] = true;
          element['fillBackground'] = true;
          if(!child)
          {
            this.selectedChilds.push({
              'id': element.id,
              'name': element.name,
              'room': element.room
            })
          }
        }
      });
    });

    this.tableConfigAndProps = {
      ActionButtons: this.Actionbuttons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: new MatTableDataSource(this.dataItems),
      pagination: this.pagination
    };
  }

  onSelectedCheckBoxAllEmit(input)
  {
      this.dataItems.forEach(item => {
        let child = this.selectedChilds.find(t => item.id === t.id);
        if (child)
        {
          if(input == false)
          {
            const index = this.selectedChilds.indexOf(child, 0);
            if (index > -1) {
              this.selectedChilds.splice(index, 1);
            }
          }
        }
        else
        {
          this.selectedChilds.push({
            'id': item.id,
            'name': item.name,
            'room': item.room
          });
        }
      });
  }

  onSelectedCheckBoxEmit(res) {
    if (res.checked == true) {
      let child = this.selectedChilds.find(t => res.element.id === t.id);
      if (!child)
      {
        this.selectedChilds.push({
          'id': res.element.id,
          'name': res.element.name,
          'room': res.element.room
        });
      }
    } else {
      for (var i = 0; i < this.selectedChilds.length; i++) {
        if (this.selectedChilds[i].id == res.element.id) {
          this.selectedChilds.splice(i, 1);
          break;
        }
      }
    }
  }

  onHeaderCheckBoxValueEmit(input)
  {
    this.headerCheckBoxValue = input;
    // this.onSelectedCheckBoxAllEmit(input);
  }

  onAddAdditional() {
    if (this.selectedChilds.length != 0) {
      // localStorage.setItem('additionalItems', JSON.stringify(this.selectedChilds))
      this.sendchildData.emit(this.selectedChilds);
      let data = {
        'number': 2,
      }
      this.communicationService.setAdditionalItems(data)

    } else {
      this.alertService.alertInfo('Leaving?', 'Please select the child first.')
    }
  }

  filnalFilters(event): void {
    let filterUrl = '';
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
    }])

    filterUrl = filterUrl + '&isAdditionaItemsList=true';
    this.getList(filterUrl)
  }

  clearForm() {
    this.selectedChilds = [];
    localStorage.removeItem('additionalItems');
    this.getList(this.filterUrl);
  }

  goBack()
    {  
        this.back.emit();
    }
}
