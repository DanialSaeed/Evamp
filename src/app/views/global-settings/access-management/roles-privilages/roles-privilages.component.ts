import {
  Component,
  OnInit,
} from '@angular/core';
import {
  GlobalListComponent
} from 'src/app/shared/global-list';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import {
  ApiService,
  AlertService
} from 'src/app/services';
import { config } from 'src/config';

@Component({
  selector: 'app-roles-privilages',
  templateUrl: './roles-privilages.component.html',
  styleUrls: ['./roles-privilages.component.scss']
})
export class RolesPrivilagesComponent extends GlobalListComponent implements OnInit {
  menus: any = [];
  constructor(protected router: Router, protected apiService: ApiService, protected _route: ActivatedRoute, protected alertService: AlertService, ) {
    super(router, apiService, alertService);
    this.listApi = config.base_url_slug +'view/system-roles';
    this.getList();
    super.ngOnInit();
  }

  ngOnInit(): void {
  }

  panelOpenState = false;
  onCheckBox(type, element, checked) {
    element.children?.forEach(child => {
      if (child.predefinedSystemRoles) {
        child.predefinedSystemRoles[type].predefinedSystemRolePriviledge.visibility = checked;
      }
    });

    let payload = {
      visibility: checked,
      type: element.hasOwnProperty("isParent") && element['isParent'] ? 'module' : 'subModule'
    };
    let id = element.predefinedSystemRoles[type].predefinedSystemRolePriviledge.id;
		let formApi = config.base_url_slug +'update/system-role/'+ id;
		this.apiService.patch(formApi, payload, false).then(response =>
			{
				if (response.code == 201 || response.code == 200)
				{
          this.alertService.alertSuccess(response.status, response.message);
				}
				else
				{
					this.alertService.alertError(response.status, response.message);
				}
			})
  }

  afterListResponse(): void {
    this.menus = this.dataItems;
    this.menus.forEach(element => {
      if (element.name == 'H.R Management') {
        element.name = 'Staff Management';
      }
      element.opened = false;
      element.expanded = false;
      if (element.predefinedSystemSubModules) {
        element.isParent = element.predefinedSystemSubModules?.length != 0 ? true : false;
        element.children = element.predefinedSystemSubModules;
        element.predefinedSystemSubModules.forEach(child => {
          child.opened = false;
          child.expanded = false;
          if (child.predefinedSystemSubModules) {
            child.isParent = child.predefinedSystemSubModules?.length != 0 ? true : false;
            child.children = child.predefinedSystemSubModules;
          }
        });
      }
    });
  }

}
