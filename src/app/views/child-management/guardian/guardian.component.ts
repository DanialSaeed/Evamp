import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { ApiService, AlertService, PermissionService } from 'src/app/services';
import { GlobalListComponent } from 'src/app/shared/global-list';
import { config } from 'src/config';

@Component({
  selector: 'app-guardian',
  templateUrl: './guardian.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class GuardianComponent extends GlobalListComponent implements OnInit {
  tableConfigAndProps = {};
  dataSource = new MatTableDataSource();
  buttonHeaderProps: any;

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

  constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, protected permissionsService: PermissionService) {
    super(router, apiService, alertService, permissionsService);
    this.actionButtons =
      [
        { buttonLabel: "Edit", buttonRoute: "guardian", visibility: this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Booking Manager').update, hide: true },
        { buttonLabel: "View", buttonRoute: "guardian", visibility: this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Booking Manager').read, hide: true },
        { buttonLabel: "Delete", type: 'delete', buttonRoute: "guardian", visibility: true },
      ]
    this.headerButtons = [
      { buttonLabel: "Add New", color: "#E2AF2A", buttonRoute: "guardian/add", isMultiple: false, visibility: this.permissionsService.getPermissionsByModuleName('Child Management').create },
    ]
    this.columnHeader = {
      'id': 'ID', 'type': 'Account Type', 'title': 'Title', 'name': 'Name', 'dateOfBirth': 'Date of Birth', 'address': 'Address', 'firstLanguage': 'Primary Language', 'nationalInsuranceNumber': 'National Insurance', 'Actions': 'Actions'
    };
    this.tableConfigAndProps = {
      ActionButtons: this.actionButtons,
      inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
    };

    this.buttonHeaderProps = {
      headingLabel: "Parent/Guardian ",
      ActionButtons: this.headerButtons,
      hasButton: true,
      hasHeading: true,
      labelMargin: '10px',
      textclass: 'text-bolder text-color',
      margin: '0px',
      hasFilters: true,
      searchConfig: { label: 'Search', key: 'search', value: '' },
      filterArray: [
        {
          label: 'Sort by ', type: 'sort', key: 'noSortOrder', selected: 'All',
          options: [
            { key: 'All', value: 'All', label: 'All' },
            { key: 'ASC', value: 'ASC', label: 'Ascending' },
            { key: 'DESC', value: 'DESC', label: 'Descending' }
          ]
        },
      ]
    };

    this.listApi = config.base_url_slug + 'view/guardians';
    // this.getList()
    super.ngOnInit();

    this.isMultiple = false;
  }

  afterListResponse(): void {
    this.dataItems.forEach(element => {
      // element['startTime'] = element.startTime == 0 || element.startTime == null ? '-' : moment(new Date(element.startTime * 1000)).format("hh:mm A");
      // element['endTime'] = element.endTime == 0 || element.endTime == null ? '-' : moment(new Date(element.endTime * 1000)).format("hh:mm A");

      element['title'] = element.title != null ? element.title.charAt(0).toUpperCase() + element.title.substr(1).toLowerCase() : '-';
      element['name'] = element.type ? (element.type == "other" ? element.organizationName != null ? element.organizationName : '-' : element.name != null ? element.name : '-') : '-';
      element['firstLanguage'] = element.languageLabel != null ? element.languageLabel : '-';
      element['nationalInsuranceNumber'] = element.nationalInsuranceNumber != null ? element.nationalInsuranceNumber : '-';
      element['dateOfBirth'] = element.dateOfBirth != null ? moment(new Date(element.dateOfBirth)).format(config.cmsDateFormat) : '-';
      element['type'] = element.type ? element.type.charAt(0).toUpperCase() + element.type.substr(1).toLowerCase() : ''
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
  actionButtonOutput(event) {
    if (event.item.type === "delete") {
      event.item['buttonRoute'] = 'guardian';
      this.onDelete(event.row, event.item);
    }
    else {
      this.router.navigateByUrl(`/main/guardian/${event.row.id}/view`);
    }
  }
}
