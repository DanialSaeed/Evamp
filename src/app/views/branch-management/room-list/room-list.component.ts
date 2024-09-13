import { Component, OnInit } from '@angular/core';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';
import { config } from 'src/config';
@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class RoomListComponent extends GlobalListComponent implements OnInit
{
  tableConfigAndProps = {};
  dataSource = new MatTableDataSource();
  buttonHeaderProps: any;

  inputData = {
    'imageColumn': 'profilePicture',
    'actionColumn': 'Actions',
    'expandColumn': 'expandable',
    'firstColumn': 'No.',
    'lastColumn': '',
    'roundedTable': false,
    'hasSwitch': false,
    'buttonEvent' : "output"
  }

  constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected permissionsService: PermissionService)
  {
    super(router, apiService, alertService, permissionsService);

    // this.getList()
    // 'buttonEvent': 'output'  on events
    this.actionButtons =
    [
      { buttonLabel: "Edit", buttonRoute: "room", visibility: this.permissionsService.getPermissionsBySubModuleName('Branch Overview', 'Room').update },
      { buttonLabel: "View", buttonRoute: "room", visibility: this.permissionsService.getPermissionsBySubModuleName('Branch Overview', 'Room').read },
      { buttonLabel: "Delete", type: 'delete', buttonRoute: "room", visibility: this.permissionsService.getPermissionsBySubModuleName('Branch Overview', 'Room').delete }
    ];

    this.headerButtons =
    [
      { buttonLabel: "Add New Room", color: "#E2AF2A", buttonRoute: "room/add", visibility: this.permissionsService.getPermissionsBySubModuleName('Branch Overview', 'Room').create },
    ];

    this.buttonHeaderProps =
     {
      headingLabel: "Room Details",
      ActionButtons: this.headerButtons,
      hasButton: true,
      hasHeading: true,
      labelMargin: '10px',
      float: 'right',
      textclass: 'text-bolder text-color',
      buttonsMargin: '0px 10px 0px',
      margin: '0px',
      hasFilters: true,
      searchConfig: { label: 'Search', key: 'branchId', value: '' },
      builtInFilters: { key: 'branchId', value: localStorage.getItem('branchId') }
    };

    this.columnHeader =
    {
      'id': 'ID', 'name': 'Name',
      'totalCapacity': 'Total Capacity', 'area': 'Area (Sq. m)', 'occupiedCapacity': 'Occupancy','Actions': 'Actions',
    };

    this.tableConfigAndProps =
    {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: this.dataSource,
    };
    this.listApi = config.base_url_slug +'view/rooms';
  }

  ngOnInit()
  {
    super.ngOnInit();
  }

  afterListResponse(): void
  {
    // this.title = "Project Listing"
    this.dataItems.forEach(element => {
    // element['area']=element['length']+ ' x ' + element['width']
    // element['area'] = element['length'] * element['width']
    element['occupiedCapacity'] = element['occupiedCapacity']+"/"+element['totalCapacity']
    });

    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: new MatTableDataSource(this.dataItems),
      pagination: this.pagination,
      onlyDelete: true
    };
    // this.title = this.title + " (" + this.pagination.count + ")"
  }
}
