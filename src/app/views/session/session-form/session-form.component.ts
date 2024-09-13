import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, CommunicationService, PermissionService } from 'src/app/services'
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { config } from 'src/config';

@Component({
	selector: 'app-session-form',
	templateUrl: './session-form.component.html',
	styleUrls: ['/src/app/views/shared-style.scss']
})
export class SessionFormComponent extends GlobalFormComponent implements OnInit
{
	formNo = 1;
	route: any;
	id: any;
	pricingId: any = -1;
	private subscription: Subscription;
	constructor(protected router: Router,
		protected _route: ActivatedRoute,
		protected alertService: AlertService,
		protected apiService: ApiService,
		protected formbuilder: FormBuilder,
		protected dialog: MatDialog,
		protected communicationService: CommunicationService,
    protected permissionService: PermissionService)
	{

		super(router, _route, alertService, apiService, formbuilder, dialog);
		this.subscription = this.communicationService.getStaff().subscribe(data =>
		{
			// here fetch data from the session storage
			console.log(data, "through communication");
			this.onFormClick(data['number']);
		})
    this.editPermit = this.permissionService.getPermissionsByModuleName('Session Management').update

    console.log("this.editPermit",this.editPermit);


	}

	ngOnInit(): void
	{
		this.route = this._route
		let sub = this._route.params.subscribe(params =>
		{

			this.id = params['id'];
			this.type = params['type'];
			if(this.type == 'view' || this.type == 'edit')
			{
				this.parentId = this.id;
			}
		});
		console.log("after detail =", this.id, this.type);
		super.ngOnInit();
	}

	getId(sessionId)
	{
		//Get session id here
		this.parentId = sessionId;
	}

	onFormClick(number)
	{
		if (number > 1 && this.parentId == -1)
		{
			return;
		}

		// if (this.id == 'add') {
		// 	if (number < this.formNo) {
		// 		return;
		// 	}
		// }
		this.formNo = number;
	}

	ngOnDestroy(): void
	{
		this.subscription.unsubscribe();
	}

	afterDetail(): void
	{
		this.formDetail = this.formDetail;
		console.log("after detail =", this.formDetail);
	}

	onEmitFormData(event)
	{
		console.log('onEmitFormData', event);
		if (event.type == 'parent')
		{
			this.parentId = event.value;
			this.formDetailApi = config.base_url_slug + 'view/staff-member/' + this.parentId;
		}
		else if (event.type == 'child')
		{
			this[event.key] = event.value;
		}
	}

	onBack()
	{
		if (this.formNo == 1)
		{
			this.router.navigate(['main/session']);
		}

		// if (this.id == 'add')
		// {
		// 	return;
		// }

		if (this.formNo > 1)
		{
			this.formNo = this.formNo - 1;
		}
	}

}
