import { ChangeDetectorRef, Component } from '@angular/core';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sdn-cms';
  loading$ = this.loader.loading$;
  constructor(public loader: LoadingService, private cdr: ChangeDetectorRef) {
    console.log('Updated');
    
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
 }
}
