import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import * as moment from 'moment';

import { MatDialog } from '@angular/material/dialog';
import { TimePicker } from './timepicker';
import { AlertService } from 'src/app/services';

@Component({
    selector: 'timepicker',
    templateUrl: './timepicker.component.html',
    styleUrls: ['./timepicker.component.scss']
})
export class TimePickerComponent implements OnInit, OnChanges
{
    @Input() label: string = "Time";
    @Input() time: any = 0;
    @Input() controlName: any = 0;
    @Input() disabled: boolean = false;
    @Input() required: boolean = false;
    @Input() showError: boolean = false;
    @Input() startTime: number;
    @Input() endTime: number;
    @Input() isStartEnd: boolean = false;

    @Input() icon: string = "assets/images/sdn/clock.svg";

    @Input() min: any = null;
    @Input() max: any = null;
    @Input() screen: any = '';


    @Output() onSetTime = new EventEmitter<any>();
    clicked: boolean = false;
    gotChanges: boolean = false;

    currentDate = new Date();
    currentDay: number = 0;
    currentMonth: number = 0;
    currentYear: number = 0;

    Form: FormGroup;
    timePickerOpned: boolean = false;
    displayValue: string;

    constructor(protected fb: FormBuilder, protected dialog: MatDialog, protected alertService: AlertService)
    {
        this.Form = this.fb.group({});

        if (this.required)
        {
            this.Form.addControl('time', new FormControl(null, [Validators.required]));
        }
        else
        {
            this.Form.addControl('time', new FormControl(null));
        }
    }

    ngOnChanges(changes: SimpleChanges): void
    {
        // console.log('>>>>', this.startTime);
        // console.log('>>>>', this.endTime);
        // console.log(changes);
        
        
        if (this.showError)
        {
            this.Form.markAllAsTouched();
            this.Form.get('time').setErrors({ 'invalid': true })
        }
        else
        {
            this.Form.get('time').setErrors(null)
        }

        if (this.disabled)
        {
            this.Form.disable();
        }
        else
        {
            this.Form.enable();
        }
    }

    ngOnInit(): void
    {
        this.currentDay = this.currentDate.getDate();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();

        setTimeout(() =>
        {
            if (this.time)
            {
                let timeDigits = this.time.toString().length;
                if (timeDigits < 13)
                {
                    this.time = this.time * 1000;
                }

                let t = new Date(this.time);
                t.setDate(this.currentDay);
                t.setMonth(this.currentMonth);
                t.setFullYear(this.currentYear);
                // t.setSeconds(0);

                this.time = t; // new Date()
            }
        }, 1000);

        if (this.controlName == 'startTime' && this.isStartEnd) {
            this.displayValue = moment(this.startTime).format('hh:mm a');
        }
        else if (this.controlName == 'endTime' && this.isStartEnd) {
            this.displayValue = moment(this.endTime).format('hh:mm a');
        }
        else {
            this.displayValue = moment(this.time).format('hh:mm a');
        }
    }

