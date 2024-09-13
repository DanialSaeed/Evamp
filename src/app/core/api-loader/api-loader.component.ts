import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiLoaderService } from './api-loader.service';
import { LoaderState } from './loader';

@Component({
    selector: 'api-loader',
    templateUrl: './api-loader.component.html',
    styleUrls: ['./api-loader.component.scss']
})
export class ApiLoaderComponent implements OnInit, OnDestroy 
{
    show = false;
    private subscription: Subscription;

    constructor(private loaderService: ApiLoaderService, private _changeDetectorRef: ChangeDetectorRef) 
    { 

    }

    ngOnInit() 
    {
        this.subscription = this.loaderService.loaderState.subscribe((state: LoaderState) => 
        {
            this.show = state.show;
            this._changeDetectorRef.detectChanges();
        });
    }

    ngOnDestroy() 
    {
        this.subscription.unsubscribe();
    }

}