import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

@Injectable()
export class ViewsGuard implements CanActivate
{

    constructor(private router: Router) { }

    canActivate()
    {
        let sdnUser = JSON.parse(localStorage.getItem('sdnUser'));
        if (sdnUser) 
        {
            return true;
        }
        this.router.navigate(['/auth/login']);
        return false;
    }
}

