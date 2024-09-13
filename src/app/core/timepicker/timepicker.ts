import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import * as moment from 'moment';

import { MatDialogRef } from '@angular/material/dialog';
import { AlertService } from 'src/app/services';

@Component({
    selector: 'timepicker-dialog',
    templateUrl: './timepicker.html',
    styleUrls: ['./timepicker.scss']
})
export class TimePicker implements OnInit {
    time: Date;
    disabled = false;
    showSpinners = true;
    stepHour = 1;
    stepMinute = 15;
    stepSecond = 1;
    showSeconds = false;
    enableMeridian = true;
    screen: any = '';
    screensForAmPm = ['session', 'booking'];
    startTime: Date;
    endTime: Date;

    isStartEnd = false;

    // Custom picker
    hours = 12;
    minutes = 0;
    ampm = 'AM';
    selectedType: string;

    constructor(protected formbuilder: FormBuilder, protected dialogRef: MatDialogRef<TimePicker>, protected alertService: AlertService) {
        //    console.log(moment('18 February 2022 5:50 AM').toDate());
        
        // setTimeout(() => {
        //     this.startTime = new Date();
        //     this.startTime.setHours(0);
        //     this.startTime.setMinutes(0);
        //     this.startTime.setSeconds(0);
        // });

        // setTimeout(() => {
        //     this.endTime = new Date();
        //     this.endTime.setHours(0);
        //     this.endTime.setMinutes(0);
        //     this.endTime.setSeconds(0);
        // });
    }

    ngOnInit(): void {
        // Setting Focus on first Input
        setTimeout(() => {
            let elements: any = document.querySelectorAll('[formcontrolname="hour"]');
            // let y = Array.from(elements).find((x: any)=> x.id == 'mat-input-15');
            let index = (this.isStartEnd && this.selectedType == 'End') ? 1 : 0;

            const input: any = document.querySelectorAll('[formcontrolname="hour"]')[index];
            input.focus();
            input.setSelectionRange(0, 3);
        }, 300)

        this.setInitialTime();
        console.log(this.startTime);
        console.log(this.endTime);
        console.log(this.time);
        
    }

    onSelectTime(): void {
        // Check if start and end times are valid

        if (this.startTime && this.endTime && this.startTime > this.endTime) {
            this.alertService.alertError('ERROR', 'End time should be greater than Start Time');
            return;
        }
        // console.log(this.startTime);

        let time = this.time.getTime();
        let startTime = this.startTime.getTime();
        let endTime = this.endTime.getTime();

        let timeDigits = time.toString().length;
        if (timeDigits < 13) {
            time = time * 1000;
            startTime = startTime * 1000;
            endTime = endTime * 1000;
        }
        let dict = {
            selected: true,
            time: Math.trunc(time),
            startTime: Math.trunc(startTime),
            endTime: Math.trunc(endTime)
        }

        this.dialogRef.close(dict);
    }

    onTimeChange(): void {
        
        // this.time = moment('18 February 2022 5:50 AM').toDate();
        // setTimeout(()=>{


        let isForAmPmFeature = this.screensForAmPm.includes(this.screen);
        // if (isForAmPmFeature) {

            let hr = moment(this.time).format('LT').split(':')[0];
            let hour = Number(hr);
            let formatedDate = moment(this.time).format('LLL');
            let arr = formatedDate.split(' ');
            
            if (hour >= 8 && hour <= 11) {
                arr[4] = 'AM';
                formatedDate = arr.join(' ');
                this.time = moment(formatedDate).toDate();
            }

            if (hour == 12 || (hour >= 1 && hour <= 7)) {
                arr[4] = 'PM';
                formatedDate = arr.join(' ');
                this.time = moment(formatedDate).toDate();
            }
        // } 

        // },2000)
    }

    // onTimeEnter(e) {
    //     console.log(e.target.value);
    //     const attributeValue = e.target.getAttribute('formcontrolname');
    //     console.log(attributeValue);
    // }

    onStartEndTimeChange(type): void {
        // this.time = moment('18 February 2022 5:50 AM').toDate();
        // setTimeout(()=>{
        let isForAmPmFeature = this.screensForAmPm.includes(this.screen);
        let time = type == 'start' ? this.startTime : this.endTime;
        if (isForAmPmFeature) {
            let hr = moment(time).format('LT').split(':')[0];
            let hour = Number(hr);
            let formatedDate = moment(time).format('LLL');
            let arr = formatedDate.split(' ');

            if (hour >= 8 && hour <= 11) {
                arr[4] = 'AM';
                formatedDate = arr.join(' ');
                if (type == 'start') {
                    this.startTime = moment(formatedDate).toDate();
                } else {
                    this.endTime = moment(formatedDate).toDate();
                }
            }

            if (hour == 12 || (hour >= 1 && hour <= 7)) {
                arr[4] = 'PM';
                formatedDate = arr.join(' ');
                this.time = moment(formatedDate).toDate();
                if (type == 'start') {
                    this.startTime = moment(formatedDate).toDate();
                } else {
                    this.endTime = moment(formatedDate).toDate();
                }
            }
        }

        // },2000)
    }

    onCancel(): void {
        let dict = {
            selected: false,
            time: 0
        }
        this.dialogRef.close(dict);
    }

    // Custom picker functions

    onTimeChangee(type?) {
        let timeInMillis = 0;
        if (type == 'hours' && this.hours > 12) {
            this.hours = 1;
            return;
        }

        if (type == 'minutes' && this.minutes > 59) {
            this.minutes = null;
            return;
        }

        const date = moment().hour(this.hours % 12 + (this.ampm === 'PM' ? 12 : 0)).minute(this.minutes);
        //   console.log(date.milliseconds());

        // Get the epoch time in seconds
        //   const currentEpochTime = Math.floor(currentDate.getTime() / 1000);
        //   console.log(currentEpochTime);

    }

    setAmPm(val) {
        this.ampm = val;
        // this.onTimeChange();
    }

    setInitialTime() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();

        // Convert to 12-hour format
        this.hours = hours % 12;
        this.hours = hours ? hours : 12; // If hours is 0, it should be 12

        // Add leading zeroes to minutes less than 10
        this.minutes = minutes < 10 ? 0 + minutes : minutes;

        // Determines if it's AM or PM
        this.ampm = hours >= 12 ? 'PM' : 'AM';

    }

    onChange(type) {
        if (type == 'hour') {
            if (this.hours > 12) {
                this.hours = 1
            }

            if (this.hours < 1) {
                this.hours = 12
            }
        }

        if (type == 'minutes') {
            if (this.minutes > 59) {
                this.minutes = 1
            }

            if (this.minutes < 0) {
                this.minutes = 59
            }
        }
    }

    formatInput(input: HTMLInputElement) {
        // Get the input value as a number
        const value = Number(input.value);

        // Format the value with two digits
        const formattedValue = value.toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false
        });

        // Set the input value to the formatted value
        input.value = formattedValue;
    }

}
