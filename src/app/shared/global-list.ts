import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService, ApiService, PermissionService } from '../services';
import * as moment from 'moment';
import { when } from 'jquery';
import { config } from 'src/config';

export class TableFiltersOptions
{
  label: string;
  value: any;
  key: string;
}

export class TableFilters
{
  label: string;
  type: string;
  key: string;
  selected: any;
  options: TableFiltersOptions[]
}

export class ActionButton
{
  buttonLabel: string;
  buttonRoute: string;
  type?: string;
  visibility: boolean = true;
  isConditional?: boolean = false;
  condition?: any = null;
  hide?: boolean = false;
}

export class HeaderButton
{
  buttonLabel: string;
  buttonRoute: string;
  color: string;
  type?: string;
  isMultiple?: boolean;
  firstFormName?: string;
  visibility: boolean = true;
}

@Component({
  selector: 'app-global-list',
  template: ``
})
export class GlobalListComponent implements OnInit
{
  dataItems: any[] = [];
  rooms: any[] = [];
  sessions: any[] = [];
  pagination: any;
  page: any = 1;
  perPage: any = 20;
  filterUrl: any;


  deleteApi: string;
  listApi: string;

  detailUrl: string;
  createUrl: string;
  updateUrl = '';
  detailApi: string;
  formDetail: any;
  section: string;
  deleteItems: any;
  filterArray: TableFilters[] = [];
  nurseries: any;
  paginationUrl: string;
  sdnUser: any;
  notApprovedNames = ""
  canApprove: boolean = true;
  firstFormName: string;
  isMultiple: any;
  isHideAddButton: any = false;

  actionButtons: ActionButton[] = [];
  headerButtons: HeaderButton[] = [];
  columnHeader: any;
  sortUrl = '';
  customMessage = '';
  baseResponse: any;


  constructor(protected router: Router, protected apiService: ApiService, protected alertService: AlertService, protected permissionsService?: PermissionService)
  {
    this.dataItems = [];

    this.nurseries = JSON.parse(localStorage.getItem('nurseries'));

    this.filterArray = [
      {
        label: 'Select Nursery', type: 'search', key: 'nurseryId', selected: 'All',
        options: []
      },
      {
        label: 'Sort by Name', type: 'sort', key: 'name', selected: 'All',
        options: [
          { key: 'All', value: 'All', label: 'All' },
          { key: 'ASC', value: 'ASC', label: 'Ascending' },
          { key: 'DESC', value: 'DESC', label: 'Descending' }
        ]
      },
      {
        label: 'Filter by Status', type: 'filter', key: 'status', selected: 'All',
        options: [
          { key: 'All', value: 'All', label: 'All' },
          { key: 'status', value: true, label: 'Active' },
          { key: 'status', value: false, label: 'Inactive' }
        ]
      },
    ]
    this.paginationUrl = '&page=' + this.page + '&perPage=' + this.perPage;
  }

  ngOnInit()
  {
  }

  onCreate(): void
  {
    this.router.navigateByUrl(this.createUrl);
  }

  onSuperDetail(): void
  {
    this.router.navigateByUrl(this.detailUrl);
  }

  onDateRange(event): void
  {
  }

  onPagination(event): void
  {
    this.paginationUrl = '&page=' + event.page + '&perPage=' + event.perPage;
    this.page = event.page

    this.getList(this.filterUrl);
  }

  filnalFilters(event): void
  {
    let filterUrl = '';

    if (event.filter.length > 0)
    {
      filterUrl = '&attributes=' + JSON.stringify(event.filter);
    }
    else if (event.filter.length == 0)
    {
      filterUrl = '&attributes=[]';
    }

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
    this.getList(filterUrl)
  }

  getList(filterUrl?: any): void
  {
    let url;
    let queryParamExist = this.listApi.includes('?');
    if (queryParamExist)
    {
      url = this.listApi;
    }
    else
    {
      url = this.listApi + '?';
    }
    this.filterUrl = '';

    if (filterUrl)
    {
      url = url + filterUrl;
      this.filterUrl = filterUrl;
    }

    if (this.paginationUrl)
    {
      url = url + this.paginationUrl;
    }

    if (this.sortUrl)
    {
      url = url + this.sortUrl;
    }

    this.apiService.get(url).then(result =>
    {
      if (result.code === 200)
      {
        if (result.data.hasOwnProperty('listing'))
        {
          this.dataItems = result.data.listing;
        }
        else if (result.data?.active_child_bookings)
        {
          this.dataItems = result.data.active_child_bookings
        }
        else
        {
          this.dataItems = result.data;
        }
        this.dataItems?.forEach((element, index) =>
        {
          // let date = element.createdTime;
          // if (date)
          // {
          //     element['dateTime'] = moment(date * 1000).format('MM/DD/YYYY HH:mm');
          // }
          // else
          // {
          //     element['dateTime'] = moment().format('MM/DD/YYYY HH:mm');
          // }
          if (this.page == 1)
          {
            element['serialNumber'] = index + 1;
          }
          else
          {
            element['serialNumber'] = 10 * (this.page - 1) + index + 1;
          }
        });
        this.baseResponse = result.data;
        this.pagination = result.data.pagination;
        this.afterListResponse();
      }
      else
      {
        this.dataItems = [];
        this.alertService.alertError(result.status, (this.customMessage ? this.customMessage : result.message));
      }
    });
  }

