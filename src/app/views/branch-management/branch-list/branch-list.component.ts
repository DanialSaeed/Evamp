import { Component, OnInit, ViewChild } from '@angular/core';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';
import { config } from 'src/config';
@Component({
  selector: 'app-branch-list',
  templateUrl: './branch-list.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class BranchListComponent extends GlobalListComponent implements OnInit
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
    'buttonEvent': "output"
  }

  constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService,)
  {
    super(router, apiService, alertService);

    // 'buttonEvent': 'output'  on events
    this.headerButtons = 
    [
      { buttonLabel: "Add new Branch", color: "#E2AF2A", buttonRoute: "branch/add", visibility: true },
    ];

    this.actionButtons =
    [
      { buttonLabel: "Edit", buttonRoute: "branch", visibility: true },
      { buttonLabel: "View", buttonRoute: "branch", visibility: true },
      { buttonLabel: "Delete", type: 'delete', buttonRoute: "branch", visibility: true },
    ];

    this.buttonHeaderProps = {
      headingLabel: "Branch Information",
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
      builtInFilters: { key: 'status', value: '1' }
    };

    this.columnHeader = {
      'id': 'ID', 'name': 'Name', 'contactNumber': 'Phone No', 'registrationNumber': 'OFSTED Registration', 'postalCode': 'Post Code',
      'branchManagers': 'Manager', 'occupancy': 'Occupancy', 'Actions': 'Actions',
    };

    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
    };
    this.listApi = config.base_url_slug +'view/branches';
    // this.getList()
    super.ngOnInit();
  }

  afterListResponse(): void
  {
    // this.title = "Project Listing"
    this.dataItems.forEach (element => {
      var branchManagers='';
      element['branchManagers'].forEach(element => {
        if(branchManagers!=='')
        {
          branchManagers+=","
        }
        branchManagers+=element?.staff?.firstName
      });
      element['branchManagers']=branchManagers
      element['occupancy']='N/A'

    });
    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: new MatTableDataSource(this.dataItems),
      pagination: this.pagination
    };
    // this.title = this.title + " (" + this.pagination.count + ")"
  }
}
