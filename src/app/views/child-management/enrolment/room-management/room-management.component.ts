import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { map, startWith } from 'rxjs/operators';
import { AlertService, ApiService, PermissionService, CommunicationService, AutocompleteFiltersService } from 'src/app/services';
import { getFundingFieldMsg } from 'src/app/shared/field-validation-messages';
import { ParentFormComponent } from 'src/app/shared/parent-form.component';
import { config } from 'src/config';

@Component({
  selector: 'app-room-management',
  templateUrl: './room-management.component.html',
  styleUrls: ['./room-management.component.scss']
})
export class RoomManagementComponent extends ParentFormComponent implements OnInit
{

  footerProps: any;
  select: any;
  @Input() childId: any;
  redirectUrl = 'main/children';
  editPermit: any;
  tableConfigAndProps = {};
  dataSource: any;
  roomsList: any[] = []
  upcomingRooms: any[] = []
  toolTipText = '1 yr 2 months &#013; sdsds';
  filteredRooms = [];
  columnHeader = {
    'currentRoom': 'Current Room', 'upcomngRoom': 'Upcoming Room Move', 'dateToMove': 'Move Date'
  }
  inputData = {
    'actionColumn': 'Actions',
    'buttonEvent': "output",
    'hasCheckBox': false,

  }
  isUpdateUrl: boolean = false;
  constructor(protected router: Router,
    protected _route: ActivatedRoute,
    protected alertService: AlertService,
    protected apiService: ApiService,
    protected formbuilder: FormBuilder,
    protected dialog: MatDialog,
    protected filterService: AutocompleteFiltersService,
    protected permissionsService: PermissionService,
    protected communicationService: CommunicationService)
  {
    super(router, _route, alertService, apiService, formbuilder, dialog, communicationService, permissionsService);
    this.Form.addControl('childId', new FormControl(null, [Validators.required]));
    this.Form.addControl('roomId', new FormControl(null, [Validators.required]));
    this.Form.addControl('type', new FormControl('automatic', [Validators.required]));
    this.Form.addControl('roomLabel', new FormControl(null));

    this.isMultiple = false;
    this.editPermit = this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Children').update;

    this.communicationService.getChild().subscribe(childData => console.log(childData));

    this.dataSource = new MatTableDataSource([]);
    this.tableConfigAndProps = {
      ActionButtons: [],
      inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
    };
    this.Form.get('type').valueChanges.subscribe(value =>
    {
      if (value == 'automatic')
      {
        this.Form.get('roomId').clearValidators();
        this.Form.get('roomId').updateValueAndValidity();

      }
      else
      {
        this.Form.get('roomId').setValidators(Validators.required);
        this.Form.get('roomId').updateValueAndValidity();

      }
    })

    	// Populate autcomplete data for ageBand
			let room = this.Form.get('roomLabel').valueChanges.pipe(
				startWith(''),
				map(value => this.filterService._filterRooms(value, this.rooms))
			);
			room.subscribe((d)=> this.filteredRooms =  d);
	    // End
  }

  ngOnInit(): void
  {
    if (this.parentId != -1)
    {
      this.Form.controls['childId'].setValue(this.parentId);
    }
    this.sub = this._route.params.subscribe(params =>
    {
      this.id = params['id'];
      if (this.id == 'add')
      {
        if (this.parentId != -1)
        {
          this.formApi = config.base_url_slug + "add/child-room-allocation";
          this.detailApi = config.base_url_slug + 'view/child-allocated-room/' + this.parentId;
          this.getDetail();

          if (this.childId != -1)
          {
            this.formApi = config.base_url_slug + 'update/child-room-allocation/' + this.parentId;
          }
          else
          {
            this.formApi = config.base_url_slug + "add/child-room-allocation";
          }
        }
      }
      else
      {
        if (this.childId != -1)
        {
          console.log("chid id ", this.childId);

          this.formApi = config.base_url_slug + 'update/child-room-allocation/' + this.id;
          this.detailApi = config.base_url_slug + 'view/child-allocated-room/' + this.id;
          this.getDetail();
        }
        else
        {
          this.formApi = config.base_url_slug + 'add/child-room-allocation';
        }
      }
      this.communicationService.unSavedForm.next(false);

    });

    super.ngOnInit();
    this.getUpcomingRooms();
    this.getRooms(localStorage.getItem('branchId'));

  }
  getUpcomingRooms()
  {
    this.apiService.get(config.base_url_slug + 'view/child-upcoming-moves/' + this.id).then(response =>
    {
      this.upcomingRooms = response.data.listing;
      this.upcomingRooms.forEach(element =>
      {
        let dateToMoveText = element.dateToMove == null ? "-" : element.dateToMove == "No Upcoming moves"? element.dateToMove : moment(new Date(element.dateToMove)).format(config.cmsDateFormat);
        element['dateToMove'] = dateToMoveText;
      });
      this.dataSource = new MatTableDataSource(this.upcomingRooms);
      this.tableConfigAndProps = {
        ActionButtons: [],
        inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource, hasTickIcon: true
      };
    })
  }
  beforeSubmit()
  {
    this.isMultiple = false;
    if (this.Form.get('type').value == 'manual')
    {
      delete this.Form.value.type
    }
    else
    {
      this.Form.get('roomId').clearValidators()
      this.Form.get('roomId').updateValueAndValidity()
      delete this.Form.value.roomId
    }
  }