    onTimePicker(): void
    {
        if (this.disabled)
        {
            return;
        }
        
        let dialogRef = this.dialog.open(TimePicker,{width: '446px', height: '218px;'});

        dialogRef.componentInstance.screen = this.screen;
        dialogRef.componentInstance.isStartEnd = this.isStartEnd;
        dialogRef.componentInstance.selectedType = this.label;

        if (this.time)
        {
            let timeDigits = this.time.toString().length;
            
            if (timeDigits < 13)
            {
                this.time = this.time * 1000;
            }
            
            let t = new Date(this.time);

            t.setDate(this.currentDay);
            t.setMonth(this.currentMonth);
            t.setFullYear(this.currentYear);
            // t.setSeconds(0);

            dialogRef.componentInstance.time = t; // new Date()

        }
        else
        {
            dialogRef.componentInstance.time = new Date();
        }
        if (this.startTime) {
            let startTimeDigits = this.startTime.toString().length;
            this.startTime = startTimeDigits < 13 ? this.startTime * 1000 : this.startTime;
            let start = new Date(this.startTime);

            start.setDate(this.currentDay);
            start.setMonth(this.currentMonth);
            start.setFullYear(this.currentYear);

            dialogRef.componentInstance.startTime = start; // new Date()


        } else {
            dialogRef.componentInstance.startTime = new Date();
        }

        if (this.endTime) {
            let endTimeDigits = this.endTime.toString().length;
            this.endTime = endTimeDigits < 13 ? this.endTime * 1000 : this.endTime;
            let end = new Date(this.endTime);

            end.setDate(this.currentDay);
            end.setMonth(this.currentMonth);
            end.setFullYear(this.currentYear);

            dialogRef.componentInstance.endTime = end; // new Date()

        } else {
            dialogRef.componentInstance.endTime = new Date();
        }

        dialogRef.afterClosed().subscribe(result =>
        {
            this.timePickerOpned = true;
            this.Form.markAllAsTouched();

            if (result.selected)
            {
                this.startTime = result.startTime;
                this.endTime = result.endTime;
                console.log(this.startTime);
                console.log(this.endTime);
                
                if (this.min)
                {
                    console.log('>>>>> MIN');
                    let time = this.isStartEnd ? result.endTime : result.time; 
                    this.compareTime(this.min, time, 'greater')
                }
                else if (this.max)
                {
                    console.log('>>>>> MAX');
                    let time = this.isStartEnd ? result.startTime : result.time;
                    this.compareTime(this.max, time, 'less')
                }
                else
                {
                    this.sendData(0, result.time, 0, '');
                }
            }
        });
    }

    compareTime(compareWith, selectedTime, operator): any
    {
        if (compareWith)
        {
            let minMaxDigits = compareWith.toString().length;
            if (minMaxDigits < 13)
            {
                compareWith = compareWith * 1000;
            }

            let minMax = new Date(compareWith);
            minMax.setDate(this.currentDay);
            minMax.setMonth(this.currentMonth);
            minMax.setFullYear(this.currentYear);
            minMax.setSeconds(0);
            minMax.setMilliseconds(0);

            compareWith = minMax.getTime();

            let slct = new Date(selectedTime);
            slct.setDate(this.currentDay);
            slct.setMonth(this.currentMonth);
            slct.setFullYear(this.currentYear);
            slct.setSeconds(0);
            slct.setMilliseconds(0);

            compareWith = minMax.getTime();
            selectedTime = slct.getTime();

            compareWith = Math.trunc(compareWith); // 13 digits
            selectedTime = Math.trunc(selectedTime);// 13 digits

            let errorCount = 0;

            if (operator == 'greater')
            {
                if (compareWith < selectedTime)
                {
                    errorCount = 0;
                    this.sendData(compareWith, selectedTime, errorCount, operator);
                }
                else
                {
                    errorCount++;
                    this.sendData(compareWith, selectedTime, errorCount, operator);
                }
            }
            if (operator == 'less')
            {
                if (compareWith > selectedTime)
                {
                    errorCount = 0;
                    this.sendData(compareWith, selectedTime, errorCount, operator)
                }
                else
                {
                    errorCount++;
                    this.sendData(compareWith, selectedTime, errorCount, operator)
                }
            }
        }
        else
        {
            this.sendData(0, selectedTime, 0, '');
        }
    }

    sendData(compareWith, selectedTime, errorCount, operator): void
    {
        if (errorCount == 0)
        {
            this.Form.markAllAsTouched();
            let sendSelectedTime = 0;

            let selectedTimeLength = selectedTime.toString().length;
            if (selectedTimeLength > 10)
            {
                sendSelectedTime = selectedTime / 1000;
            }
            else
            {
                sendSelectedTime = selectedTime;
            }

            let dict = {
                timeInMili: Math.trunc(sendSelectedTime),
                startTime: Math.trunc(this.startTime/1000),
                endTime: Math.trunc(this.endTime/1000),
                controlName: this.controlName,
                valid: true
            }
            // this.time = selectedTime;
            this.onSetTime.emit(dict);
        }
        else
        {
            let t = moment(new Date(compareWith)).format("hh:mm A")
            this.time = null;
            this.alertService.alertError('ERROR', 'Time should be ' + operator + ' than ' + t);
        }
    }

    getTimeLabel(): any
    {
        if (this.time)
        {
            let length = this.time.toString().length;
            if (length < 13)
            {
                return this.time * 1000;
            }
            else
            {
                return Math.trunc(this.time);
            }
        } else {
            return null;
        }
    }

}
