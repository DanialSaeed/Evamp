import { Component, OnInit } from '@angular/core';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { config } from 'src/config';
import { AccessManagementDialogComponent } from 'src/app/core/access-management-dialog/access-management-dialog.component';

@Component({
  selector: 'app-user-roles',
  templateUrl: './user-roles.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class UserRolesComponent extends GlobalListComponent implements OnInit
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
    'buttonEvent': 'output',

  }

  // headerButtons = [
  //   { buttonLabel: "Add new Room", color: "#E2AF2A", buttonRoute: "room/add" },
  // ]
  // buttonHeaderProps = {
  //   headingLabel: "Children ",
  //   hasButton: false,
  //   hasHeading: true,
  //   labelMargin: '20px',
  //   textclass: 'text-bolder text-color',
  //   margin: '0px'
  // };

  isMultiple: boolean;
  firstFormName: string;

  constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute,		protected dialog: MatDialog,
	protected alertService: AlertService,
  protected permissionsService: PermissionService)
  {
    super(router, apiService, alertService);
    this.actionButtons =
    [{ buttonLabel: "Edit", buttonRoute: "enrolment", visibility: this.permissionsService.getPermissionsBySubModuleName('Global Settings', 'Access Management').update },
  // { buttonLabel: "View", buttonRoute: "enrolment", visibility: this.permissionsService.getPermissionsBySubModuleName('Global Settings', 'Access Management').read  },
    // { buttonLabel: "Delete", type: 'delete', buttonRoute: "child", visibility: this.permissionsService.getPermissionsBySubModuleName('Global Settings', 'Access Management').delete  },
    ];
    this.columnHeader = {
      'id': 'ID', 'firstName': 'Name', 'email': 'Email ID',
      'jobTitle': 'Job Title', 'branch': 'Access Level', 'actionStatusColumn': 'Status', 'Actions': 'Actions'
    };
    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
    };

    this.listApi = config.base_url_slug +'view/staff-members';
    let branchId = localStorage.getItem('branchId');

		let attributes = 'attributes=[{"key": "branchId","value":' +branchId+ '}]';
		let otherAttributes = '&otherAttributes=[{"key":"accessManagement","value": true }]';

    let filterUrl = attributes + otherAttributes;
    this.getList(filterUrl);
    super.ngOnInit();

    this.isMultiple = true;
    this.firstFormName = 'basic';
  }

  afterListResponse(): void
  {
    this.dataItems.forEach (element => {
        element['branch'] = element.staffContractDetail.roleType == 'standard' ? element.staffContractDetail?.predefinedSystemRole?.name : 'Custom';
        element['jobTitle'] = this.getJobtitle(element.staffContractDetail?.jobTitle);
        element['actionStatusColumn'] = element['status'] ==  true ? 'Active' : 'Inactive';
    });
    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: new MatTableDataSource(this.dataItems),
      pagination: this.pagination
    };
  }

  getJobtitle(title)
  {
    let sTitle = '-';
    switch(title)
    {
      case 'nurseryManager':
        sTitle = 'Nursery Manager';
        break;
      case 'roomLeader':
        sTitle = 'Room Leader';
        break;
      case 'director':
        sTitle = 'Director';
        break;
      case 'senior':
        sTitle = 'Senior';
        break;
      case 'cook':
        sTitle = 'Cook';
        break;
      case 'cleaner':
        sTitle = 'Cleaner';
        break;
      case 'maintenanceWorker':
        sTitle = 'Maintenance Worker';
        break;
      case 'careTaker':
        sTitle = 'Care Taker';
        break;
      case 'seniorManager':
        sTitle = 'Senior Manager';
        break;
      case 'trainingManager':
        sTitle = 'Training Manager';
        break;
      case 'deputyManager':
        sTitle = 'Deputy Manager';
        break;
      case 'adminAssistant':
        sTitle = 'Admin Assistant';
        break;
      case 'accountsAssistant':
        sTitle = 'Accounts Assistant';
        break;
      case 'iTSupportTeschnician':
        sTitle = 'IT Support Teschnician';
        break;
      case 'preSchoolManager':
        sTitle = 'Pre School Manager';
        break;
      case 'preSchoolDeputyManager':
        sTitle = 'Pre School Deputy Manager';
        break;
      case 'nurseryAssistantUnqualified':
        sTitle = 'Nursery Assistant Unqualified';
        break;
      case 'nurseryAssistantLevel2':
        sTitle = 'Nursery Assistant Level2';
        break;
      case 'nurseryPractitionerLevel3+':
        sTitle = 'Nursery Practitioner Level 3+';
        break;
      case 'nurseryPractitionerLevel3+Grade-A':
        sTitle = 'Nursery Practitioner Level 3+ Grade A';
        break;
      case 'nurseryPractitionerLevel3+Grade-B':
        sTitle = 'Nursery Practitioner Level 3+ Grade B';
        break;
      case 'nurseryPractitionerLevel3+Grade-C':
        sTitle = 'Nursery Practitioner Level3 + Grade C';
        break;                                           
    }
    return sTitle;
  }

  actionButtonOutput(event)
  {
    if (event.item.type === "delete")
    {
      // localStorage.removeItem('child-id')
      // this.onDelete(event.row, event.item)
    }
    else
    {
      let dialogRef = this.dialog.open(AccessManagementDialogComponent, {
        autoFocus: false,
        maxHeight: '90vh',
        width: '70%',
        data: {
          id: event.row.id,
        }
      });
  
      dialogRef.afterClosed().subscribe(result =>
      {
        if(result)
        {
          if (result.status == "success" && result.type == "add")
          {
            // let filterUrl = 'otherAttributes=[{"key": "accessManagement","value": true }]';
            this.getList(this.filterUrl);
          }
        }
      })
    }
  }

  onEmitColumnAction(event)
  {
    let st = event['status'];
    let heading_active = '';
    if (event['status'] == true)
    {
      heading_active = 'Inactive';
      st = false;
    }
    else
    {
      heading_active = 'Activate';
      st = true;
    }
		let heading = 'Warning';
		let message = 'Are you sure you want to '+ heading_active +' the user?';
		let rightButton = 'Yes';
		let leftButton = 'No';
		this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then(result =>
		{
			if (result)
			{
        let data = {status: st};
        let url =  config.base_url_slug + 'update/staff-member-status/'+ event['id'];
				this.apiService.patch(url, data).then(result =>
				{
					if (result.code == 200)
					{
						this.getList(this.filterUrl);
						this.alertService.alertSuccess(result.status, result.message);
					}
					else
					{
						this.alertService.alertError(result.status, result.message);
					}
				});
			} else {
        this.getList(this.filterUrl);
      }
		});
  }
}