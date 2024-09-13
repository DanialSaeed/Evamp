import { Component, OnInit, OnDestroy, HostListener, ViewChild } from '@angular/core';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, CommunicationService } from 'src/app/services';
import { config } from 'src/config';
import { filter } from 'rxjs/operators';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

// class CustomDateAdapter extends MomentDateAdapter {
  
//     getFirstDayOfWeek() {
//       return 1;
//     }
//   }
@Component({
    selector: 'app-main-app',
    templateUrl: 'main-app.component.html',
    styleUrls: ['./main-app.component.scss'],
})
export class MainAppComponent implements OnInit, OnDestroy
{
    selectedBranch: any;
    user:any
    title="Company Overview"
    @ViewChild('sidenav') sidenav: MatSidenav;
    @ViewChild('rightNav') rightNav: MatSidenav;
    public scrollbarOptions = { axis: 'y', theme: 'minimal-dark', scrollInertia: 10 };
    public scrollbarBottom = { axis: 'x', theme: 'minimal-dark', scrollInertia: 10 };
    sub: Subscription;
    isMenuCollapsed: boolean = true;
    mode: string;
    openSidenav: boolean;
    private screenWidth$ = new BehaviorSubject<number>(window.innerWidth);
    sWidth: number;
    sdnUser: any;
    branchName: any
    branches: any;
    flexVal = "275px"
    navOpened: boolean = true
    @HostListener('window:resize', ['$event'])
    onResize(event)
    {
        this.screenWidth$.next(event.target.innerWidth);
    }

    constructor(protected _route: ActivatedRoute, protected apiService: ApiService, protected router: Router,protected communicationService: CommunicationService)
    {
        this.user = JSON.parse(localStorage.getItem('sdnUser'));
        this.branchName = localStorage.getItem('branchName');
        this.title = localStorage.getItem('title');

        // this.communicationService.getlistingFilters.subscribe((filtersFromListings: any)=> {
        //   if (filtersFromListings.type == 'get') {
        //     this.communicationService[filtersFromListings.list] = filtersFromListings;
        //   }  else {
        //     this.communicationService.setlistingFilters.next(this.communicationService[filtersFromListings.list]);
        //   } 
        // });
    }

    ngOnInit()
    {
        console.log('testing deploy');
        
        this.communicationService.getTitle().subscribe(data => {
			// here fetch data from the session storage
			this.title=data['title'];
		  })
          this.communicationService.getBranch().subscribe(data => {
			// here fetch data from the session storage
			// console.log(data,"through communication")
			this.branchName=data['title'];
		  })

        this.getScreenWidth().subscribe(width =>
        {

            this.sWidth = width;
            if (width <= 820) {
                // Close sidepanel for Tablet screens
                // this.navOpened = false;
                // this.flexVal = '65px';
                this.openSidenav = false;
                this.mode = 'over';
            } else {
                // if (width < 961)
                // {
                //     this.mode = 'over';
                //     this.openSidenav = true;
                // }
                // else if (width > 960)
                // {
                    this.mode = 'side';
                    // this.flexVal = '275px';
                    this.openSidenav = true;
                    // this.navOpened = true;
                }
            // }
        console.log('test');
        
        });

        this.getDropDownValues();
        // this.getBranches()
    }

    g() {
        this.sidenav.close();
    }


    ngOnDestroy(): void
    {
        this.sub.unsubscribe();
    }

    getScreenWidth(): Observable<number>
    {
        return this.screenWidth$.asObservable();
    }

    onManageMenu(e?: any): void
    {
        this.sidenav.toggle();
    }
    onWidthAdjustMent(e?: any): void{
        this.sidenav.toggle();
        if(e)
        {
            this.flexVal = "65px"
            this.navOpened=false
        }
        else {
            this.flexVal = "275px"
            this.navOpened=true
        }        
    }

    onManageRight(e?: any): void
    {
        this.rightNav.toggle();
    }

    logOut()
    {
        this.apiService.logout().then(result =>
        {
            if (result.code === 200)
            {
                localStorage.clear();
                window.location.reload();
            }
            else
            {
                localStorage.clear();
                window.location.reload();
            }
        });
    }

    onProfile(): void
    {
        this.router.navigateByUrl('/main/profile');
    }

    getDropDownValues() {
        let url = config.base_url_slug + 'view/standard-system-ethnicity';
        this.apiService.get(url).then((res)=> {
        //   if (!localStorage.getItem('predefinedValues')) {
            if (res.code == 200) {
                localStorage.setItem('predefinedValues', JSON.stringify(res.data));
            }
        //   }
        })
        .catch((err)=> console.log(err))
    }
    // getBranches(): any
    // {
    //     this.apiService.get(config.base_url_slug +'view/branches').then(res =>
    //     {
    //         if (res.code == 200)
    //         {

    //             this.branches = res.data.listing
    //             localStorage.setItem('branches', JSON.stringify(this.branches));
    //         }
    //         else
    //         {
    //             localStorage.setItem('branches', JSON.stringify(this.branches));
    //         }
    //     });
    // }
}
