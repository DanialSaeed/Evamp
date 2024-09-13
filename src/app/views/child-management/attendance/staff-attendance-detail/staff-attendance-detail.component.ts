import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ApiService, AlertService } from 'src/app/services';
import { config } from 'src/config';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-staff-attendance-detail',
    templateUrl: './staff-attendance-detail.component.html',
    styleUrls: [
        './staff-attendance-detail.component.scss',
        '/src/app/views/shared-style.scss',
    ],
})
export class StaffAttendanceDetailComponent implements OnInit
{
    public date = moment();
    public currentMonth = moment();
    rangeMaxDate: any;
    public disabledNext = false;
    public daysArr = [];
    sub: Subscription;
    recId: any;
    attendanceType: any;
    type: any = 'detail';
    attendanceDetail: any;
    bookedDaysDetail: any;
    childDetails: any;
    detailUrl: string;
    dateUrl: string;
    attendanceReport: any;
    otherDaysArr: any[] = [];
    gardenerDetail: any;
    selectedDay: any;
    bookedDays: any = [];
    bankHolidays: any = [];
    selectedDays: any[] = []
    childLeavingDate: any
    childJoiningDate: any
    newBookedDays: any = []
    attendanceKpi: any = {
        totalPresent: 0,
        totalAbsent: 0,
        totalAttendance: 0,
        attendancePercentage: 0,
        bankHolidays: 0,
    };
    Form: FormGroup;
    @Input() start: any = null;
    @Input() end: any = null;
    title = 'Child Name';
    extraDay: any = 'Extra Sitting';
    AttendanceDate: string;
    notes: any = '';

