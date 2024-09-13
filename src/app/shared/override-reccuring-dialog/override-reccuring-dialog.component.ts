import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { AlertService, ApiService } from 'src/app/services';
import { PeriodicElement } from 'src/app/views/child-management/child-booking/add-booking/multiple-booking-detail/multiple-booking-detail.component';
import { config } from 'src/config';

@Component({
  selector: 'app-override-reccuring-dialog',
  templateUrl: './override-reccuring-dialog.component.html',
  styleUrls: ['./override-reccuring-dialog.component.scss']
})
export class OverrideReccuringDialogComponent implements OnInit {
  joiningDate: any;
  childId: any;
  type: string;
  bookingId: any;

  constructor(protected alertService: AlertService,
              protected apiService: ApiService,
              protected dialogRef: MatDialogRef<OverrideReccuringDialogComponent>) { }

  selection = new SelectionModel<PeriodicElement>(true, []);
  displayedColumns: string[] = ['select','day', 'room', 'session', 'addOns'];
  dataSource = new MatTableDataSource([]);
  sessionIds: number[] = [];


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  getSessions() {
  
    let endpoint = `${config.base_url_slug}view/childs/adhoc-override-recurring-dates?attributes=[{"key": "childId", "value": "${this.childId}"}, {"key": "joiningDate", "value": "${this.joiningDate}"}, {"key": "method", "value": "${this.type == 'new' ? 'add' : 'update'}"} ${this.type != 'new' ? `, {"key":"BookingId","value": ${this.bookingId} }`: ''}]`;
    this.apiService.get(endpoint).then((res)=> {
  
      // Patch listing values for table
      let sessions = res.data.RecurringSessions;
      let selectedSessions = this.type !== 'new' ? res.data.selectedSessions : [];

      sessions.forEach(element => {
        element['addOnDisplay'] = element.addons.length == 0 ? '-' : element.addons.join(', ');
        element['startTimeDisplay'] = element.startTime ? moment((element.startTime * 1000) + (new Date(element.startTime * 1000).getTimezoneOffset()*60000)) : 0;
        element['endTimeDisplay'] = element.endTime ? moment((element.endTime * 1000) + (new Date(element.endTime * 1000).getTimezoneOffset()*60000)) : 0;
      });

      this.dataSource = new MatTableDataSource(sessions);

      if (this.type == 'new' && this.sessionIds.length == 0) {
        this.dataSource.data.forEach(row => this.selection.select(row));
        return;
      }
      
      if (this.type == 'new' || this.sessionIds.length != 0) {
        this.sessionIds.forEach((sessionId)=> {
          this.dataSource.data.forEach(row =>  {
            if (sessionId == row.sessionId) {
              this.selection.select(row)
            }
          })
        })
      } else {
        selectedSessions.forEach((session)=> {
          this.dataSource.data.forEach(row =>  {
            if (session.sessionId == row.sessionId) {
              this.selection.select(row)
            }
          })
        })
      }

  
    })
    .catch(err => {
      this.alertService.alertError(err.error.status, err.error.message).then(result => {
        // this.getList(this.filterUrl);
      })
    })
  }

  onCancelClick() {
    let selectedIds = this.selection.selected.map((x: any) => x.sessionId);
    this.dialogRef.close({sessionIds : selectedIds, status: false});
  }

  onSubmitClick() {
    
    // if (this.selection.isEmpty()) {
    //   this.alertService.alertError('WARNING', 'Please fill the required data.');
    //   return;
    // }

    let selectedIds = this.selection.isEmpty() ? [] : this.selection.selected.map((x: any) => x.sessionId);

    this.dialogRef.close({sessionIds : selectedIds, status: true});
  }
 


  ngOnInit(): void {
    this.getSessions();
  }

}
