import { Component, OnInit, ViewChild } from '@angular/core';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';
import { config } from 'src/config';
@Component({
  selector: 'app-allocation-list',
  templateUrl: './allocation-list.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class AllocationListComponent extends GlobalListComponent implements OnInit
{
  tableConfigAndProps = {};
  dataSource = new MatTableDataSource();

  inputData = {
    'imageColumn': 'profilePicture',
    'actionColumn': 'Actions',
    'expandColumn': 'expandable',
    'firstColumn': 'No.',
    'lastColumn': '',
    'roundedTable': false,
    'hasSwitch': false,
    'buttonEvent': 'output'
  }

  // headerButtons = [
  //   { buttonLabel: "Add new Room", color: "#E2AF2A", buttonRoute: "room/add" },
  // ]
  buttonHeaderProps = {
    headingLabel: "Staff List ",
    hasButton: false,
    hasHeading: true,
    labelMargin: '20px',
    textclass: 'text-bolder text-color',
    margin: '20px 0px'
  };
  columnHeader = {
    'serialNumber': 'No.', 'customer': 'Name', 'nursery': 'Nursery Name',
    'dateTime': 'Date', 'typeEn': 'Type', 'quantity': 'Requested Qty', 'Actions': 'Actions', 'expandable': ''
  };


  constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService,)
  {
    super(router, apiService, alertService);
    this.tableConfigAndProps = {
      inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
    };
  
    this.listApi = config.base_url_slug +'fetch/sampling-requests?perPage=10';
    // this.getList()
    super.ngOnInit();
  }

  afterListResponse(): void
  {
    // this.title = "Project Listing"
    this.tableConfigAndProps = {
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: new MatTableDataSource(this.dataItems),
      pagination: this.pagination
    };
    // this.title = this.title + " (" + this.pagination.count + ")"
  }
}
