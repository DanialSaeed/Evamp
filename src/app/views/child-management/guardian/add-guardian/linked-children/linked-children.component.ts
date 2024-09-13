import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { config } from 'src/config';
import { ChildLinkModalComponent } from '../child-link-modal/child-link-modal.component';

@Component({
  selector: 'app-linked-children',
  templateUrl: './linked-children.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class LinkedChildrenComponent extends GlobalListComponent implements OnInit
{
  tableConfigAndProps = {};
  dataSource = new MatTableDataSource();
  buttonHeaderProps: any;
  @Output() emitSessionPricing: EventEmitter<any> = new EventEmitter<any>();
  @Output() countForInvoice: EventEmitter<any> = new EventEmitter<any>();
  guardianId: any;

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
  constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected permissionsService: PermissionService, protected dialog: MatDialog,)
  {
    super(router, apiService, alertService, permissionsService);
    this.actionButtons =
      [
        { buttonLabel: "Edit", buttonRoute: "", visibility: true },
        { buttonLabel: "Unlink Child", buttonRoute: "", visibility: true, isConditional: true, condition: [{ key: "showPrimary", value: "False" }] },
      ]
    this.headerButtons = [
    ]
    // , 'Actions': 'Actions'
    this.columnHeader = {
      'name': 'Child Name', 'age': 'Age', 'room': 'Room', 'relationship': 'Relationship', 'type': 'Primary', 'Actions': 'Actions'
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
    let sub = this._route.params.subscribe(params =>
    {
      this.guardianId = params['id'];
    })

    if (this.guardianId != 'add')
    {
      this.listApi = config.base_url_slug + 'view/linked-children?attributes=[{"key": "guardianId","value":' + this.guardianId + '}]';
      this.getList()
    }
    super.ngOnInit();
  }

  ngOnInit(): void
  {
  }
  afterListResponse(): void
  {
    this.dataItems.forEach(element =>
    {
      element['name'] = element.childs.firstName + ' ' + (element.childs.lastName || '');
      element['room'] = element.childs.room_allocation ? element.childs.room_allocation.room : '-';
      element['relationship'] = element.guardian_relations ? element.guardian_relations.relationType : '-';
      element['type'] = element.type == 'primary' ? 'Yes' : 'No';
      if (
        element.type == "Yes")
      {
        element['showPrimary'] = 'True';
      }
      else
      {
        element['showPrimary'] = 'False';
      }
      element['url'] = `main/enrolment/${element.childId}/view`;

      if (element.childs.dateOfBirth != 0)
      {
        var currentMoment = moment(new Date());
        var dobMoment = moment(new Date(element.childs.dateOfBirth));
        let years = currentMoment.diff(dobMoment, 'years');
        dobMoment.add(years, 'years')
        let months = currentMoment.diff(dobMoment, 'months');
        dobMoment.add(months, 'months');
        let y = years != 0 && !isNaN(years) ? years + ' year(s)' : '';
        let m = months != 0 && !isNaN(months) ? months + ' month(s)' : '';
        console.log(y + " yrs " + m + " months");
        element['age'] = y == '' && m == '' ? '-' : y + ' ' + m;
      }
    });
    let count = this.dataItems.filter(child => child.type == "Yes").length;
    this.countForInvoice.emit(count);
    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: new MatTableDataSource(this.dataItems),
      pagination: this.pagination,
      onlyDelete: false
    };
  }
  actionButtonOutput(event)
  {
    console.log('actionButtonOutput ==> ', event);
    if (event.item.buttonLabel == 'Edit')
    {
      let dialogRef = this.dialog.open(ChildLinkModalComponent, { width: '600px' });
      dialogRef.componentInstance.parentId = event.row.guardianId;
      dialogRef.componentInstance.formType = 'update';
      dialogRef.componentInstance.child = event.row;
      dialogRef.componentInstance.relationType = event.row.guardian_relations.relationType;
    }
    else if (event.item.buttonLabel == 'Unlink Child')
    {
      this.apiService.delete(config.base_url_slug + 'remove/unlink-child/' + event.row.id).then(res =>
      {
        // console.log("Res", res);
        if (res.code == 200)
        {
          this.alertService.alertSuccess("Success", res.message)
          this.getList();
        }
        else
        {
          this.alertService.alertError("Error", res.message)
        }

      })
    }
  }
}
