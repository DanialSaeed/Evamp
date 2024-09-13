import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class LoaderService 
{
    isLoadingEvent: Subject<any> = new Subject<any>();

    constructor() 
    {
        this.isLoadingEvent.next(false);
    }

    setLoading(val)
    {
        this.isLoadingEvent.next(val);
    }
}
