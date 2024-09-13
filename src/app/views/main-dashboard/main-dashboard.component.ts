import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommunicationService } from 'src/app/services/communication-service.service';
import { ApiService, PermissionService, AlertService } from 'src/app/services';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { visitAll } from '@angular/compiler';

@Component({
	selector: 'app-main-dashboard',
	templateUrl: './main-dashboard.component.html',
	styleUrls: ['/src/app/views/shared-style.scss']
})
export class MainDashboardComponent extends GlobalListComponent implements OnInit
{
	buttonHeaderProps : any;
	selected = 0;
	bBranchesVisibility = false;

	constructor(protected router: Router,
		protected _route: ActivatedRoute,
		protected communicationService: CommunicationService,
		protected apiService: ApiService,
		protected alertService: AlertService,
		protected permissionsService: PermissionService)
	{
		super(router, apiService, alertService, permissionsService);
		this.headerButtons = [{ buttonLabel: "Add New Branch", color: "#E2AF2A", buttonRoute: "branch/add", visibility: permissionsService.getPermissionsBySubModuleName('Branch Overview', 'Branch').create }];
		this.buttonHeaderProps = {
			headingLabel: "Branch Information",
			ActionButtons: this.headerButtons,
			hasButton: true,
			hasHeading: false,
			labelMargin: '10px',
			float: 'right',
			textclass: 'text-bolder text-color',
			buttonsMargin: '0px 10px 10px 0px',
			margin: '0px',
			hasFilters: false,
			searchConfig: { label: 'Search', key: 'branchId', value: '' },
			builtInFilters: { key: 'status', value: '1' }
		};
	}

	ngOnInit(): void
	{
	}

	open(b)
	{
		localStorage.setItem('branchId', b.value);
		localStorage.setItem('branchName', b.label);
		localStorage.setItem('operationalPeriod', b.operationalPeriod);
		var data = {
			'title': b.label
		}
		this.communicationService.setBranch(data);
		// var url='/main/branch/'+b.value +'/view'
		// this.router.navigateByUrl(url)
		this.selected = 1;
		// this.selected = 1;
	}

	selectedIndex(event)
	{
		this.selected = event;
	}

	getBranchesTabVisibility()
	{
		let role = localStorage.getItem('system_user_role');
		if(role != null && role == 'Super Admin')
		{
			this.bBranchesVisibility = true;
		}
		return this.bBranchesVisibility;
	}
}
