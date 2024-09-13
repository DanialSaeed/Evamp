import { OnInit, Component } from "@angular/core";
import { MatDialogRef, MatDialog } from "@angular/material/dialog";

// import { MainService } from "../services/main.service";

export class AlertData
{
	heading: string = '';
	message: string = '';
	hasInput: boolean = false;
	type: 'ask' | 'success' | 'error' | 'info';
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
	selector: 'alert-dialog',
	templateUrl: './alert.dialog.html'
})
export class AlertDialog implements OnInit 
{
	isLoading: boolean;
	hasInput: boolean = false;
	reasonTExt = ""
	dataToSubmit: any;
	methodName: any;
	showLoading: boolean;

	alertData: AlertData;

	constructor(
		protected dialogRef: MatDialogRef<AlertDialog>, protected dialog: MatDialog) 
	{
		this.isLoading = false;
		this.showLoading = false;
		this.hasInput = true;

		this.alertData = {
			heading: 'Data',
			message: '',
			type: 'ask',
			hasInput: false,
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
		// Setting Focus on reason textarea
		setTimeout(()=> {
			const input: any = document.getElementById("reason");
			if (input) {
			  input.focus();
			}
		},0)
	}

	onCancelClick(): void
	{
		this.dialogRef.close(false);
	}

	onSubmitClick(): void
	{
		// this.dialogRef.close(true);
		this.isLoading = true;
		if (this.alertData.hasInput) {
			this.dialogRef.close(this.reasonTExt);
		} else {
			this.dialogRef.close(true);
		}

	}
}