  onSubmit()
  {
    this.beforeSubmit();
    let url = '';
    let type = '';
    if (this.Form.invalid)
    {
      this.alertService.alertError('WARNING', 'please fill the required data.');
      return;
    }


    if (this.id == 'add')
    {
      url = config.base_url_slug + "add/child-room-allocation";
      type = 'post';
    }
    else if (this.id != 'add' && !this.isUpdateUrl)
    {
      url = config.base_url_slug + "add/child-room-allocation";
      type = 'post';
    }
    else
    {
      url = config.base_url_slug + 'update/child-allocated-room/' + this.formDetail.id;
      type = 'patch';
    }

    this.apiService[type](url, this.Form.value).then((res) =>
    {
      console.log(res);
      if (res.code == 200 || res.code == 201)
      {
        this.alertService.alertSuccess('SUCCESS', res.message).then(result =>
        {
          // window.history.back();
          this.communicationService.unSavedForm.next(false);
          this.router.navigateByUrl('main/children');
        });
      // } else if (res.code = 202)
      // {
      //   this.alertService.alertInfo("WARNING", res.message);
      } else
      {
        this.alertService.alertError("ERROR", res.error.message);
      }
    })
      .catch(err => console.log(err));
  }

  getErrorMessage(field: any): any
  {
    return getFundingFieldMsg[field];
  }

  checkType()
  {
    if (this.type != "")
    {
      if (this.type === 'view')
      {
        this.title = "View " + this.title;
        this.footerProps = {
          'hasButton': false,
          'type': 'view'
        };
        this.onlyImage = true;
        this.Form.disable();
        this.disableInput = true;

        // Refresh Data
        this.detailApi = config.base_url_slug + 'view/child-allocated-room/' + this.id;
        this.getDetail();
        // End

      }
      else if (this.type === 'edit')
      {
        this.footerProps = {
          'buttonLabel': "Update Info",
          'hasbackButton': true,
          'backButtonLabel': 'Cancel',
          'hasButton': true,
          'hasSubButton': false,

        };
        this.Form.enable();
        this.disableInput = false;
        this.onlyImage = false;
        this.title = "Update " + this.title;
        this.communicationService.unSavedForm.next(false);
      }
      else
      {
        this.footerProps = {
          'buttonLabel': "Save Info",
          'hasbackButton': true,
          'backButtonLabel': 'Cancel',
          'hasButton': true,
          'hasSubButton': false,
        };
        this.onlyImage = false;
        this.title = "Add New " + this.title;
      }
      this.footerProps['backColor'] = '#C1BBB9';
    }
  }

  afterDetail(): void
  {

    if (!this.formDetail)
    {
      this.isUpdateUrl = false;
    }
    else
    {
      this.isUpdateUrl = true;
      // this.Form.patchValue(this.formDetail?.childFinanceDetail);
      // End
    }
    this.emptyForm = this.Form.value;

  }
  goToEdit()
  {
    this.type = 'edit';
    this.checkType();
  }
  afterRoom()
  {
    this.roomsList = this.rooms;
    console.log("Rooms", this.roomsList);

    this.filteredRooms = [...this.rooms];
    // Setting fundingType manually for autocomplete
      let room = this.rooms.find(x => x.value == this.formDetail.roomId);
      this.Form.get('roomLabel').setValue(room ? room.label : null);
    // End

    this.communicationService.unSavedForm.next(false);
  }

  setValue() {
		let room = this.rooms.find(x => x.label == this.Form.get('roomLabel').value);
		this.Form.get('roomId').setValue(room ? room.value : null);
	}

}
