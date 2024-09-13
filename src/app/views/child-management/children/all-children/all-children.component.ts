import { Component, OnInit } from '@angular/core';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, PermissionService, CommunicationService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { config } from 'src/config';

@Component({
  selector: 'app-all-children',
  templateUrl: './all-children.component.html',
  styleUrls: ['./all-children.component.scss']
})
export class AllChildrenComponent extends GlobalListComponent implements OnInit
{
  tableConfigAndProps = {};
  switchData = false;
  dataSource = new MatTableDataSource();
  selectedFilters: any[] = [];
  switchValue = false;

  Actionbuttons =
    [{ buttonLabel: "Edit", buttonRoute: "enrolment" },
    { buttonLabel: "View", buttonRoute: "enrolment" },
    { buttonLabel: "Delete", type: 'delete', buttonRoute: "child" },
    ]
  buttonHeaderProps = {
    ActionButtons: [
			{ buttonLabel: "Create Child", color: "#E2AF2A", buttonRoute: "enrolment/add", isMultiple: false, visibility: this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Enrollment').visibility }
		],
    headingLabel: "Children",
    hasButton: true,
    hasHeading: true,
    labelMargin: '10px',
    float: 'right',
    textclass: 'text-bolder text-color',
    buttonsMargin: '0px 10px 0px',
    margin: '0px',
    hasFilters: true,
    searchConfig: {
      label: 'Enter Child or Parent Name',
      key: 'branchId',
      value: '',
      // extraControl: 'parentName',
      // extraControlLabel: 'Enter Parent Name',
      toggleValue: false,
      onLabel: 'Show All',
      offLabel: 'Show Discounted Children'
    },
    // builtInFilters: { key: 'status', value: '1' },
    builtInFilters: { key: 'branchId', value: localStorage.getItem('branchId') },
    filterArray: [
      {
        label: 'Sort by ', type: 'sort', key: 'firstName', selected: 'All',
        options: [
          { key: 'All', value: 'All', label: 'All' },
          { key: 'ASC', value: 'ASC', label: 'Ascending' },
          { key: 'DESC', value: 'DESC', label: 'Descending' }
        ]
      },
      {
        label: 'Select Age', type: 'filter', key: 'ageGroupId', selected: 'All',
        options: [
          { key: 'All', value: 'All', label: 'All' },
          { key: '1', value: 1, label: 'Under 2 years' },
          { key: '2', value: 2, label: 'Between 2 and 3 years' },
          { key: '3', value: 3, label: 'Between 3 and 5 years' },
          { key: '4', value: 4, label: 'Five Plus' }


        ]
      },
    ]
  };
  inputData = {
    'imageColumn': 'profilePicture',
    'actionColumn': 'Actions',
    'expandColumn': 'expandable',
    'firstColumn': 'No.',
    'lastColumn': '',
    'roundedTable': false,
    'hasSwitch': false,
    'buttonEvent': 'output',

  }


  isMultiple: boolean;
  firstFormName: string;
  sortBy = '';
  sortOrder = '';

  sortFields: any[] = [
    { asc: false, field: 'firstName' },
    { asc: false, field: 'lastName' },
    { asc: false, field: 'dateOfBirth' },
  ];


  constructor(protected router: Router, 
              protected apiService: ApiService, 
              protected _route: ActivatedRoute, 
              protected alertService: AlertService,
              protected comm: CommunicationService,
    protected permissionService: PermissionService)
  {
    super(router, apiService, alertService, permissionService);
    this.actionButtons =
      [
        { buttonLabel: "View", buttonRoute: "enrolment", visibility: this.permissionService.getPermissionsByModuleName('Child Management').read },
        { buttonLabel: "Edit", buttonRoute: "enrolment", visibility: this.permissionService.getPermissionsByModuleName('Child Management').update },
        { buttonLabel: "Delete", type: 'delete', buttonRoute: "child", visibility: this.permissionService.getPermissionsByModuleName('Child Management').delete },
        { buttonLabel: "Mark as active", type: 'output', buttonRoute: "child-booking", visibility: true, isConditional: true, condition: [{ key: 'showMarkActive', value: 'False' }] },
        { buttonLabel: "View Offboarding Details", buttonRoute: "offboard-child", visibility: true, isConditional: true, condition: [{ key: 'showViewOffboardingDetail', value: 'False' }] },

      ]
    this.columnHeader = {
      'id': 'ID', 'firstName': 'First Name', 'lastName': 'Surname', 'parentName': 'Parent Name',
      'gender': 'Gender', 'displayDiscount': 'Discount', 'age': 'Age', 'offboardStatus': 'Status', 'Actions': 'Actions'
    };
    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
    };

    this.listApi = config.base_url_slug + 'v4/view/childs'
    // this.getList()
    super.ngOnInit();

    this.isMultiple = false;
    this.firstFormName = 'basic';
  }

