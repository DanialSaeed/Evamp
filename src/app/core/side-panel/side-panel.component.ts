import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PanelOption } from './panel-option';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AlertService, CommunicationService, PermissionService } from 'src/app/services';
import { MatSidenav } from '@angular/material/sidenav';
import { filter, map } from 'rxjs/operators';
@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss']
})
export class SidePanelComponent implements OnInit {
  selectedOption = null;
  isSmall: boolean = false;
  @Input() sideMenuOpened = false;
  @Input() mode = '';
  @Input() sideNav: MatSidenav;
  @Output() onManageMenu: EventEmitter<any> = new EventEmitter<any>();
  private screenWidth$ = new BehaviorSubject<number>(window.innerWidth);
  expand_img = "assets/images/menu/menu-svg/down_arrow.svg"
  public scrollbarOptions = { axis: 'y', theme: 'minimal-dark', scrollInertia: 10 };
  menus: PanelOption[] = [];
  sdnUser: any;
  branchId: string;
  isAllowed = true;
  selectedLink = '';
  selectedMenuPanelIndex = null;
  currentUrl = '';
  routeSubscription: any;
  isRouteActive: boolean;
  isCurrentRouteActive: any = '';

  constructor(private router: Router, private communicationService: CommunicationService, private permissionsService: PermissionService, protected alertService: AlertService, private _route: ActivatedRoute) {
    this.menus = [];

    this.communicationService.unSavedForm.subscribe((val) => {
      if (val) {
        this.isAllowed = false;
      } else {
        this.isAllowed = true;
      }
    })
  }

