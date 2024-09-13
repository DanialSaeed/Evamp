import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';
import { config } from 'src/config';

@Component({
  selector: 'app-global-additional-items',
  templateUrl: './global-additional-items.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class GlobalAdditionalItemsComponent extends GlobalListComponent implements OnInit
{
  tableConfigAndProps = {};
  dataSource = new MatTableDataSource();
  layoutAlign = "start start"
  buttonHeaderProps: any;

  headerProps = {
    searchConfig: { label: 'Search', key: 'branchId', value: '' },
    builtInFilters: { key: 'branchId', value: localStorage.getItem('branchId') },
    filterArray: [{
      label: 'Select Room', type: 'search', key: 'roomId', selected: 'All',
      options: this.rooms
    },],
  };
  inputData = {
    'imageColumn': 'profilePicture',
    'actionColumn': 'Actions',
    'expandColumn': 'expandable',
    'firstColumn': 'No.',
    'lastColumn': '',
    'roundedTable': false,
    'hasSwitch': false,
    'buttonEvent': "output"
  }

  sortBy = '';
  sortOrder = '';

  sortFields: any[] = [
    { asc: false, field: 'id' },
    { asc: false, field: 'room' },
    { asc: false, field: 'childName' },
    { asc: false, field: 'itemName' },
    { asc: false, field: 'matDate' },
    { asc: false, field: 'rateLabel' },
  ];

  constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected dialog: MatDialog,
    protected permissionsService: PermissionService)
  {
    super(router, apiService, alertService, permissionsService);
    // 'buttonEvent': 'output'  on events
    this.actionButtons = [
      { buttonLabel: "Edit", type: 'output', buttonRoute: "", visibility: true },
      // { buttonLabel: "View", type: 'output', buttonRoute: "", visibility: true },
      { buttonLabel: "Delete", type: 'delete', buttonRoute: "settings/additional-item", visibility: true },
    ]
    this.columnHeader = {
      'name': 'Name', 'category': 'Category', 'amount': 'Amount', 'Actions': 'Actions',
    };

    this.headerButtons = [
      { buttonLabel: "Add New", color: "#E2AF2A", buttonRoute: "settings/additional-items/add", isMultiple: false, firstFormName: 'select-children', visibility: true },
    ]
    this.buttonHeaderProps = {
      headingLabel: "Additional Items ",
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

    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
    };
    let branchId = localStorage.getItem('branchId');
    this.listApi = config.base_url_slug + 'view/global/additionalItem?branchId=' + branchId
    super.ngOnInit();
  }

  ngOnInit()
  {
  }

  afterListResponse(): void
  {
    this.dataItems.forEach(element =>
    {
      element.rateLabel = '£' + element.rate;
      if (element['category'] == "additional_item")
      {
        element['category'] = "Additional Item/Service"
      }
      else if (element['category'] == "meal")
      {
        element['category'] = "Meal"
      }
    });

    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: new MatTableDataSource(this.dataItems),
      pagination: this.pagination,
      onlyDelete: true
    };
    // this.title = this.title + " (" + this.pagination.count + ")"
  }

  actionButtonOutput(event)
  {
    if (event?.item?.type === "delete")
    {
      event.item['buttonRoute'] = 'global/additionalItem';
      this.onDelete(event.row, event.item);
    }
    else
    {
      this.router.navigateByUrl(`/main/settings/additional-items/${event.row.id}/view`);
    }
  }

  // openDialog(event): void
  // {
  //   const dialogRef = this.dialog.open(GlobalAdditionalDialogComponent, {
  //     autoFocus: false,
  //     maxHeight: '90vh',
  //     width: '50%',
  //     data: { event: event }
  //   });

  //   dialogRef.afterClosed().subscribe(result =>
  //   {
  //     if (result && result.status == "success")
  //     {
  //       if (result.type == "edit")
  //       {
  //         this.getList(this.filterUrl);
  //       }
  //     }
  //   });
  // }

  filnalFilters(event): void
  {
    let filterUrl = '';
    let _otherAttributes = [];
    _otherAttributes.push({ 'key': 'bookedStudents', 'value': true });

    event.filter.forEach((element, idx) =>
    {
      if (element.key == 'branchId' || element.key == 'roomId')
      {
        _otherAttributes.push(element);
      }
    });

    if (event.sort)
    {
      filterUrl = filterUrl + event.sort;
    }

    if (event.range)
    {
      filterUrl = filterUrl + event.range;
    }

    if (event.search)
    {
      filterUrl = filterUrl + event.search;
    }

    if (event.date)
    {
      filterUrl = filterUrl + event.date;
    }

    filterUrl = filterUrl
    this.getList(filterUrl);
  }

  sortColumn(e)
  {

    this.sortBy = e.field;

    if (e.field == 'room')
    {
      this.sortBy = 'roomId';
    }

    if (e.field == 'itemName')
    {
      this.sortBy = 'item';
    }

    if (e.field == 'childName')
    {
      this.sortBy = 'firstName';
    }

    if (e.field == 'matDate')
    {
      this.sortBy = 'date';
    }

    if (e.field == 'rateLabel')
    {
      this.sortBy = 'rate';
    }

    this.sortUrl = `&sortBy=${this.sortBy}&sortOrder=${e.order}`;
    this.getList(this.filterUrl);
  }

}
