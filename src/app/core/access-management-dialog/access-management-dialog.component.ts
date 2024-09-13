import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { ApiService, AlertService, PermissionService, AutocompleteFiltersService, UtilsService } from 'src/app/services';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { IterableDiffers } from '@angular/core';
import { config } from 'src/config';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-access-management-dialog',
  templateUrl: './access-management-dialog.component.html',
  styleUrls: [
    '/src/app/views/shared-style.scss',
    './access-management-dialog.component.scss',
  ],
})
export class AccessManagementDialogComponent
  extends GlobalFormComponent
  implements OnInit
{
  id: any;
  type: any;
  userId: any;
  roleName: any;
  roleId: any;
  srList: [] = [];
  staffList = [];
  filteredStaff = [];
  menus: any = [];
  apiStaff: any = config.base_url_slug + 'update/staff/:id/system-priviledge';
  payLoad = {
    staffId: null,
    priviledges: [],
  };
  copyPriviledges = [];

  iterableDiffer;
  isApplyDisabled: boolean = true;
  idxDoCheck = 0;

  constructor(
    protected router: Router,
    protected _route: ActivatedRoute,
    protected alertService: AlertService,
    protected apiService: ApiService,
    protected formbuilder: FormBuilder,
    protected dialog: MatDialog,
    protected util: UtilsService,
    protected filterService: AutocompleteFiltersService,
    protected dialogRef: MatDialogRef<AccessManagementDialogComponent>,
    protected permissionsService: PermissionService,
    @Inject(MAT_DIALOG_DATA) public data1: any,
    private iterableDiffers: IterableDiffers
  )
  {
    super(
      router,
      _route,
      alertService,
      apiService,
      formbuilder,
      dialog,
      permissionsService
    );

    this.Form = this.formbuilder.group({
      staffLabel: new FormControl('', [this.util.trimWhitespaceValidator])
   });

    this.id = data1.id;
    if (this.id !== 'new')
    {
      this.userId = this.id;
      this.type = 'edit';
    } else
    {
      this.type = 'add';
    }

    super.ngOnInit();



    this.iterableDiffer = this.iterableDiffers
      .find(this.payLoad.priviledges)
      .create(null);

      // Populate autcomplete data for staff
			let user = this.Form.get('staffLabel').valueChanges.pipe(
				startWith(''),
				map(value => this.filterService._filterStaff(value, this.staffList))
			);
			user.subscribe((d)=> this.filteredStaff =  d);
		// End
  }

  ngOnInit(): void
  {
    this.getStaff();
    this.getSystemRoles();
    this.getSystemPriviledge();
  }

  ngDoCheck()
  {
    let changes = this.iterableDiffer.diff(this.payLoad.priviledges);
    if (changes)
    {

      if (this.idxDoCheck > 0)
      {
        this.getIsApplyDisabled();
      }
      this.idxDoCheck = 1;
    }
  }

  onCancel()
  {
    if (!this.isApplyDisabled)
    {
      let heading = 'Confirmation';
      let message =
        'It looks like you have been editing something. If you leave before saving, Your changes will be lost. Are you sure you want to continue?';
      let rightButton = 'Yes';
      let leftButton = 'No';
      this.alertService
        .alertAsk(heading, message, rightButton, leftButton, false)
        .then((result) =>
        {
          if (result)
          {
            this.dialogRef.close({ status: 'close', type: this.type });
          }
        });
    } else
    {
      this.dialogRef.close({ status: 'close', type: this.type });
    }
  }

  getField(event)
  {
    return this.Form.get(event).invalid;
  }

  staffChange(event)
  {
    this.userId = event;
    this.getSystemPriviledge();
  }

  systemRoleChange(event)
  {
    this.getRolePriviledge();
  }

	getErrorMessage(field: any, form?): any
	{
		return this.Form.get(field) && this.Form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : '';
	}

	setStaffId() {
		let staff = this.staffList.find(x => x.name == this.Form.get('staffLabel').value);
    if (staff) {
      this.staffChange(staff.id);
      // this.Form.get('staffLabel').setValue(staff ? staff.name : null);
    }
	}

  getSystemRoles(): any
  {
    let url = config.base_url_slug + 'view/standard-system-roles';
    this.apiService.get(url).then((res) =>
    {
      if (res.code == 200)
      {
        this.srList = res.data;
        // console.log('getSystemRoles', this.srList);
      } else
      {
        this.srList = [];
      }
    });
  }

  getStaff(): any
  {
    let branchId = localStorage.getItem('branchId');
    let attributes =
      '&attributes=[{"key": "branchId","value":' + branchId + '}]';
    let otherAttributes =
      '&otherAttributes=[{"key":"accessManagement","value": true }]';
    let url =
      config.base_url_slug +
      'view/staff-members?fetchType=dropdown' +
      attributes +
      otherAttributes;

    this.apiService.get(url).then((res) =>
    {
      if (res.code == 200)
      {
        this.staffList = res.data;
        this.staffList.forEach((x:any) => x.name = x.firstName + ' ' + x.lastName);
        this.filteredStaff = [...this.staffList];

        if (this.userId) {
          let staff = this.staffList.find(x => x.id == this.userId);
          this.Form.get('staffLabel').setValue(staff ? staff.name : null);
        }
        

      } else
      {
        this.staffList = [];
      }
    });
  }

  getSystemPriviledge(): any
  {

    let url =
      config.base_url_slug + 'view/staff/' + this.userId + '/system-priviledge';
    this.apiService.get(url).then((res) =>
    {

      if (res.code == 200)
      {
        this.onResponsePrepareData(res.data, true);
      } else
      {
        this.menus = [];
      }
    });
  }

  onResponsePrepareData(input, updatecopy)
  {

    this.menus = [];
    this.payLoad.priviledges = [];
    if (updatecopy)
    {
      this.copyPriviledges = [];
    }
    const { predefinedSystemModules } = input;
    this.roleName = input.name;
    this.roleId = input.id;
    predefinedSystemModules.forEach((module) =>
    {
      let menu = {};
      menu = module.predefinedSystemRolePriviledge
        ? module.predefinedSystemRolePriviledge
        : module.customSystemRolePriviledge;
      menu['name'] = module.name !== 'undefined' ? module.name : 'Custom';
      menu['isParent'] = true;
      menu['children'] = [];
      let pData = {
        moduleId: menu['moduleId'],
        subModuleId: menu['subModuleId'],
        visibility: menu['visibility'],
        create: menu['create'],
        read: menu['read'],
        update: menu['update'],
        delete: menu['delete'],
        isParent: true,
      };
      this.payLoad.priviledges.push(pData);
      //   if(updatecopy)
      //   {
      // 		this.copyPriviledges.push(pData);
      //   }
      module.predefinedSystemSubModules.forEach((submodule) =>
      {
        let submenu = submodule.predefinedSystemRoles
          ? submodule.predefinedSystemRoles[0].predefinedSystemRolePriviledge
          : submodule.staffs[0].customSystemRolePriviledge;
        submenu['name'] = submodule.name;
        submenu['isParent'] = false;
        menu['children'].push(submenu);
        let cData = {
          moduleId: submenu.moduleId,
          subModuleId: submenu.subModuleId,
          visibility: submenu.visibility,
          create: submenu.create,
          read: submenu.read,
          update: submenu.update,
          delete: submenu.delete,
          isParent: false,
        };
        this.payLoad.priviledges.push(cData);
        //   if(updatecopy)
        //   {
        // 		his.copyPriviledges.push(cData);
        // }
      });
      this.menus.push(menu);
    });
    if (updatecopy)
    {
      this.copyPriviledges = [...this.payLoad.priviledges];
    }
    console.log(
      'onResponsePrepareData',
      this.payLoad.priviledges,
      this.copyPriviledges
    );
  }

  getRolePriviledge(): any
  {
    let url = config.base_url_slug + 'view/system-roles';
    this.apiService.get(url).then((res) =>
    {
      if (res.code == 200 && res.data.length > 0)
      {
        let role = res.data[0].predefinedSystemRoles[this.roleId - 1];
        let data = {
          id: role.id,
          name: role.name,
          status: role.status,
          createdTime: role.createdTime,
          updatedTime: role.updatedTime,
          predefinedSystemModules: [],
        };

        res.data.forEach((element) =>
        {
          let predefinedSystemModule = {
            id: element.id,
            name: element.name,
            code: element.code,
            status: element.status,
            createdTime: element.createdTime,
            updatedTime: element.updatedTime,
          };
          predefinedSystemModule['predefinedSystemRolePriviledge'] =
            element.predefinedSystemRoles[
              this.roleId - 1
            ].predefinedSystemRolePriviledge;

          let subModules = [];
          element.predefinedSystemSubModules.forEach((subelement) =>
          {
            let subModule = {
              id: subelement.id,
              moduleId: subelement.moduleId,
              name: subelement.name,
              status: subelement.status,
              createdTime: subelement.createdTime,
              updatedTime: subelement.updatedTime,
              predefinedSystemRoles: [],
            };
            subModule['predefinedSystemRoles'].push(
              subelement.predefinedSystemRoles[this.roleId - 1]
            );
            subModules.push(subModule);
          });
          predefinedSystemModule['predefinedSystemSubModules'] = subModules;
          data.predefinedSystemModules.push(predefinedSystemModule);
        });
        this.onResponsePrepareData(data, false);
      } else
      {
        this.menus = [];
      }
    });
  }

  onCheckBox(type, parent, element, checked)
  {

    if (type == 'visibility' && checked == false)
    {
      element.create = false
      element.read = false
      element.update = false
      element.delete = false
    }
    if ((element.create || element.read || element.update || element.delete) == true)
    {
      element['visibility'] = true
    }
    // if (element['visibility']=true){
    //   element['isParent']=true
    // }

    element[type] = checked;
    let priviledge = this.payLoad.priviledges.find((pr) =>
      element['isParent']
        ? pr.moduleId === element.moduleId
        : pr.subModuleId === element.subModuleId
    );
    if (priviledge)
    {
      priviledge[type] = checked;
    }
    if ((element['isParent']) || element['visibility'] == false)
    {
      element.children?.forEach((child) =>
      {

        if (child['visibility'] = true)
        {
          element['visibility'] = true
        }
        child[type] = checked;
        let priviledge = this.payLoad.priviledges.find(
          (pr) => pr.subModuleId === child.subModuleId
        );
        if (priviledge)
        {
          priviledge[type] = checked;
          // console.log('find', child);
        }
      });
    } else
    {
      let allCheck = true;
      parent.children?.forEach((child) =>
      {
        if (child[type] != checked)
        {
          allCheck = false;
        }
      });
      if (allCheck)
      {
        parent[type] = checked;
        let priviledge = this.payLoad.priviledges.find(
          (pr) => pr.moduleId === parent.moduleId
        );
        if (priviledge)
        {
          priviledge[type] = checked;
          // console.log('find', parent);
        }
      } else if (checked && !parent[type])
      {
        parent[type] = checked;
        let priviledge = this.payLoad.priviledges.find(
          (pr) => pr.moduleId === parent.moduleId
        );
        if (priviledge)
        {
          priviledge[type] = checked;
          // console.log('find', parent);
        }
      } else if (!checked && parent[type])
      {
        parent[type] = checked;
        let priviledge = this.payLoad.priviledges.find(
          (pr) => pr.moduleId === parent.moduleId
        );
        if (priviledge)
        {
          priviledge[type] = checked;
          // console.log('find', parent);
        }
      }
    }
    let priviledges = [...this.payLoad.priviledges];
    this.payLoad.priviledges = [];
    priviledges.forEach((val) =>
      this.payLoad.priviledges.push(Object.assign({}, val))
    );
    this.roleId = null;
    this.roleName = null;
  }

  onSubmit()
  {
    if (!this.userId)
    {
      this.alertService.alertError('ERROR', 'Select user first');
      return;
    }

    if (this.userId && this.roleId)
    {
      let data = {
        roleId: this.roleId,
      };
      this.onUpdateAccessLevel(data);
    } else
    {
      this.payLoad.staffId = this.userId;
      this.apiService
        .post(
          config.base_url_slug + 'add/staff/system-priviledge',
          this.payLoad,
          false
        )
        .then((response) =>
        {
          if (response.code == 201 || response.code == 200)
          {
            this.responseData = response.data;
            if (this.showSuccess)
            {
              this.alertService
                .alertSuccess(response.status, response.message)
                .then((result) =>
                {
                  this.dialogRef.close({ status: 'success', type: 'add' });
                });
            }
          } else
          {
            this.alertService.alertError(response.status, response.message);
          }
        });
    }
  }

  onUpdateAccessLevel(formData)
  {
    let formApi =
      config.base_url_slug +
      'update/staff/' +
      this.userId +
      '/system-priviledge';
    this.apiService.patch(formApi, formData, false).then((response) =>
    {
      if (response.code == 201 || response.code == 200)
      {
        this.responseData = response.data;
        if (this.showSuccess)
        {
          let message = response.message;
          if (!response.hasOwnProperty('message'))
          {
            message = 'Staff system priviledges updated successfully';
          }
          this.alertService
            .alertSuccess(response.status, message)
            .then((result) =>
            {
              this.dialogRef.close({ status: 'success', type: 'add' });
            });
        }
      } else
      {
        this.alertService.alertError(response.status, response.message);
      }
    });
  }

  getIsApplyDisabled()
  {

    // console.log("getIsApplyDisabled", this.payLoad.priviledges, this.copyPriviledges);
    for (let i = 0; i < this.payLoad.priviledges.length; i++)
    {
      if (
        JSON.stringify(this.payLoad.priviledges[i]) !==
        JSON.stringify(this.copyPriviledges[i])
      )
      {
        // console.log('getIsApplyDisabled in');
        this.isApplyDisabled = false;
        return;
      }
    }
    this.isApplyDisabled = false;
    // console.log('getIsApplyDisabled out');
  }
}
