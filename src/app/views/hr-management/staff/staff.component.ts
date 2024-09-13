import { Component, OnInit } from '@angular/core';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';
import { config } from 'src/config';
@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class StaffComponent extends GlobalListComponent implements OnInit
{
  tableConfigAndProps = {};
  dataSource = new MatTableDataSource();
  buttonHeaderProps : any;
  sortBy = '';
  sortOrder = '';

  jobTitles: any[] = [
		{value: "nurseryManager", label: "Nursery Manager" },
		{value: "roomLeader", label: "Room Leader" },                  
		{value: "director", label: "Director" },                       
		{value: "senior" , label: "Senior"},
		{value: "cook" , label: "Cook" },
		{value: "cleaner", label: "Cleaner"},
		{value: "maintenanceWorker", label: "Maintenance Worker" },
		{value: "careTaker", label: "Care Taker"},
		{value: "seniorManager", label: "Senior Manager"},
		{value: "trainingManager", label: "Training Manager" },
		{value: "deputyManager", label: "Deputy Manager" },
		{value: "adminAssistant" ,label: "Admin Assistant"},
		{value: "accountsAssistant" ,label: "Account Assistant"},
		{value: "iTSupportTechnician" ,label: "IT Support Technician"},
		{value: "preSchoolManager" ,label: "Pre School Manager"},
		{value: "preSchoolDeputyManager" ,label: "Pre School Deputy Manager"},
		{value: "nurseryAssistantUnqualified" ,label: "Nursery Assistant Unqualified"},
		{value: "nurseryAssistantLevel2"  ,label: "Nursery Assistant Level 2"},
		{value: "nurseryPractitionerLevel3+" ,label: "Nursery Practitioner Level 3+"},
		{value: "nurseryPractitionerLevel6"  ,label: "Nursery Practitioner Level 6"},
	]

  sortFields:any[] = [
    {asc: false, field: 'firstName'}, 
    {asc: false, field: 'lastName'}, 
  ];
 
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

    filterArray = [
			{
			    label: 'Sort by ', type: 'sort', key: 'firstName' ,selected: 'All',
			    options: [
			        { key: 'All', value: 'All', label: 'All' },
			        { key: 'ASC', value: 'ASC', label: 'Ascending' },
			        { key: 'DESC', value: 'DESC', label: 'Descending' }
			    ]
			},
		];
  

  constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected permissionsService: PermissionService)
  {
    super(router, apiService, alertService, permissionsService);
    // 'buttonEvent': 'output'  on events
    this.headerButtons = [
      { buttonLabel: "Create Staff", color: "#E2AF2A", buttonRoute: "staff/add", isMultiple: false, firstFormName: 'personal', visibility: this.permissionsService.getPermissionsBySubModuleName('H.R Management', 'Staff').create  },
    ]

    this.buttonHeaderProps = {
      headingLabel: "Staff",
      ActionButtons: this.headerButtons,
      hasButton: true,
      hasHeading: true,
      labelMargin: '10px',
      float: 'right',
      textclass: 'text-bolder text-color',
      buttonsMargin: '0px 10px -5px 0px',
      margin: '0px',
      hasFilters: true,
      searchConfig: { label: 'Search', key: 'staffId', value: '' },
      builtInFilters: { key: 'branchId', value: localStorage.getItem('branchId') },
      filterArray:this.filterArray
    };
  
    this.actionButtons =
      [{ buttonLabel: "Edit", buttonRoute: "staff", visibility: this.permissionsService.getPermissionsBySubModuleName('H.R Management', 'Staff').update  },
      { buttonLabel: "View", buttonRoute: "staff", visibility: this.permissionsService.getPermissionsBySubModuleName('H.R Management', 'Staff').read },
      { buttonLabel: "Delete", type: 'delete', buttonRoute: "staff-member", visibility: this.permissionsService.getPermissionsBySubModuleName('H.R Management', 'Staff').delete  },
      ]
    this.columnHeader = {
      'id': 'ID', 'firstName': 'First Name', 'lastName': 'Surname', 'jobTitle': 'Job Title', 'mobileNumber': 'Contact Number', 'email': 'Email Address', 'branch': 'Primary Settings','statusLabel': 'Status',
      'Actions': 'Actions',
    };
    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
    };
    this.listApi = config.base_url_slug +'view/staff-members';
    // this.getList()
    super.ngOnInit();

    this.isMultiple = false;
    this.firstFormName = 'personal';
  }

  afterListResponse(): void
  {
    this.dataItems.forEach((staff)=> {
      staff['statusLabel'] = staff.status ? 'Active': 'Inactive';
      staff['jobTitle'] = staff['jobTitle'] ? this.jobTitles.find(x => x.value == staff.jobTitle).label : '-';  
      if (!staff.status) {
        staff['highlight'] = 'rgb(255, 230, 230)';
      }
    })
    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: new MatTableDataSource(this.dataItems),
      pagination: this.pagination,
      onlyDelete: true
    };
  }

  sortColumn(e) {

    this.sortBy = e.field;
    
    this.sortUrl = `&sortBy=${this.sortBy}&sortOrder=${e.order}`;
    this.getList(this.filterUrl);
}
}