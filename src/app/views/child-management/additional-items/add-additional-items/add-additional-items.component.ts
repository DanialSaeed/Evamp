import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, CommunicationService } from 'src/app/services'
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
@Component({
	selector: 'app-add-additional-items',
	templateUrl: './add-additional-items.component.html',
	styleUrls: ['/src/app/views/shared-style.scss']
})
export class AddAdditionalItemsComponent extends GlobalFormComponent implements OnInit {
	formNo = 1;
	childData: any = [];
	route: any;
	id: any;
	private subscription: Subscription;
	constructor(protected router: Router,
		protected _route: ActivatedRoute,
		protected alertService: AlertService,
		protected apiService: ApiService,
		protected formbuilder: FormBuilder,
		protected dialog: MatDialog,
		protected communicationService: CommunicationService,) {
		super(router, _route, alertService, apiService, formbuilder, dialog);
		this.subscription = this.communicationService.getAdditionalItems().subscribe(data => {
			// here fetch data from the session storage 
			console.log(data, "through communication");
			this.onFormClick(data['number']);
		})
	}

	ngOnInit(): void {
		this.route = this._route
		let sub = this._route.params.subscribe(params => {
			this.id = params['id'];
			this.type = params['type'];
		});
		console.log("after detail =", this.id, this.type);
		super.ngOnInit();
	}

	receiveData(itemData) {
		this.childData = itemData;
		this.childData.forEach(element => {
			this.parentId = element?.id;
			console.log("element", element);
			
		});

	}

	onFormClick(number) {
		if (number > 1 && this.parentId == null) {
			return;
		}

		// if (this.id == 'add') {
		// 	if (number < this.formNo) {
		// 		return;
		// 	}
		// }
		this.formNo = number;
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

	afterDetail(): void {
		this.formDetail = this.formDetail;
		console.log("after detail =", this.formDetail);
	}

	onBack() {
		if (this.formNo == 1) {
			this.router.navigate(['main/additional-items']);
		}

		// if (this.id == 'add') {
		// 	return;
		// }

		if (this.formNo > 1) {
			this.formNo = this.formNo - 1;
		}
	}

}
