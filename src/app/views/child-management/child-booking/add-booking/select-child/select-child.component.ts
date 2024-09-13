import { Component, EventEmitter, Input, OnInit, Output,} from '@angular/core';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, CommunicationService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';
import { config } from 'src/config';
import { MatDialog } from '@angular/material/dialog';
import { BookingTypeDialogComponent } from 'src/app/shared/booking-type-dialog/booking-type-dialog.component';
@Component({
  selector: 'app-select-child',
  templateUrl: './select-child.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class SelectChildComponent extends GlobalListComponent implements OnInit {

  @Output() sendchildData = new EventEmitter<any>();
  @Output() back = new EventEmitter<string>();
  @Input() data: any;
  selectedChild: any;
  tableConfigAndProps = {};
  footerProps:any;
  checkedBoxes = 0;
  checkedOne = null;
  dataSource = new MatTableDataSource();
  layoutAlign = "start start";
  customBtnLabel = 'Next';
  archiveBtnLabel = 'Archived Children';
  listType = 'active';

  headerProps = {
    searchConfig: {
      label: 'Enter Child Name or Parent Name',
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
  inputData = {
    'roundedTable': false,
    'hasSwitch': false,
    'buttonEvent': "output",
    'hasCheckBox': true,
    'checkBoxCol': "checkbox",
    'onlyOneCheck': true
  }


  constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService,
    protected communicationService: CommunicationService, protected dialog: MatDialog) {
    super(router, apiService, alertService);
    this.actionButtons = []

    this.columnHeader = {
      'checkbox': '', 'id': 'ID', 'name': 'Childs Name', 'guardianName': 'Parents Name'
    };

    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
      checkedBoxes:this.checkedBoxes,
      checkedOne : this.checkedOne,
    };
    this.listApi = config.base_url_slug +'view/childs';
    // this.getList()

    super.ngOnInit();
    this.footerProps = {
      'subButtonLabel': "Next",
      'hasSubButton': true,
      'hasbackButton': true,
      'backButtonLabel': 'Cancel',
      'type': 'output',
      'color': '#e2af2a'
    };
  }
  ngOnInit()
  {
    // if(localStorage.getItem('booking'))
    // {
    //   localStorage.removeItem('booking')

    // }
  }

  afterListResponse(): void
  {
    // this.title = "Project Listing"
    // let booking = JSON.parse(localStorage.getItem('booking'));
    console.log(this.dataItems);
    this.dataItems.forEach (element => {
      if(this.data)
      {
        if(this.data?.id == element.id)
        {
          element['checkbox']=true;
          element['fillBackground'] = true;
          this.checkedBoxes=1;
          this.checkedOne=element;
          this.selectedChild = {
            'id': element.id,
            'name': element.name,
            'dateOfBirth': element.dateOfBirth,
            'defaultRoomId': element.DefaultRoomId
          }
        }
      }
      element['name'] = element['firstName'] + " " + element['lastName'];
    });


    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      checkedBoxes: this.checkedBoxes,
      checkedOne: this.checkedOne,
      dataSource: new MatTableDataSource(this.dataItems),
      pagination: this.pagination
    };
  }

  selectedCheckBox(res) {
    if (res.element) {
      this.selectedChild = {
        'id': res.element.id,
        'name': res.element.name,
        'dateOfBirth': res.element.dateOfBirth,
        'roomId': res.element.roomId,
        'defaultRoomId': res.element.DefaultRoomId,
        'guardian': res.element.guardianName,
    }
    } else {
      this.selectedChild=null;
    }

  }

  onAddBooking(type)
  {

    if(this.selectedChild)
    {
      // localStorage.setItem('booking', JSON.stringify(this.selectedChild))
      this.selectedChild['bookingType'] = type;
      this.sendchildData.emit(this.selectedChild);
      let data = {
        'number': 2,
      }
      this.communicationService.setChildBooking(data)
    }
    else
    {
      this.alertService.alertInfo('Leaving?', 'Please select the child first.')
    }
  }

  openBookingTypeDialog(): void
	{
    if (this.selectedChild) {
      if (this.selectedChild['guardian']){
        
        const dialogRef = this.dialog.open(BookingTypeDialogComponent, {
          autoFocus: false,
          // maxHeight: '90vh',
          // width: '50%',
          // data: { event: event }
        });
        

        dialogRef.afterClosed().subscribe(result =>
        {
          if (result)
          {
            this.onAddBooking(result);
          }
        });
      } else {
        this.alertService.alertInfo('Warning','Please add at least one guardian to continue.')
      }
    }
    else
    {
      this.alertService.alertInfo('Leaving?', 'Please select the child first.')
    }

	}

  onArchiveClick() {
    this.listType  = this.listType == 'active' ? 'archive' : 'active';

    if (this.listType == 'archive') 
    {
      // this.listApi =config.base_url_slug +'view/childs';
      this.archiveBtnLabel = 'Active Children';
      this.filterUrl += '&listType=archive';
    } 
    else {
      // this.listApi += '&listType=archive';
      this.archiveBtnLabel = 'Archived Children';
      this.filterUrl = this.filterUrl.replace("&listType=archive", "");
    }
    this.selectedChild = null
    this.getList(this.filterUrl);
  }


  clearForm() {
    // console.log("clearing")
    this.selectedChild = null
    this.getList(this.filterUrl);
  }
  goBack()
    {
        this.back.emit();
    }

  filnalFilters(event): void {
    let filterUrl = '';
    // event.filter.push({
    //   'key': 'activeBooking',
    //   'value': false
    // });

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

    filterUrl = this.listType == 'archive' ? filterUrl + '&listType=archive' : filterUrl.replace("&listType=archive", "");
    // console.log(filterUrl, "url", event)
    this.getList(filterUrl)
  }


}
