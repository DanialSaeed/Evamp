import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, CommunicationService } from 'src/app/services'
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { config } from 'src/config';
import { ParentFormComponent } from 'src/app/shared/parent-form.component';
@Component({
	selector: 'app-create-staff',
	templateUrl: './create-staff.component.html',
	styleUrls: ['/src/app/views/shared-style.scss']
})
export class CreateStaffComponent extends ParentFormComponent implements OnInit
{
	formNo = 1;
	route: any;
	hideShift = false;
	private subscription: Subscription

	childFormLabels: any[] = [];

	staffContractDetailId: any = -1;
	isUnsavedForm = false;
	isResponseSaved = false;

	constructor(protected router: Router,
		protected _route: ActivatedRoute,
		protected alertService: AlertService,
		protected apiService: ApiService,
		protected formbuilder: FormBuilder,
		protected dialog: MatDialog,
		protected communicationService: CommunicationService)
	{
		super(router, _route, alertService, apiService, formbuilder, dialog, communicationService);

		this.subscription = this.communicationService.getStaff().subscribe(data =>
		{
			// here fetch data from the session storage 
			console.log(data, "through communication");
			this.onFormClick(data['number']);
		});

		this.childFormLabels = [
			{ label: "Personal Information", value: 1, hide: false },
			{ label: "Contract Settings", value: 2, hide: false },
			{ label: "Shift Pattern", value: 3, hide: false }
		]
	}

	ngOnInit(): void
	{
		this.sub = this._route.params.subscribe(params =>
		{
			// debugger;
			this.id = params['id'];
			this.type = params['type'];
			
			if (this.id == 'add')
			{
				this.communicationService.unSavedForm.subscribe((val)=> {
					if (val) {
					  this.isUnsavedForm = true;
					} else {
					  this.isUnsavedForm = false;
					}
				 })
			}
			else
			{
				this.parentId = this.id;
				this.detailApi = config.base_url_slug + 'view/staff-member/' + this.parentId;
				this.getDetail();
			}
		});
	}

	getId(staffId)
	{
		this.parentId = staffId;
	}

	onFormClick(number)
	{
		// if (this.parentId != -1)
		// {
		// 	this.apiService.get(this.formDetailApi).then(result =>
		// 	{
		// 		if (result.code === 200 && result.data)
		// 		{
		// 			this.staffContractDetailId = result.data.staffContractDetail.id;
		// 		}
		// 		else
		// 		{
					
		// 		}
		// 	});
		// }

		if (!this.isResponseSaved && this.type != 'new') return;

		if (number == this.formNo || this.parentId == -1) return;

		if (this.isUnsavedForm) 
		{
		  let heading = 'Confirmation';
		  let message = 'You have unsaved changes, are you sure you want to leave ?';
		  let leftButton = 'Cancel';
		  let rightButton = 'Leave';
		  this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then((val)=> {
			 if (val) {
				if (number > 1 && this.parentId == -1)
				{
					return;
				}
		
			  this.formNo = number;
			  this.communicationService.unSavedForm.next(false);
			 }
		  })
		} else 
		{
			if (number > 1 && this.parentId == -1)
			{
				return;
			}
			this.formNo = number;
		}


	}

	public ngOnDestroy(): void
	{
		this.subscription.unsubscribe();
	}

	onEmitFormData(event)
	{
		console.log('onEmitFormData', event);

		if (event.type == 'hideShiftPattern') {
			this.childFormLabels[2].hide = event.value;
			this.hideShift = event.value;
			return;
		}

		if (event.type == 'parent')
		{
			this.parentId = event.value;
			this.formDetailApi = config.base_url_slug + 'view/staff-member/' + this.parentId;
		}
		else if (event.type == 'child' && !this.hideShift)
		{
			this[event.key] = event.value;
		}
		else {
			this.router.navigate(['main/staff']);
		}
	}

	afterDetail() {
		this.isResponseSaved = true;
		if (this.formDetail.staffContractDetail != null)
		{
			this.staffContractDetailId = 100;
		}
	}

	onBack()
	{
		if (this.formNo == 1)
		{
			this.router.navigate(['main/staff']);
		}

		if (this.formNo > 1)
		{
			this.formNo = this.formNo - 1;
		}
	}
}
