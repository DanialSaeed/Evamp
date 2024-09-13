import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoadingService } from './services/loading.service';
import { finalize } from 'rxjs/operators';

@Injectable()
export class NetworkInterceptor implements HttpInterceptor {
  constructor(private loader: LoadingService) {}

  intercept(
    request: HttpRequest < unknown > ,
    next: HttpHandler
  ): Observable < HttpEvent < unknown >> {

    const req = request.clone({setHeaders: {'Cache-Control': 'no-cache', Pragma: 'no-cache'}});

    this.loader.show();
    return next.handle(req).pipe(
      finalize(() => {
        this.loader.hide();
      })
    );
  }
}
