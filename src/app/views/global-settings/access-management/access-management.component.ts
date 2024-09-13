import { Component, OnInit } from '@angular/core';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AccessManagementDialogComponent } from 'src/app/core/access-management-dialog/access-management-dialog.component';

@Component({
  selector: 'app-access-management',
  templateUrl: './access-management.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class AccessManagementComponent extends GlobalListComponent implements OnInit {
  
  selected = 1;
  buttonHeaderProps: any;

  constructor(private dialog: MatDialog, protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService,
    protected permissionsService: PermissionService) {
      super(router, apiService, alertService, permissionsService);

      this.headerButtons = [
        { buttonLabel: "Give Access", color: "#E2AF2A", type: 'output', buttonRoute: "", visibility: this.permissionsService.getPermissionsBySubModuleName('Global Settings', 'Access Management').create },
      ];

      this.buttonHeaderProps = {
        ActionButtons: this.headerButtons,
        headingLabel: "Access Management",
        hasButton: true,
        hasHeading: true,
        labelMargin: '10px',
        float: 'right',
        textclass: 'text-bolder text-color',
        buttonsMargin: '0px 10px 10px 0px',
        margin: '10px',
        padding: '25px 0px 0px 0px',
        hasFilters: false,
      };

      super.ngOnInit();
     }

  ngOnInit(): void {
  }

  selectedIndex(event)
	{
		this.selected = event;
	}

  openDialog(){
    let dialogRef = this.dialog.open(AccessManagementDialogComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      width: '70%',
      data: {
        id: 'new',
      }
    });

    dialogRef.afterClosed().subscribe(result =>
    {
      if (result.status == "success" && result.type == "add")
      {
        this.router.navigateByUrl('/main/access-management');
      }
      // this.router.navigateByUrl('/main/staff-list');
      //  if(result)
      //  {
      //   event==="add"?this.onSubmit("admin/add/event",'add',result):this.onSubmit(config.base_url_slug +'update/event/' + event.id, 'edit',result)

      //  }
    })
  }
}