  afterListResponse(): void
  {
    // this.title = "Project Listing"
    this.dataItems.forEach(element =>
    {
      if (element.gender == 'male')
      {
        element.gender = 'Male'
      }
      if (element.gender == 'female')
      {
        element.gender = 'Female'
      }

      if (element.dateOfBirth != 0)
      {
        var currentMoment = moment(new Date());
        var dobMoment = moment(new Date(element.dateOfBirth));

        let years = currentMoment.diff(dobMoment, 'years');
        dobMoment.add(years, 'years')

        let months = currentMoment.diff(dobMoment, 'months');
        dobMoment.add(months, 'months');

        // var days = currentMoment.diff(dobMoment, 'days');

        // console.log("days", days);

        let y = years != 0 && !isNaN(years) ? years + ' year(s)' : '';
        let m = months != 0 && !isNaN(months) ? months + ' month(s)' : '';
        element['displayDiscount'] = element.discount + '%';
        // let d = days != 0 && !isNaN(days) ? days + ' day(s)' : '';

        element['age'] = y == '' && m == '' ? '-' : y + ' ' + m;
        let dob = moment(new Date(element.dateOfBirth)).format(config.cmsDateFormat);
        element.dateOfBirth = dob == 'Invalid date' ? '-' : dob;
      }

      if (element.guardians.length != 0)
      {
        let parentName = element.guardians[0].type ?
          (element.guardians[0].type == "guardian" ? element.guardians[0].name : element.guardians[0].type == "other" ? element.guardians[0].organizationName : "-")
          : "-";
        element['parentName'] = parentName;
      } else
      {
        element['parentName'] = '-';
      }
      if (!element.childOffboardingStatus)
      {
        element['showMarkActive'] = 'True'
      }
      else
      {
        element['showMarkActive'] = 'False';
      }
      if (!element.childOffboardingStatus && !element.scheduleForOffboard)
      {
        element['showViewOffboardingDetail'] = 'True'
      }
      else
      {
        element['showViewOffboardingDetail'] = 'False';
      }
      element['offboardStatus'] = element.childOffboardingStatus == true ? 'Archived' : 'Active'
    });
    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData,
      columnHeader: this.columnHeader,
      dataSource: new MatTableDataSource(this.dataItems),
      pagination: this.pagination,
      onlyDelete: false
    };
    // this.title = this.title + " (" + this.pagination.count + ")"
  }

  sortColumn(e)
  {

    this.sortBy = e.field;

    this.sortUrl = `&sortBy=${this.sortBy}&sortOrder=${e.order}`;
    this.getList(this.filterUrl);
  }

  toggleDiscountChildren()
  {


    if (this.switchData)
    {
      this.filterUrl += '&showDiscountedChild=true';
    } else
    {
      this.filterUrl = this.filterUrl.replace("&showDiscountedChild=true", "");
    }

    this.getList(this.filterUrl)
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
      this.paginationUrl = '&page=' + '1' + '&perPage=' + this.perPage;
    }

    if (event.date)
    {
      filterUrl = filterUrl + event.date;
    }

    if (event.extraValue)
    {
      filterUrl = filterUrl + '&parentName=' + event.extraValue;
    }

    if (event.switchValue)
    {
      filterUrl = filterUrl + '&showDiscountedChild=true';
    }

    // if(this.switchData) {
    // 	this.filterUrl += '&showDiscountedChild=true';
    // } else {
    // 	this.filterUrl = this.filterUrl.replace("&showDiscountedChild=true","");
    // }


    this.getList(filterUrl)
  }

  actionButtonOutput(event)
  {
    if (event.item.type === "delete" && event.item.buttonLabel == 'Delete')
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
    }
    else
    {
      let url;
      if (event.item.buttonLabel == "View Offboarding Details")
      {
        if (event.row.childOffboardingDetails)
        {
          localStorage.setItem('offboardingDetail', JSON.stringify(event.row.childOffboardingDetails))
        }
        url = '/main/' + event.item.buttonRoute + '/' + event.row.id + '/view';
      }

     else if (event.item.buttonLabel == "Mark as active" && event.row.childOffboardingStatus)
      {
        // if (event.row.childOffboardingStatus)
        // {
        let heading = 'Mark as active?';
        let message = 'Are you sure you want to activate this child?';
        let rightButton = 'Yes';
        let leftButton = 'No';
        this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then(result =>
        {
          if (result)
          {
            url = config.base_url_slug + `reactive/child/${event.row.id}/child-offboarding`
            this.apiService.get(url).then(result =>
            {
              if (result.code == 200 || result.code == 201)
              {
                this.alertService.alertSuccess(result.status, result.message).then(() =>
                {
                  let branchId = localStorage.getItem('branchId');
                  let url ='attributes=[{"key": "branchId","value": "' + branchId + '" }]'
                  this.getList(url);
                })
              }
              else
              {
                this.alertService.alertError(result?.error?.status, result?.error?.message);
              }
            })
          }
        })
      }
      else
      {
        url = '/main/' + event.item.buttonRoute + '/' + event.row.id + '/' + event.item.buttonLabel.toLowerCase();
        if (this.isMultiple)
        {
          url = url + '/' + this.firstFormName + '/' + event.row.id + '/' + event.item.buttonLabel.toLowerCase();
        }
      }
      if (url)
      {
        this.router.navigateByUrl(url);
      }
    }
  }

  onChangeDiscount() {
    this.comm.discountChildren.next(this.switchValue);
  }
}
