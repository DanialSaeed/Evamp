import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AlertService, ApiService, CommunicationService } from 'src/app/services';
import { config } from 'src/config';

export class selectedItem
{
    id: string;
    name: string;
    room?: string;
}

@Component({
	selector: 'app-credit',
	templateUrl: './credit.component.html',
	styleUrls: ['/src/app/views/shared-style.scss']
})
export class CreditComponent implements OnInit
{
	formNo = 1;
	showDuration: boolean = false;
	selected: any;
	afterSuccessFirst: any = false;
	route: any;
	parentId: any;
	formDetail: any;
	id: any;
	url: any;
	childId: any;
	type: any;
	rooms = [];
	selectedIds: any;
	selectedItems: selectedItem[] = [];

	// For select component
	pageHeading: any = "Select Children";
	filterHeading: any = "Enter Child Name";
	columnHeader: any =  {
		'checkbox': '', 'id': 'ID', 'name': 'Childs Name', 'lastName': 'Parents Name', 'room': 'Room Name'
	  };
	footerProps: any = {
		'subButtonLabel': "Add Credit",
		'hasSubButton': true,
		'type': 'output',
		'color': '#e2af2a'
	};
	filters: any = [{ 'key': 'activeBooking', 'value': true }];
	headerProps: any = {
		searchConfig: {
		  label: this.filterHeading,
		  key: 'branchId',
		  value: ''
		},
		builtInFilters: {
		  key: 'branchId',
		  value: localStorage.getItem('branchId')
		},
		filterArray: [{
		  label: 'Select Room',
		  type: 'search',
		  key: 'roomId',
		  selected: 'All',
		  options: this.rooms
		}, ],
		fxFlexIn: "310px"
	  };
	  inputData = {
		'roundedTable': false,
		'hasSwitch': false,
		'buttonEvent': "output",
		'hasCheckBox': true,
		'checkBoxCol': "checkbox",
		'onlyOneCheck': false,
	  }

	constructor(protected router: Router,
		protected _route: ActivatedRoute,
		protected alertService: AlertService,
		protected apiService: ApiService,
		protected formbuilder: FormBuilder,
		protected dialog: MatDialog,
		protected communicationService: CommunicationService,)
	{

		// super(router, _route, alertService, apiService, formbuilder, dialog);
	}

	ngOnInit(): void
	{
		this.getRoomsforDropdown();
		let sub = this._route.params.subscribe(params =>
		{
			this.id = params['id'];
			this.type = params['type'];
			if (this.type == 'add')
			{}
			else
			{
				this.formNo = 2;
			}
		});
	}

	getRoomsforDropdown(): any
    {
		let branchId = localStorage.getItem('branchId')
        let data = [];
        let url = config.base_url_slug +'view/rooms?sortBy=name&sortOrder=DESC&fetchType=dropdown&attributes=[{"key": "branchId","value": "' + branchId + '" }]';
        this.apiService.get(url).then(res =>
        {
            if (res.code == 200)
            {
                res.data.forEach(element =>
                {
                    let dict = {
                        key: 'branchId',
                        value: element.id,
                        label: element.name,
                    }
                    data.push(dict);
                });

                this.rooms = data;
                this.afterRoom();
            }
            else
            {
                this.rooms = [];
            }
        });
    }

	afterRoom() {
		this.headerProps.filterArray[0].options = this.rooms;
		this.rooms.unshift({label: 'All', value: 'All'});
	}

	onFormClick(number)
	{
		if (number == 2 && this.selectedItems.length == 0)
		{
			this.alertService.alertInfo('Leaving?', 'Please select the list item first.');
			return;
		}

		if(this.type == 'add')
		{
			this.formNo = number;
		}
	}

	onEmitSelectedItems(event: selectedItem[])
	{
		this.selectedItems = event;
	}

	onEmitSelectionDone(event: selectedItem[])
	{
		this.selectedItems = event;
		this.selectedIds = [];
		event.forEach(element => {
			this.selectedIds.push(element['id']);
		});
		this.formNo = 2;
	}
}