  ngOnInit(): void {
    this.isSmall = false;
    this.menus = [
      {
        routerLink: 'dashboard',
        image: 'home',
        isParent: false,
        opened: false,
        label: 'Company Overview',
        arrowImg: '',
        visibility: true,
      },
      {
        routerLink: '',
        image: 'group',
        label: 'Branch Overview',
        isParent: true,
        opened: false,
        expanded: false,
        arrowImg: this.expand_img,
        visibility: this.permissionsService.getPermissionsforOccupency('Branch Overview'),
        children: [
          { routerLink: 'branch', image: 'Path 97', label: 'Branch Information', visibility: this.permissionsService.getPermissionsBySubModuleName('Branch Overview', 'Branch').visibility },
          { routerLink: 'finance-settings', image: 'Path 97', label: 'Financial Settings', visibility: this.permissionsService.getPermissionsBySubModuleName('Branch Overview', 'Branch').visibility },
          { routerLink: 'room', image: 'Path 97', label: 'Room Details', visibility: this.permissionsService.getPermissionsBySubModuleName('Branch Overview', 'Room').visibility },
          { routerLink: 'calendar', image: 'Path 97', label: 'Calendar', visibility: this.permissionsService.getPermissionsBySubModuleName('Global Settings', 'Calender').visibility },
        ]
      },
      {
        routerLink: 'session',
        image: 'book',
        label: 'Session Management',
        isParent: true,
        opened: false,
        expanded: false,
        arrowImg: this.expand_img,
        visibility: this.permissionsService.getPermissionsByModuleName('Session Management').visibility,
        children:[
          { routerLink: 'session', image: 'Path 97', label: 'Sessions', visibility: this.permissionsService.getPermissionsByModuleName('Session Management').visibility },
          { routerLink: 'settings/additional-items', image: 'Path 97', label: 'Additional Items', visibility: true },

        ]
      },
      {
        routerLink: 'children',
        image: 'face',
        label: 'Child Management',
        isParent: true,
        opened: false,
        expanded: false,
        arrowImg: this.expand_img,
        visibility: this.permissionsService.getPermissionsByModuleName('Child Management').visibility,
        children: [
          { routerLink: 'children', image: 'Path 97', label: 'Children', visibility: this.permissionsService.getPermissionsByModuleName('Child Management').visibility },
          // { routerLink: 'enrolment/add/new', image: 'Path 97', label: 'Add New', visibility: this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Enrollment').visibility },
          { routerLink: 'child-booking', image: 'Path 97', label: 'Booking Manager', visibility: this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Booking Manager').visibility },
          // { routerLink: 'additional-items', image: 'Path 97', label: 'Additional Items', visibility: this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Additional Items').visibility },
          { routerLink: 'manual-child-attendance/child', image: 'Path 97', label: 'Attendance', visibility: this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Attendance').visibility },
          { routerLink: 'child-attendance/discrepancy/history', image: 'Path 97', label: 'Discrepancy History', visibility: this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Attendance').visibility },
          { routerLink: 'guardian', image: 'Path 97', label: 'Parent/Guardian', visibility: this.permissionsService.getPermissionsBySubModuleName('Child Management', 'Booking Manager').visibility },
        ]
      },
      {
        routerLink: '',
        image: 'work',
        label: 'Finance Management',
        isParent: true,
        opened: false,
        expanded: false,
        arrowImg: this.expand_img,
        visibility: this.permissionsService.getPermissionsforFinance('Finance Management'),
        children: [
          { routerLink: 'finance/allInvoice', image: 'Path 97', label: 'Invoices', visibility: this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Invoice').visibility },
          { routerLink: 'finance/credits', image: 'Path 97', label: 'Credits', visibility: this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Credit').visibility },
          // { routerLink: 'finance/invoice-properties', image: 'Path 97', label: 'Invoice Properties', visibility: this.permissionsService.getPermissionsBySubModuleName('Finance Management', 'Invoice Properties').visibility },
        ]
      },
      {
        routerLink: 'staff', image: 'calender', label: 'Staff Management',
        isParent: true,
        opened: false,
        expanded: false,
        arrowImg: this.expand_img,
        visibility: this.permissionsService.getPermissionsByModuleName('H.R Management').visibility,
        children: [
          { routerLink: 'staff', image: 'Path 97', label: 'Staff', visibility: this.permissionsService.getPermissionsBySubModuleName('H.R Management', 'Staff').visibility },
          { routerLink: 'staff-attendance/staff', image: 'Path 97', label: 'Staff Attendance', visibility: this.permissionsService.getPermissionsBySubModuleName('H.R Management', 'Attendance').visibility },
          { routerLink: 'staff-attendance/discrepancy/history', image: 'Path 97', label: 'Discrepancy History', visibility: this.permissionsService.getPermissionsBySubModuleName('H.R Management', 'Attendance').visibility },

        ]
      },
      {
        routerLink: 'access-management', image: 'settings', label: 'Global Settings',
        isParent: true,
        opened: false,
        expanded: false,
        arrowImg: this.expand_img,
        visibility: this.permissionsService.getPermissionsByModuleName('Global Settings').visibility,
        children: [
          { routerLink: 'access-management', image: 'Path 97', label: 'Access Management', visibility: this.permissionsService.getPermissionsBySubModuleName('Global Settings', 'Access Management').visibility },
        ]
      },
      {
        routerLink: 'child-attendance-report',
        image: 'group',
        label: 'Reports Management',
        isParent: true,
        opened: false,
        expanded: false,
        arrowImg: this.expand_img,
        visibility: true,
        children: [
          { routerLink: 'child-attendance-report', image: 'Path 97', label: 'Children Attendance', visibility: true },
          { routerLink: 'staff-attendance-report', image: 'Path 97', label: 'Staff Attendance', visibility: true }
        ]
      },
    ];

    this.getScreenWidth().subscribe(width => {
      if (width <= 820) {
        this.isSmall = true;
      } else {
        this.isSmall = false;
      }
    });
    // assign current url to property after removing / from url
    let url = this.router.url.split('/')
    this.isCurrentRouteActive = url[0] == "" ? url[2] : url[1];
    console.log("this.isCurrentRouteActive", this.isCurrentRouteActive);


    this.routeSubscription = this.router.events.subscribe((event) => {
      this.router.events.pipe(
        // identify navigation end
        filter((event) => event instanceof NavigationEnd),
        // now query the activated route
        map(() => this.rootRoute(this._route)),
        filter((route: ActivatedRoute) => route.outlet === 'primary'),
      ).subscribe((route: ActivatedRoute) => {
        this.isCurrentRouteActive = route.snapshot.data.route;
      });
    });
  }
  private rootRoute(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

  onMenu(): void {
    this.isSmall = !this.isSmall;
    this.onManageMenu.emit(this.isSmall);
  }

  onHover(state: string, sideMenu): void {
    let image = '';

    // if (state == 'over')
    // {
    // 	image = sideMenu.image.split('_w');
    // 	sideMenu.image = image[0];
    // }
    // else
    // {
    // 	image = sideMenu.image.split('_w');
    // 	sideMenu.image = image[0] + '_w';
    // }
  }

  onHomeClick(): void {
    this.router.navigate(['/main']);
  }

  onOpen($event, menu): void {
    this.branchId = localStorage.getItem('branchId');
    if (!this.branchId) {
      this.router.navigateByUrl('main/dashboard');
      return;
    }
  }

  onMenuClick(menu: PanelOption, event, index): void {
    if (!menu.isParent && !this.isAllowed) {

      let heading = 'Confirmation';
      let message = 'You have unsaved changes, are you sure you want to leave ?';
      let leftButton = 'Cancel';
      let rightButton = 'Leave';
      this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then((val) => {
        if (val) {
          this.clickHandle(menu, event, index);
          this.isAllowed = true;
        }
        else {
          return;
        }
      })
      event.preventDefault();
      event.stopPropagation();
    } else {
      this.clickHandle(menu, event, index)
    }

    //For clearing invoice filters
    if (menu.label != 'Invoices' && !menu.isParent) {
      localStorage.removeItem('invoiceRow');
      localStorage.removeItem('invoiceFilters');
      localStorage.removeItem('invoiceTab')
    }
   
    this.currentUrl = this.router.url;
  }

  clickHandle(menu, event, index) {
    this.branchId = localStorage.getItem('branchId');

    if (menu.isParent == false && !this.branchId) {
      this.router.navigateByUrl('main/dashboard');
      // menu.opened = false;
      // menu.expanded = false;
      return;
    }

    // Code for handling Expansion panel Toggling

    if (this.selectedMenuPanelIndex) {
      let current = this.menus[this.selectedMenuPanelIndex];
      if (current.isParent && current.opened) {
        current.opened = false;
        current.arrowImg = 'assets/images/menu/menu-svg/down_arrow.svg';
      }
    }

    if (menu.isParent) {
      if (menu == this.menus[this.selectedMenuPanelIndex]) {
        this.selectedMenuPanelIndex = null;
        return;
      }

      menu.opened = !menu.opened;

      if (menu.opened) {
        menu.arrowImg = "assets/images/menu/menu-svg/up_arrow.svg"
      }
      else {
        menu.arrowImg = "assets/images/menu/menu-svg/down_arrow.svg"
      }
    }
    else {
      var data = {
        'title': menu.label
      }
      this.communicationService.setTitle(data);
      localStorage.setItem('title', menu.label);
      this.router.navigateByUrl('/main/' + menu.routerLink);
    }

    // Close sidepanel on selection if screen is Ipad size or lower
    if (window.innerWidth <= 820 && !menu.isParent) {
      this.sideNav.close();
    }

    this.selectedMenuPanelIndex = index;

    // End

    event.preventDefault();
    event.stopPropagation();
  }

  onChildClick(menu, event, parent): void {
    if (!this.isAllowed) {
      let heading = 'Confirmation';
      let message = 'You have unsaved changes, are you sure you want to leave ?';
      let leftButton = 'Cancel';
      let rightButton = 'Leave';
      this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then((val) => {
        if (val) {
          this.isAllowed = true;
          this.onClickChildHandle(menu, parent, event);
        }
        else {
          return;
        }
      })
      // event.preventDefault();
      // event.stopPropagation();
    } else {
      this.onClickChildHandle(menu, parent, event);
      // this.router.navigate(['/main/' + menu.routerLink]);
    }
    // this.onClickChildHandle(menu,parent,event);

    //For clearing invoice filters
    if (menu.label != 'Invoices') {
      localStorage.removeItem('invoiceRow');
      localStorage.removeItem('invoiceFilters');
      localStorage.removeItem('invoiceTab')
    }
    event.preventDefault();
    event.stopPropagation();

    this.currentUrl = this.router.url;
  }

  onClickChildHandle(menu, parent, event) {
    parent.active = true;
    var data = {
      'title': parent.label
    }
    this.communicationService.setTitle(data);
    localStorage.setItem('title', parent.label);

    if (menu.routerLink == 'branch') {
      var url = '/main/branch/' + this.branchId + '/view'
      this.router.navigateByUrl(url)
    }
    else {

      // Check for Add New child (from view to add) to re-initialize component

      if (menu.routerLink == 'enrolment/add/new' && localStorage.getItem('isChildView')) {
        localStorage.removeItem('isChildView');
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigateByUrl('/main/' + menu.routerLink)
        });
      }
      //End
      else {
        this.router.navigateByUrl('/main/' + menu.routerLink);
      }
    }


    this.branchId = localStorage.getItem('branchId');
    if (!this.branchId) {
      this.router.navigateByUrl('main/dashboard');
      event.preventDefault();
      event.stopPropagation();

      return;
    }

    // Close sidepanel on selection if screen is Ipad size or lower
    if (window.innerWidth <= 820) {
      this.sideNav.close();
    }
    event.preventDefault();
    event.stopPropagation();
  }

  getScreenWidth(): Observable<number> {
    return this.screenWidth$.asObservable();
  }
  getRouterLink(link) {
    // this.selectedLink = link;
    if (!this.isAllowed) {
      return [];
    } else {
      return link;
    }
  }

  isActive(menuItemLink: string): boolean {
    return this.router.url === menuItemLink;
  }
}
