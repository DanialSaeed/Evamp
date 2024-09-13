import { OnInit, Component } from "@angular/core";
import { MatDialogRef, MatDialog } from "@angular/material/dialog";


export class AlertData
{
  heading: string = '';
  message: string = '';
  hasInput: boolean = false;
  dataToSubmit: any;
  type: 'ask' | 'success' | 'error' | 'approval';
  leftButton: {
    text: string;
    class: string
  };
  rightButton: {
    text: string;
    class: string
  };
}
@Component({
  selector: 'app-config-alert',
  templateUrl: './config-alert.component.html',
  styleUrls: ['./config-alert.component.scss']
})
export class ConfigAlertComponent implements OnInit
{
  isLoading: boolean;
  hasInput: boolean = false;
  reasonTExt = ""
  dataToSubmit: any;
  methodName: any;
  showLoading: boolean;
  nonEditable = true;
  pinCode = ""
  alertData: AlertData;

  constructor( // protected mainApiService: MainService, 
    protected dialogRef: MatDialogRef<ConfigAlertComponent>, protected dialog: MatDialog) 
  {
    this.isLoading = false;
    this.showLoading = false;
    this.hasInput = true;

    this.alertData = {
      heading: 'Data',
      message: '',
      type: 'ask',
      hasInput: false,
      dataToSubmit: '',
      leftButton: {
        text: 'No',
        class: 'Yes'
      },
      rightButton: {
        text: 'No',
        class: 'Yes'
      },
    }
  }

  ngOnInit() 
  {
  }

  onCancelClick(): void
  {
    this.dialogRef.close(false);
  }

  onSubmitClick(): void
  {
    this.isLoading = true;
    this.dialogRef.close(true);

  }
}