    constructor(
        protected apiService: ApiService,
        protected alertService: AlertService,
        protected _route: ActivatedRoute
    )
    {
        this.Form = new FormGroup({
            start: new FormControl(this.start),
            end: new FormControl(this.end),
        });
        let date = new Date();
        this.rangeMaxDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }
    public ngOnInit()
    {
        this.sub = this._route.params.subscribe((params) =>
        {
            this.recId = params['id'];
            this.attendanceType = params['type'];
            let apiType = 'child';
            if (this.attendanceType != 'child')
            {
                apiType = 'staff';
                this.title = 'Staff Name';
                this.extraDay = 'Extra Day';
            }
            this.detailUrl =config.base_url_slug + 'view/' + apiType + '/attendance-details?branchId=' + localStorage.getItem('branchId') + '&' +
            this.attendanceType + 'Id=' + this.recId;
            this.AttendanceDate = localStorage.getItem('AttendanceDate');
            if (this.AttendanceDate)
                {
                    let dt = new Date(parseInt(this.AttendanceDate) * 1000).setHours(0, 0, 0, 0);
                    this.date = moment(new Date(dt));
                }
                else
                {
                    this.date = moment(new Date());
                }
           
            this.getBookedDays();
        });

        this.AttendanceDate = localStorage.getItem('AttendanceDate');
    }
    getDetail(): void
    {
        let startDate = this.date.startOf('month').format(config.serverDateFormat);
        let endDate = this.date.endOf('month').format(config.serverDateFormat);
        let url =
            this.detailUrl + '&startDate=' + startDate + '&endDate=' + endDate + '&isKpi=true';
        this.apiService.get(url).then((result) =>
        {
            if (result.code === 200 && result.data)
            {
                this.attendanceDetail = result.data;
                this.childDetails = this.attendanceType == 'child' ? result.data.childDetails : result.data.staffDetails;
                this.bankHolidays = [];
                this.attendanceDetail.holidays.holidaysList.forEach((holiday) =>
                {
                    this.bankHolidays.push(holiday.date);
                });
                if (this.type == 'detail')
                {
                    this.daysArr = this.createCalendar(this.date);
                    this.getDaysArray();
                }
                if (this.Form.get('start').value == null || this.Form.get('end').value == null)
                {
                    this.attendanceKpi = result.data.attendaceCalculation;
                }
            }
            else
            {
                this.attendanceDetail = {};
                this.alertService.alertError(result.status, result.message);
            }
        });
        console.log(this.bankHolidays);
    }
    public nextMonth()
    {
        console.log('nextMonth');
        this.date.add(1, 'M');
        this.daysArr = this.createCalendar(this.date);
        this.getBookedDays();
    }
    public previousMonth()
    {
        console.log('previousMonth');
        this.date.subtract(1, 'M');
        this.daysArr = this.createCalendar(this.date);
        this.getBookedDays();
    }
    getBookedDays(): void
    {
        if (this.attendanceType == 'child')
        {
            let startDate = this.date.startOf('month').format(config.serverDateFormat);
            let endDate = this.date.endOf('month').format(config.serverDateFormat);
            let url_days = config.base_url_slug + 'view/child/' + this.recId + '/attendance/booked-days?' + 'startDate=' + startDate + '&endDate=' + endDate;
            this.apiService.get(url_days).then((result) =>
            {
                if (result.code === 200 && result.data)
                {
                    this.bookedDaysDetail = result.data
                    this.getDetail();
                }
                else
                {
                    this.bookedDays = [];
                    this.alertService.alertError(result.status, result.message);
                }
            });
        }
        else
        {
            this.bookedDays = [
                'monday',
                'tuesday',
                'wednesday',
                'thursday',
                'friday',
            ];
            this.getDetail();
        }
    }
    getAttendanceKpis(range): void
    {
        let url = this.detailUrl + range + '&isKpi=true';
        this.apiService.get(url).then((result) =>
        {
            if (result.code === 200 && result.data)
            {
                this.attendanceKpi = result.data.attendaceCalculation;
            }
            else
            {
                this.attendanceKpi = {};
                this.alertService.alertError(result.status, result.message);
            }
        });
    }
    getDaysArray(): any
    {
        let daysArr = [];
        if (this.daysArr.length > 0)
        {
            this.daysArr.forEach((element) =>
            {
                let dict = {
                    date: element,
                    value: 'off',
                    detail: null,
                    current: false,
                    filled: false,
                    isBookedDay: false
                };
                if (element != null)
                {
                    let day = element.format('dddd');
                    if (this.attendanceType == 'child')
                    {
                        let joiningDate = this.getGMT(this.childJoiningDate);
                        let leavingDate = this.selectThisMonth();
                        if (this.childLeavingDate)
                        {
                            leavingDate = this.getGMT(this.childLeavingDate);
                        }
                        let booked = 'off';
                        dict.value = day === 'Sunday' || day === 'Saturday' ? 'weekend' : this.selectedDays.includes(day.toLowerCase()) ? booked : 'off';
                    }
                    else
                    {
                        dict.value =
                            day === 'Sunday' || day === 'Saturday' ? 'weekend' : this.selectedDays.includes(day.toLowerCase()) ? 'booked' : 'off';
                    }
                    let holidayDate = element.format(config.serverDateFormat);
                    if (this.bankHolidays.includes(holidayDate))
                    {
                        dict.value = 'bank_holiday';
                    }
                }

                let currentDate = new Date().setHours(0, 0, 0, 0);

                if (this.AttendanceDate)
                {
                    currentDate = new Date(parseInt(this.AttendanceDate) * 1000).setHours(0, 0, 0, 0);
                }

                let afterDate = moment(element).toDate().setHours(0, 0, 0, 0);
                this.attendanceDetail.attendance.forEach((attendance) =>
                {
                    let afterTimeIn = new Date(attendance.createdTime * 1000).setHours(
                        0,
                        0,
                        0,
                        0
                    );
                    let afterTimeInTwo = new Date(attendance.createdDate).getTime();
                    afterTimeInTwo = new Date(afterTimeInTwo).setHours(0, 0, 0, 0);

                    let afterDate = moment(element).toDate().setHours(0, 0, 0, 0);
                    if (afterDate == afterTimeInTwo)
                    {
                        if (attendance.attendance == 'absent')
                        {
                            dict.value = 'absent';
                        }
                        else
                        {
                            dict.value = 'present';
                        }
                        let isBookedDay = attendance.isBookedDay
                        dict.isBookedDay = isBookedDay;
                        dict.detail = attendance;
                        dict.filled = true;
                    }
                });
                if (afterDate == currentDate)
                {
                    dict.current = true;
                    if (dict.value != 'weekend')
                    {
                        this.selectedDay = dict;
                    }
                }
                daysArr.push(dict);
            });
        }
        this.otherDaysArr = daysArr;

        if (this.attendanceType == 'child')
        {
            this.getNewBookedDays();
        }
    }
    getNewBookedDays()
    {
        for (var i = 0; i < this.bookedDaysDetail.length; i++)
        {
            let dateObject = this.bookedDaysDetail[i]
            let calendeDate;
            let bookedDate = moment(dateObject.startDate).toDate().setHours(0, 0, 0, 0);
            for (var j = 0; j < this.otherDaysArr.length; j++)
            {
                calendeDate = this.otherDaysArr[j].date
                if (calendeDate === null)
                {
                    let date = null
                }
                else
                {
                    let date = moment(calendeDate).toDate().setHours(0, 0, 0, 0);
                    if (date == bookedDate && this.otherDaysArr[j].value == "off")
                    {
                        this.otherDaysArr[j].value = "booked"
                    }
                }
            }
        }
    }
    public createCalendar(month)
    {
        this.selectedDay = null;
        var dateMili = moment(this.date).toDate().setHours(0, 0, 0, 0);
        var currentMili = moment(this.currentMonth).toDate().setHours(0, 0, 0, 0);

        var date = new Date(dateMili);
        var current = new Date(currentMili);

        var dateDay = new Date(date.getFullYear(), date.getMonth(), 1);
        var currentDay = new Date(current.getFullYear(), current.getMonth(), 1);

        let startDateDay = dateDay.getTime() / 1000;
        let startCurrentDay = currentDay.getTime() / 1000;

        if (startDateDay == startCurrentDay)
        {
            this.disabledNext = true;
        } else
        {
            this.disabledNext = false;
        }

        let firstDay = moment(month).startOf('M');
        let days = Array.apply(null, { length: month.daysInMonth() })
            .map(Number.call, Number)
            .map((n) =>
            {
                return moment(firstDay).add(n, 'd');
            });

        for (let n = 0; n < firstDay.weekday(); n++)
        {
            days.unshift(null);
        }
        return days;
    }

    onClickDate(day): void
    {
        if (this.type == 'detail')
        {
            if (day.value != 'weekend' && day.value != 'off')
            {
                this.selectedDay = day;
            }
        }
    }

    onClosed(): void
    {
        if (
            this.Form.get('start').value == null ||
            this.Form.get('end').value == null
        )
        {
            this.onClear();
        }
    }

    onClear(): void
    {
        this.Form.reset();
    }

    valueChanged(): void
    {
        if (this.Form.get('start').value && this.Form.get('end').value)
        {
            let start = moment(this.Form.get('start').value).toDate().setHours(0, 0, 0);
            let end = moment(this.Form.get('end').value).toDate().setHours(23, 59, 59);
            let range = '&startDate=' + moment(start).format(config.serverDateFormat) + '&endDate=' + moment(end).format(config.serverDateFormat);
            this.getAttendanceKpis(range);
        }
        else
        {
            this.getDetail();
        }
    }
    getGMT(input)
    {
        let date = new Date(input);
        return new Date(date.valueOf() + date.getTimezoneOffset() * 60000);
    }
    selectThisMonth()
    {
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth() + 1;
        let day = new Date(year, month, 0);
        return day;
    }
}
