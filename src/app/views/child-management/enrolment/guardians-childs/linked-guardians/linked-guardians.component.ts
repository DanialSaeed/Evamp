import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { config } from 'src/config';


@Component({
  selector: 'app-linked-guardians',
  templateUrl: './linked-guardians.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class LinkedGuardiansComponent extends GlobalListComponent implements OnInit
{
  tableConfigAndProps = {};
  dataSource = new MatTableDataSource();
  buttonHeaderProps: any;
  @Input() relations: any;
  @Input() childId: any;
  @Output() emitSessionPricing: EventEmitter<any> = new EventEmitter<any>();
  @Output() isHistoryExists: EventEmitter<any> = new EventEmitter<any>();
  @Output() dataToEdit: EventEmitter<any> = new EventEmitter<any>();
  @Output() listCount: EventEmitter<any> = new EventEmitter<any>();

  id: any;

  inputData = {
    'imageColumn': 'profilePicture',
    'actionColumn': 'Actions',
    'expandColumn': 'expandable',
    'firstColumn': 'No.',
    'lastColumn': '',
    'roundedTable': false,
    'hasSwitch': false,
    'buttonEvent': "output",
    'hyperLink': true
  }
  constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected permissionsService: PermissionService)
  {
    super(router, apiService, alertService, permissionsService);


    this.actionButtons =
      [
        { buttonLabel: "Edit", buttonRoute: "", visibility: this.permissionsService.getPermissionsByModuleName('Session Management').update },
        { buttonLabel: "Unlink", buttonRoute: "", visibility: this.permissionsService.getPermissionsByModuleName('Session Management').delete, isConditional: true, condition: [{ key: "canUnlink", value: "True" }] },
        { buttonLabel: "Make as Primary Guardian", buttonRoute: "", visibility: true, isConditional: true, condition: [{key: "canMarkPrimary", value: "True"}] },
      ]
    this.headerButtons = [
      { buttonLabel: "Create Session", color: "#E2AF2A", buttonRoute: "session/add", isMultiple: false, firstFormName: 'session-info', visibility: this.permissionsService.getPermissionsByModuleName('Session Management').create },
    ]
    // , 'Actions': 'Actions'
    this.columnHeader = {
      'id': 'ID', 'name': 'Parent/Guardian Name', 'relationship': 'Relationship', 'type': 'Primary', 'Actions': 'Actions'
    };
    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
    };

    this.buttonHeaderProps = {
      headingLabel: "Session ",
      ActionButtons: this.headerButtons,
      hasButton: true,
      hasHeading: true,
      labelMargin: '10px',
      textclass: 'text-bolder text-color',
      margin: '0px',
      hasFilters: true,
      searchConfig: { label: 'Search', key: 'branchId', value: '' },
      builtInFilters: { key: 'branchId', value: localStorage.getItem('branchId') }
    };

    setTimeout(() =>
    {
      let sub = this._route.params.subscribe(params =>
      {
        this.id = params['id'];
      })

      if (this.id != 'add')
      {
        this.listApi = config.base_url_slug + 'view/linked-guardians/' + this.id;
        this.getList()
      }
      else if (this.id == 'add' && this.childId)
      {
        this.listApi = config.base_url_slug + 'view/linked-guardians/' + this.childId;
        this.getList()
      }
    }, 500);
    super.ngOnInit();
  }

  ngOnInit(): void
  {
  }
  afterListResponse(): void
  {

    this.dataItems.forEach(element =>
    {
      element['name'] = element.guardians.name ? element.guardians.name : element.guardians.organizationName;
      let r = this.relations.find(relation => relation.id == element.guardianRelationId);
      element['relationship'] = r?.relationType ? r.relationType : "Other";
      let type = element.type ? element.type.charAt(0).toUpperCase() + element.type.slice(1) : '';
      element['type'] = type;

      if (element.guardians.type == "guardian" && element.type != "Primary")
      {
        element['canMarkPrimary'] = 'True'
      } else 
      {
        element['canMarkPrimary'] = 'False'
      }

      if (element.type == "Primary")
      {
        element['canUnlink'] = 'False';
      }
      else
      {
        element['canUnlink'] = 'True';
      }
      
      element['url'] = `main/guardian/${element.guardianId}/view`;

    });
    // console.log("this.dataItems", this.dataItems);
    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: new MatTableDataSource(this.dataItems),
      pagination: this.pagination,
      onlyDelete: false
    };
    this.listCount.emit(this.dataItems.length)
  }
  actionButtonOutput(event)
  {
    // console.log('actionButtonOutput ==> ', event);
    if (event.item.buttonLabel == "Edit")
    {
      this.dataToEdit.emit(event.row);
    }
    else if (event.item.buttonLabel == "Unlink")
    {
      let heading = 'Confirmation';
      let message = 'Are you sure you want to unlink this guardian?';
      let rightButton = 'Yes';
      let leftButton = 'No';
      this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then(result =>
      {
        console.log(result);
        if (!result)
        {
          return;
        } else
        {
          let url = config.base_url_slug + "remove/linked-guardian/" + event.row.id
          this.apiService.delete(url).then(res =>
          {
            console.log(res);
            if (res.code == 200 || res.code == 201)
            {
              this.alertService.alertSuccess('SUCCESS', res.message).then(result =>
              {
                this.getList();
              });
            } else if (res.code == 202){
              this.alertService.alertError('Error', res.message).then(result =>
                {
                  this.getList();
                });
            }
          })
            .catch(err => console.log(err));
        }
      });
    }

    else if (event.item.buttonLabel == "Make as Primary Guardian")
    {
      let heading = 'Confirmation';
      let message = 'Would you like to change the primary guardian for this child?';
      let rightButton = 'Yes';
      let leftButton = 'No';
      this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then(result =>
      {
        console.log(result);
        if (!result)
        {
          return;
        } else
        {
          let url = config.base_url_slug + "update/marked-guardian/" + event.row.id;
          let object = {
            childId: event.row.childId,
            guardianId: event.row.guardianId
          }
          this.apiService.patch(url, object).then(res =>
          {
            console.log(res);
            if (res.code == 200 || res.code == 201 || res.code == 202)
            {
              this.alertService.alertSuccess('SUCCESS', res.message).then(result =>
              {
                this.getList();
              });
            }
          })
            .catch(err => console.log(err));
        }
      });
    }
  }

}
