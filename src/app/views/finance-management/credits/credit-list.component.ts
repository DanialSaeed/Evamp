import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { config } from 'src/config';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

export class selectedItem
{
  id: string;
  childId: string;
}

@Component({
  selector: 'app-credit-list.component',
  templateUrl: './credit-list.component.html',
  styleUrls: ['./credit-list.component.scss', '/src/app/views/shared-style.scss']
})
export class CreditListComponent extends GlobalListComponent implements OnInit
{
  tableConfigAndProps = {};
  dataSource = new MatTableDataSource();
  layoutAlign = "start start";
  columnHeader = {};
  buttonHeaderProps: any;
  public date = moment();
  @Input() selectedItems: selectedItem[] = [];
  headerCheckBoxValue: boolean = false;

  headerProps = {
    searchConfig: {
      label: 'Enter Child Name',
      key: 'branchId',
      value: ''
    },
    builtInFilters: {
      key: 'branchId',
      value: localStorage.getItem('branchId')
    },
    filterArray: [{
      label: 'Select Room',
      type: 'date',
      key: 'roomId',
      selected: 'All',
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
    'buttonEvent': "output",
    'hasCheckBox': this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Credit').read,
    'checkBoxCol': "checkbox",
    'onlyOneCheck': false,
  }

  constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected dialog: MatDialog,
    protected permissionsService: PermissionService)
  {
    super(router, apiService, alertService, permissionsService);

    this.listApi = config.base_url_slug + 'view/childs/credits';
    this.getRoomsforDropdown(localStorage.getItem('branchId'));
    // 'buttonEvent': 'output'  on events
    this.headerButtons = [{
      buttonLabel: "Export as CSV",
      color: "#E2AF2A",
      buttonRoute: "",
      type: "output",
      visibility: false
    },
    {
      buttonLabel: "Add New",
      color: "#E2AF2A",
      buttonRoute: "finance/credits/add",
      visibility: this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Credit').create
    },
    ];
    this.buttonHeaderProps = {
      headingLabel: "New Credits",
      hasRightLabel: false,
      rightLabel: "date time",
      ActionButtons: this.headerButtons,
      hasButton: true,
      hasHeading: true,
      labelMargin: '0px',
      float: 'right',
      textclass: 'text-bolder text-color',
      buttonsMargin: '0px 10px 0px',
      margin: '10px',
      // builtInFilters: { key: 'branchId', value: localStorage.getItem('branchId') }
    };
    this.actionButtons = [{
      buttonLabel: "Edit",
      type: 'edit',
      buttonRoute: "",
      visibility: this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Credit').update
    },
    {
      buttonLabel: "View",
      type: 'view',
      buttonRoute: "",
      visibility: this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Credit').read
    },
    {
      buttonLabel: "Delete",
      type: 'delete',
      buttonRoute: "child/credit",
      visibility: this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Credit').delete
    },
    ]

    this.columnHeader = {
      'checkbox': '',
      'id': 'ID',
      'childName': 'Child Name',
      'startDate': 'Date',
      'memoString': 'Memo',
      'amount': 'Amount',
      'Actions': 'Actions',
    };

    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: this.dataSource,
    };

    this.headerProps.searchConfig.label = 'Search by Name';

    super.ngOnInit();

    this.setCsvVisibility();
  }

  afterRoom()
  {
    this.headerProps = {
      searchConfig: {
        label: 'Enter Child/Parent Name',
        key: 'branchId',
        value: ''
      },
      builtInFilters: {
        key: 'branchId',
        value: localStorage.getItem('branchId')
      },
      filterArray: []
    };
  }

  afterListResponse(): void
  {
    this.dataItems.forEach(element =>
    {
      element['childName'] = element['child'].firstName + " " + element['child'].lastName;
      element['amount'] = '£' + element['amount'];
      element['memoString'] = element['memo'];
      
      element.startDate = moment(new Date(element.startDate)).format(config.cmsDateFormat);
      
    });

    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: new MatTableDataSource(this.dataItems),
      pagination: this.pagination,
      onlyDelete: true
    };
  }

  actionButtonOutput(event)
  {
    console.log('actionButtonOutput ==> ', event);
    let id = event.row.id;
    let url = '/main/finance/credits/';
    if (event.item.type === "view")
    {
      url = url + 'view/' + id;
      this.router.navigateByUrl(url);
    } else if (event.item.type === "edit")
    {
      url = url + 'edit/' + id;
      this.router.navigateByUrl(url);
    }
    else if (event.item.type === "delete")
    {
      this.onDelete(event.row, event.item)
    }
    else
    {
      // this.openDialog(event);
    }
  }

  onSelectedCheckBoxAllEmit(input)
  {
    this.dataItems.forEach(item =>
    {
      let child = this.selectedItems.find(t => item.id === t);
      if (child)
      {
        if (input == false)
        {
          const index = this.selectedItems.indexOf(child, 0);
          if (index > -1)
          {
            this.selectedItems.splice(index, 1);
          }
        }
      }
      else
      {
        this.selectedItems.push(item.id);
      }
    });

    this.setCsvVisibility();
  }

  onSelectedCheckBoxEmit(res)
  {
    if (res.checked == true)
    {
      let child = this.selectedItems.find(t => res.element.id === t);
      if (!child)
      {
        this.selectedItems.push(res.element.id);
      }
    } else
    {
      for (var i = 0; i < this.selectedItems.length; i++)
      {
        if (this.selectedItems[i] == res.element.id)
        {
          this.selectedItems.splice(i, 1);
          break;
        }
      }
    }

    this.setCsvVisibility();
  }

  setCsvVisibility()
  {
    if (this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Credit').read && this.selectedItems.length > 0)
    {
      this.buttonHeaderProps['ActionButtons'][0].visibility = true;
    }
    else
    {
      this.buttonHeaderProps['ActionButtons'][0].visibility = false;
    }
  }

  onHeaderCheckBoxValueEmit(input)
  {
    this.headerCheckBoxValue = input;
    // this.onSelectedCheckBoxAllEmit(input);
  }

  onSaveasCsv() {    
    let csvEndpoint = config.base_url_slug + "v2/export/childs/credits-csv";
    
    this.apiService.post(csvEndpoint, {creditsIds: this.selectedItems}).then((res)=> {
      console.log(res);
      if (res.code == 200 || res.code == 201 || res.code == 202) {
        this.downloadCSV(res.data);
        // this.router.navigate(['main/finance/allInvoice']);
        // this.alertService.alertSuccess('SUCCESS', 'Invoice Generated Successfully');
      }
    })
    .catch(err => console.log(err));
    
  }

  downloadCSV(url) {
    let link = document.createElement('a');
    link.href = url;
    link.download = url.substr(url.lastIndexOf('/') + 1);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  filnalFilters(event): void
  {
    let filterUrl = '';
    console.log('filnalFilters', event);
    let branchId = localStorage.getItem('branchId')
    if (event.range)
    {
      filterUrl = filterUrl + event.range + '&branchId=' + branchId;
    } else
    {
      let startDate = this.date.startOf('month').format(config.serverDateFormat);
      let endDate = this.date.endOf('month').format(config.serverDateFormat);
      filterUrl = filterUrl + 'startDate=' + startDate + '&endDate=' + endDate + '&branchId=' + branchId;
    }

    if (event.search)
    {
      filterUrl = filterUrl + event.search;
    }

    if (event.date)
    {
      filterUrl = filterUrl + event.date;
    }

    console.log('filnalFilters', filterUrl);
    // filterUrl = filterUrl + "&otherAttributes=" + JSON.stringify(_otherAttributes);
    this.getList(filterUrl);
  }
}