  afterListResponse(): void
  {
  }

  checkAdult(element)
  {
    return element.delete == true;
  }

  onUpdate(data)
  {
    this.alertService.alertError("Please", "Don't touch that button again.");
  }

  statusChanged(event, type)
  {
    this.updateUrl = config.base_url_slug + 'update/' + type + '-status/';
    this.updateUrl = this.updateUrl + event.id;
    var dataTosend = { status: event.status }
    this.onUpdate(dataTosend)
  }

  actionButtonOutput(event)
  {
    if (event.item.type === "delete")
    {
      this.onDelete(event.row, event.item)
      switch (event.item.buttonRoute)
      {
        case 'child': {
          localStorage.removeItem('child-id')
          break;
        }
        case 'staff': {
          localStorage.removeItem('staff-id')
          break;
        }
      }
    } else
    {
      let url;
      if (event.item.buttonLabel == "Archive Child")
      {
        url = '/main/' + event.item.buttonRoute + '/' + event.row.id + '/view';
      }
      else
      {
        url = '/main/' + event.item.buttonRoute + '/' + event.row.id + '/' + event.item.buttonLabel.toLowerCase();
        if (this.isMultiple)
        {
          url = url + '/' + this.firstFormName + '/' + event.row.id + '/' + event.item.buttonLabel.toLowerCase();
        }
      }

      this.router.navigateByUrl(url);
    }
  }

  onDelete(row, item, deleteObj?)
  {
    var url;
    let message = 'Are you sure you want to delete ?';
    let heading = 'Delete Item?';
    if (deleteObj)
    {
      url = deleteObj.url;
      message = deleteObj.message
      heading = deleteObj.heading
    }
    else
    {
      url = config.base_url_slug + "remove/" + item.buttonRoute + '/' + row.id
    }
    let rightButton = 'Delete';
    let leftButton = 'Cancel';
    this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then(result =>
    {
      if (result)
      {
        this.apiService.delete(url).then(result =>
        {
          if (result.code == 200 || result.code == 201)
          {
            this.getList(this.filterUrl);
            this.afterDeleteSuccess();
            this.alertService.alertSuccess(result.status, result.message);
          }
          else if (result?.error)
          {
            this.alertService.alertError(result.error.status, result.error.message);
          }
          else
          {
            this.alertService.alertError(result.status, result.message);
          }
        });
      }
    })

  }

  // star nursery
  genericHeadingProps(label, textClass, margin)
  {
    var props
    props = {
      headingLabel: label,
      hasButton: false,
      hasHeading: true,
      hasRightLabel: false,
      showBack: false,
      labelMargin: '20px',
      textclass: textClass,
      margin: margin
    }
    return props
  }

  getDetail(): void
  {
    console.log(this.detailApi);
    this.apiService.get(this.detailApi).then(result =>
    {
      if (result.code === 200 && result.data)
      {

        this.formDetail = result.data;
        // this.Form.patchValue(this.formDetail);
        this.afterDetail();

      }
      else
      {
        this.formDetail = {};
        this.alertService.alertError(result.status, result.message);
      }
    });
  }

  afterDetail(): void
  {

  }
  getRooms(branchId: any): any
  {
    let data = [];
    let url = config.base_url_slug + 'view/rooms?sortBy=name&sortOrder=DESC&attributes=[{"key": "branchId","value": "' + branchId + '" }]';
    this.apiService.get(url).then(res =>
    {
      if (res.code == 200)
      {
        res.data.listing.forEach(element =>
        {
          let dict = {
            key: 'branchId',
            value: element.id,
            label: element.name,
          }
          data.push(dict);
        });

        this.rooms = data;
        this.afterRoom()
      }
      else
      {
        this.rooms = [];
      }
    });

  }

  getRoomsforDropdown(branchId: any)
  {
    let data = [];
    let url = config.base_url_slug + 'view/rooms?sortBy=name&sortOrder=DESC&fetchType=dropdown&attributes=[{"key": "branchId", "value": "' + branchId + '" }]';
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
            totalCapacity: element.totalCapacity
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

  getSessionsForDropdown(branchId:any){
    let url = config.base_url_slug + 'view/sessions?attributes=[{"key": "branchId", "value": "' + branchId + '" }]&page=1&perPage=1000';
    let data = [];
    this.apiService.get(url).then(res =>
    {
      if (res.code == 200)
      {
        res.data.listing.forEach(element =>
        {
          let dict = {
            key: 'branchId',
            value: element.id,
            label: element.name
          }
          data.push(dict);
        });

        this.sessions = data;
        this.afterSession();
      }
      else
      {
        this.sessions = [];
      }
    });
  }

  afterRoom()
  {

  }
  afterSession(){
  }

  afterDeleteSuccess()
  {

  }
}
