import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, pipe } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiLoaderService } from './api-loader.service';


@Injectable({
	providedIn: 'root'
})
export class ApiLoaderInterceptorService implements HttpInterceptor 
{
	constructor(private loaderService: ApiLoaderService) 
	{

	}

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> 
	{
		this.showLoader();
		
		return next.handle(req).pipe(tap((event: HttpEvent<any>) => 
		{
			if (event instanceof HttpResponse) 
			{
				this.onEnd();
			}
		},
		(err: any) => 
		{
			this.onEnd();
		}));
	}

	private onEnd(): void 
	{
		this.hideLoader();
	}

	private showLoader(): void 
	{
		this.loaderService.show();
	}

	private hideLoader(): void
	{
		this.loaderService.hide();
	}
}