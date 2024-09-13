import { Injectable } from '@angular/core';
import { AlertDialog } from '../core/alert/alert.dialog';
import { MatDialog } from '@angular/material/dialog';
import { ConfigAlertComponent } from 'src/app/shared/config-alert/config-alert.component';

@Injectable()
export class AlertService 
{

    constructor(protected dialog: MatDialog) 
    {

    }

    alertAsk(heading: string, message: string, rightButton: string, leftButton: string, hasInput: boolean,textData= null)
    {
        var promise = new Promise((resolve, reject) =>
        {
            let dialogRef = this.dialog.open(AlertDialog, { autoFocus: false });
            dialogRef.componentInstance.alertData = {
                heading: heading,
                message: message,
                hasInput: hasInput,
                rightButton: {
                    text: rightButton,
                    class: 'btn-custom-form'
                },
                leftButton: {
                    text: leftButton,
                    class: 'btn-white'
                },
                type: 'ask',
            };
            dialogRef.componentInstance.reasonTExt = textData;

            dialogRef.afterClosed().subscribe(result =>
            {
                resolve(result);
            })
        });
        return promise;
    }

    private alertAsk2(heading: string, message: string, rightButton: string, leftButton: string): any
    {
        let dialogRef = this.dialog.open(AlertDialog, { autoFocus: false });
        dialogRef.componentInstance.alertData = {
            heading: heading,
            message: message,
            hasInput: false,
            rightButton: {
                text: rightButton,
                class: 'btn-red'
            },
            leftButton: {
                text: leftButton,
                class: 'btn-white'
            },
            type: 'ask',
        };

        dialogRef.afterClosed().subscribe(result =>
        {
            return result;
        })
    }

    public alertError(heading: string, message: string): Promise<any>
    {
        return this.alert(heading, message, 'btn-red');
    }

    public alertSuccess(heading: string, message: string): Promise<any>
    {
        return this.alert(heading, message, 'btn-custom-form');
    }

    public alertInfo(heading: string, message: string): Promise<any>
    {
        return this.alert(heading, message, 'btn-white');
    }

    private alert(heading: string, message: string, btnClass: string): any
    {
        var promise = new Promise((resolve, reject) =>
        {
            let dialogRef = this.dialog.open(AlertDialog, { autoFocus: false });
            dialogRef.componentInstance.alertData = {
                heading: heading,
                message: message,
                hasInput: false,
                rightButton: {
                    text: '',
                    class: 'btn-red'
                },
                leftButton: {
                    text: 'Ok',
                    class: btnClass
                },
                type: 'success',
            };

            dialogRef.afterClosed().subscribe(result =>
            {
                resolve(result);
            })
        });
        // Logs console.log(promise);
        return promise;
    }
    public alertAdd(heading: string, message: string, rightButton: string, leftButton: string, hasInput: boolean, dataToSubmit: any,type:any)

    {
        var promise = new Promise((resolve, reject) =>
        {
            let dialogRef = this.dialog.open(ConfigAlertComponent, { autoFocus: false });
            dialogRef.componentInstance.alertData = {
                heading: heading,
                message: message,
                hasInput: hasInput,
                dataToSubmit: dataToSubmit,
                rightButton: {
                    text: rightButton,
                    class: 'btn-custom-form'
                },
                leftButton: {
                    text: leftButton,
                    class: 'btn-white'
                },
                type: type,
            };

            dialogRef.afterClosed().subscribe(result =>
            {
                resolve(result);
            })
        });
        return promise;
    }
}
