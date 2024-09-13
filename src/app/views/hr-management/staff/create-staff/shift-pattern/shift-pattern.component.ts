import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ShiftPatternDialogComponent } from './shift-pattern-dialog/shift-pattern-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { config } from 'src/config';
import { ActivePatternComponent } from './active-pattern/active-pattern.component';

@Component({
  selector: 'app-shift-pattern',
  templateUrl: './shift-pattern.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class ShiftPatternComponent extends GlobalListComponent implements OnInit
{
  patternKpi: any = {
    contractedHours: 0,
    scheduledHours: 0,
    remainingHours: 0,
  };
  buttonHeaderProps: any;
  @Input() parentId: any;
  @Input() childId: any;
  @Input() type: any;
  @ViewChild(ActivePatternComponent) activePatternComponent!: ActivePatternComponent;
  id: any;
  editPermit: any;

  constructor(private dialog: MatDialog, protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService,
    protected permissionsService: PermissionService,)
  {
    super(router, apiService, alertService, permissionsService);
    this.headerButtons = [
      { buttonLabel: "Add New Shift", type: 'output', color: "#E2AF2A", buttonRoute: "", visibility: this.permissionsService.getPermissionsBySubModuleName('H.R Management', 'Staff').create },
    ];

    this.buttonHeaderProps = {
      headingLabel: "Staff Shift Pattern",
      ActionButtons: this.headerButtons,
      hasButton: true,
      hasHeading: true,
      labelMargin: '0px',
      float: 'right',
      textclass: 'text-bolder text-color',
      buttonsMargin: '0px 10px 0px',
      margin: '10px',
    };

    this._route.params.subscribe(params =>
      {
        this.id = params['id'];
        this.type = params['type'];

        this.buttonHeaderProps.hasButton = (this.type == 'new' || this.type == 'edit');
    })
    
    this.editPermit = this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Enrollment').update;
  }

  ngOnInit(): void
  {
    console.log('this.parentId', this.parentId);
    this.detailApi = config.base_url_slug + 'view/staff-member/' + this.parentId;

    if(this.type == 'view')
    {
      this.headerButtons = [];
      this.buttonHeaderProps.hasButton = false;
    }
    this.getDetail();
    this.getPatternData();
  }

  openDialog(add)
  {
    if (this.formDetail?.staffShiftPattern.length == 0)
    {
      this.dialogNow(add)
    }
    else
    {
      this.alertService.alertInfo('Warning!', 'Pattern Already Exist.')
    }
  }

  dialogNow(add)
  {
    let event = {};
    
    if (add == "add")
    {
      event['type'] = "add";
      event['staffId'] = this.formDetail?.id;
      event['staffName'] = this.formDetail?.firstName + ' ' + this.formDetail?.lastName;
      event['branchId'] = this.formDetail?.branchId;
      event['patternKpi'] = this.patternKpi;
    }
    else if (this.type == "view")
    {
      event['type'] = this.type;
    }
  
    event['startDate'] = this.formDetail?.staffContractDetail?.employmentStartDate;
    event['endDate'] = this.formDetail?.staffContractDetail?.employmentEndDate;

    let dialogRef = this.dialog.open(ShiftPatternDialogComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      width: '70%',
      data: {
        event: event,
      }
    });

    dialogRef.afterClosed().subscribe(result =>
    {
      if (result.status == "success" && result.type == "add")
      {
        this.router.navigateByUrl('/main/staff');
      }
    })
  }

  getPatternData(): void
  {
    console.log('this.getPatternData', this.parentId);
    let url = config.base_url_slug + 'view/staff-member/' + this.parentId + '/shift-pattern/kpi';
    this.apiService.get(url).then(result =>
    {
      if (result.code === 200 && result.data) 
      {
        this.patternKpi = result.data;
      }
      else
      {
        this.patternKpi = {
          contractedHours: 0,
          scheduledHours: 0,
          remainingHours: 0,
        };
        this.alertService.alertError(result.status, result.message);
      }
    });
  }

  shiftDeleted()
  {
    this.getDetail()
  }

  shiftUpdated()
  {
    this.getPatternData();
  }

	goToEdit() {
		this.router.navigateByUrl(`/main/staff/${this.id}/edit`);
    this.activePatternComponent.openDialog();
		// this.type = 'edit';
		// this.checkType();
	}

}
