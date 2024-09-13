
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of as observableOf, never } from 'rxjs';
import { catchError, filter, map, tap } from 'rxjs/operators';
import { config } from '../../config';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  public menuByKey = {};
  static readonly KEY_SYSTEM_PRIVILEDGE = 'system_priviledge';
  static readonly KEY_SYSTEM_USER_ROLE = 'system_user_role';
  private _startupData$ = new BehaviorSubject(null);
  sdnUser: any = {};
  headers: HttpHeaders;
  options: any;
  public baseUrl: string;

  constructor(private http: HttpClient) { }
  
  public data(key?: string | string[]): Observable<any> {
    return this._startupData$.asObservable()
      .pipe(
        filter(data => !!data),
        map(item => {
          if (key === undefined) return item;
          if (typeof key === 'string') return item[key];
          const itemsObj = {};
          key.forEach(k => {
            itemsObj[k] = item[k];
          })
          return itemsObj;
        })
      );
  }

  loadPermissions(): Observable<any>
  {
      const setItems = dt => {
        const { predefinedSystemModules } = dt;
        predefinedSystemModules.forEach(module => {
          this.menuByKey[module.name] = module.predefinedSystemRolePriviledge ? module.predefinedSystemRolePriviledge : module.customSystemRolePriviledge;
          module.predefinedSystemSubModules.forEach(submodule => {
            this.menuByKey[module.name][submodule.name] = submodule.predefinedSystemRoles ? submodule.predefinedSystemRoles[0].predefinedSystemRolePriviledge : submodule.staffs[0].customSystemRolePriviledge;
          });
        })
        this._startupData$.next(this.menuByKey);
      }
      this.baseUrl = config.base_url;
      this.sdnUser = JSON.parse(localStorage.getItem('sdnUser'));
      let url = config.base_url_slug +'view/staff/'+this.sdnUser.id+'/system-priviledge';
      
      if (this.sdnUser)
      {
          this.headers = new HttpHeaders({ 'Authorization': this.sdnUser.accessToken });
      }
      else
      {
          this.headers = new HttpHeaders({ 'Authorization': config.default_auth_key });
      }
      this.options = { headers: this.headers, observe: 'response' };

      return this.http
        .get(this.baseUrl + url, this.options)
        .pipe(
          tap((data: any) => {
            this.savePermissions(data.body.data);
          }),
          catchError(e => {
            const data = this.getPermissions();
            if (!data) {
              return never();
            } else {
              setItems(JSON.parse(data));
              return observableOf(e);
            }
          })
        )
  }

  savePermissions(input)
  {
    JSON.stringify(input);
    let userRole = input.name;
    const setItems = dt => {
      const { predefinedSystemModules } = dt;
      predefinedSystemModules.forEach(module => {
        this.menuByKey[module.name] = module.predefinedSystemRolePriviledge ? module.predefinedSystemRolePriviledge : module.customSystemRolePriviledge;
        module.predefinedSystemSubModules.forEach(submodule => {
          this.menuByKey[module.name][submodule.name] = submodule.predefinedSystemRoles ? submodule.predefinedSystemRoles[0].predefinedSystemRolePriviledge : submodule.staffs[0].customSystemRolePriviledge;
        });
      })
      this._startupData$.next(this.menuByKey);
      console.log(this.menuByKey);
    }
    setItems(input);
    localStorage.setItem(PermissionService.KEY_SYSTEM_PRIVILEDGE, JSON.stringify(input));
    
    localStorage.setItem(PermissionService.KEY_SYSTEM_USER_ROLE, userRole);
  }

  getPermissions()
  {
    return localStorage.getItem(PermissionService.KEY_SYSTEM_PRIVILEDGE);
  }

  getPermissionsByModuleName(module: string)
  {
    let om;
    this.data(module).subscribe(data => { om = data });
    return om;
  }

  getPermissionsBySubModuleName(module: string, subModule: string)
  {
    let sm;
    this.data(module).subscribe(data => { sm = data[subModule] });
    return sm;
  }

  getUserRole()
  {
    return localStorage.getItem(PermissionService.KEY_SYSTEM_USER_ROLE);
  }

  getPermissionsforOccupency(module: string)
  {
    let visibility = false;
    let dt; 
    this.data(module).subscribe(data => { dt = data });
    if (dt['Branch'].visibility)
    {
      visibility = true;
    }
    if (dt['Room'].visibility)
    {
      visibility = true;
    }
    return visibility;
  }

  getPermissionsforFinance(module: string)
  {
    let visibility = false;
    let dt; 
    this.data(module).subscribe(data => { dt = data });
    if (dt['Credit'].visibility)
    {
      visibility = true;
    }
    if (dt['Invoice'].visibility)
    {
      visibility = true;
    }
    return visibility;
  }

}