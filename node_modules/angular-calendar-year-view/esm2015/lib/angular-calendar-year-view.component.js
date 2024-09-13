/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Component, Input, Output, EventEmitter, HostBinding, TemplateRef } from "@angular/core";
import * as cloneDeep from "lodash/cloneDeep";
import { DomSanitizer } from '@angular/platform-browser';
/** @type {?} */
const clone = ((/** @type {?} */ (cloneDeep))).default || cloneDeep;
export class AngularCalendarYearViewComponent {
    /**
     * @param {?} sanitizer
     */
    constructor(sanitizer) {
        this.sanitizer = sanitizer;
        this.themecolor = '#ff0000';
        this.events = [];
        this.viewDate = new Date();
        this.nothingToshowText = "There are no events scheduled that day.";
        this.popoverEnabled = true;
        this.eventClicked = new EventEmitter();
        this.actionClicked = new EventEmitter();
        this.dayClicked = new EventEmitter();
        this.loader = false;
        this.days = [new Date(2019, 1, 3), new Date(2019, 1, 4), new Date(2019, 1, 5), new Date(2019, 1, 6), new Date(2019, 1, 7), new Date(2019, 1, 8), new Date(2019, 1, 9)];
        this.daydetails = {};
        this.year = new Date().getFullYear();
        this.calendar = [];
        this.spinner = true;
    }
    /**
     * @return {?}
     */
    get style() {
        return this.sanitizer.bypassSecurityTrustStyle(`--themecolor: ${this.themecolor};`);
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this.initCalendar(this.viewDate);
    }
    /**
     * @return {?}
     */
    ngOnChanges() {
        this.initCalendar(this.viewDate);
    }
    /**
     * @param {?} date
     * @return {?}
     */
    initCalendar(date) {
        this.year = date.getFullYear();
        this.calendar = [];
        this.spinner = true;
        for (let index = 0; index < 12; index++) {
            this.calendar.push({
                date: new Date(this.year, index + 1, 0),
                days: this.generateCalendar(index + 1, this.year)
            });
        }
        /** @type {?} */
        let self = this;
        setTimeout((/**
         * @return {?}
         */
        () => {
            self.spinner = false;
        }), 2000);
    }
    /**
     * @param {?} month
     * @param {?} year
     * @return {?}
     */
    generateCalendar(month, year) {
        /** @type {?} */
        let monthList = [];
        /** @type {?} */
        let nbweeks = this.getNbWeeks(month, year);
        /** @type {?} */
        let dayone = new Date(year, month - 1, 1).getDay();
        /** @type {?} */
        let nbdaysMonth = new Date(year, month, 0).getDate();
        /** @type {?} */
        let lastdayindex = new Date(year, month - 1, nbdaysMonth).getDay();
        /** @type {?} */
        let lastday = 7;
        /** @type {?} */
        let day = 1;
        /** @type {?} */
        let today = new Date().toDateString();
        for (let indexweek = 0; indexweek < nbweeks; indexweek++) {
            monthList[indexweek] = [];
            if (nbweeks == indexweek + 1) {
                lastday = lastdayindex + 1;
            }
            if (indexweek > 0) {
                dayone = 0;
            }
            for (let indexday = dayone; indexday < lastday; indexday++) {
                /** @type {?} */
                let d1 = new Date(year, month - 1, day).toDateString();
                /** @type {?} */
                let istoday = d1 == today;
                /** @type {?} */
                let colorsEvents = this.getnbevents(day, month - 1);
                monthList[indexweek][indexday] = {
                    day: day,
                    istoday: istoday,
                    colors: colorsEvents.color,
                    events: [],
                    nb: colorsEvents.nb
                };
                day++;
            }
        }
        return monthList;
    }
    /**
     * @param {?} month
     * @param {?} year
     * @return {?}
     */
    getNbWeeks(month, year) {
        /** @type {?} */
        let dayone = new Date(year, month - 1, 1).getDay();
        /** @type {?} */
        let nbdaysMonth = new Date(year, month, 0).getDate();
        /** @type {?} */
        let lastday = new Date(year, month - 1, nbdaysMonth).getDay();
        return (nbdaysMonth + dayone + (6 - lastday)) / 7;
    }
    /**
     * @param {?} day
     * @param {?} month
     * @return {?}
     */
    dayClickedFn(day, month) {
        /** @type {?} */
        let date = new Date(this.year, month, day.day);
        this.daydetails = { events: [] };
        if (this.events.length > 0) {
            this.loader = true;
            this.daydetails = clone(day);
            /** @type {?} */
            let d1 = new Date(this.year, month, day.day).toDateString();
            for (let index = 0; index < this.events.length; index++) {
                /** @type {?} */
                const element = this.events[index];
                /** @type {?} */
                let d2 = element.start.toDateString();
                if (d2 == d1) {
                    this.daydetails.events.push(element);
                }
            }
        }
        this.dayClicked.emit({ date: date, events: this.daydetails.events });
    }
    /**
     * @param {?} day
     * @param {?} month
     * @return {?}
     */
    getTodayEvents(day, month) {
        this.daydetails = {};
        if (this.events.length > 0) {
            this.loader = true;
            this.daydetails = clone(day);
            /** @type {?} */
            let d1 = new Date(this.year, month, day.day).toDateString();
            for (let index = 0; index < this.events.length; index++) {
                /** @type {?} */
                const element = this.events[index];
                /** @type {?} */
                let d2 = element.start.toDateString();
                if (d2 == d1) {
                    this.daydetails.events.push(element);
                }
                if (index == this.events.length - 1) {
                    /** @type {?} */
                    let self = this;
                    setTimeout((/**
                     * @return {?}
                     */
                    () => {
                        self.loader = false;
                    }), 1000);
                }
            }
        }
    }
    /**
     * @param {?} day
     * @param {?} month
     * @return {?}
     */
    getnbevents(day, month) {
        /** @type {?} */
        let nb = 0;
        /** @type {?} */
        let colors = [];
        if (this.events.length > 0) {
            /** @type {?} */
            let d1 = new Date(this.year, month, day).toDateString();
            for (let index = 0; index < this.events.length; index++) {
                /** @type {?} */
                const element = this.events[index];
                /** @type {?} */
                let d2 = element.start.toDateString();
                if (d2 == d1) {
                    nb++;
                    colors.push(element.color.secondary);
                }
            }
            return ({ nb: nb, color: colors.toString() });
        }
        else {
            return { color: "", nb: 0 };
        }
    }
    /**
     * @param {?} event
     * @return {?}
     */
    eventClickedFn(event) {
        this.eventClicked.emit(event);
    }
    /**
     * @param {?} date
     * @return {?}
     */
    refresh(date) {
        this.initCalendar(date);
    }
    /**
     * @param {?} action
     * @param {?=} event
     * @return {?}
     */
    actionClickedFn(action, event) {
        this.actionClicked.emit({ action: action, event: event });
    }
}
AngularCalendarYearViewComponent.decorators = [
    { type: Component, args: [{
                selector: 'angular-calendar-year-view',
                template: `
  <div class="calendarcontainer flexmonths">
  <div class="responsivecontainer" *ngFor="let Month of calendar;let m =index">
      <div  class="monthcontainer ">
        <p class="monthname">{{Month.date | date:'MMMM'}}</p>
        <div class="flexdays">
          <div class="day" *ngFor="let label of days">
            {{label | date:'EEEEEE'}}
          </div>
        </div>
        <div *ngFor="let week of Month.days" class="flexdays">
          <div *ngFor="let day of week;let i=index" [ngClass]="day?( day.istoday?'todayclass':(day.nb>0?'haveevents':'')):   'void_day'"
            [style.background-image]="day? ('linear-gradient(120deg, '+day.colors+',#fff)'):''" class="day" 
            [outsideClick]="true"
            [popover]="popoverEnabled?(customTemplate?customTemplate:yearcalendarpoptemplate):''" 
            placement="right" 
            (onShown)="dayindex=i;getTodayEvents(day,m)"
            (click)="dayClickedFn(day,m)">
            {{day?.day}}
          </div>
        </div>
      </div>
  </div>
</div>
<div *ngIf="spinner" class="calendar-loading">
  <svg class="spinner" viewBox="25 25 50 50">
    <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10" />
  </svg>
</div>
<ng-template #yearcalendarpoptemplate>
  <div class="col-md-12 col-calendar">
    <p [ngClass]="daydetails.istoday?'todaytext':''" class="pop_year_day">{{days[dayindex]| date:'EEEEEE'}}.</p>
    <p [ngClass]="daydetails.istoday?'todaytext':''" class="pop_year_day_number">{{daydetails?.day}} </p>
    <div *ngIf="!loader">
      <div *ngFor="let event of daydetails.events">
          <a   [style.color]="event.color.primary+'!importants'" 
               class="icon-action-calendar" 
               *ngFor='let action of event.actions' 
                [innerHTML]='action.label' 
                (click)="actionClickedFn(action.name,event)"
                >
            
          </a>
        <div class="circle_day_color" [style.background]="event.color.secondary" [style.border-color]="event.color.primary"></div>
        <p class="pop_year_event_title" (click)="eventClickedFn(event)">
          <span>
            {{event.start| date:'HH:mm'}}
          </span>
          {{event.title}}
        </p>
        
      </div>
    </div>
    <div class="progressbar_popyear" *ngIf="!daydetails.events||(daydetails.events.length==0)&&!loader">
     {{nothingToshowText}} 
    </div>
    <div [hidden]="!loader" class="loader_popover_calendar"></div>
  </div>
</ng-template>
  `,
                styles: [".flexdays{display:flex}.flexmonths{display:flex;flex-wrap:wrap}.calendarcontainer{margin:auto;padding:15px}.col-calendar{min-width:250px}.monthcontainer{width:245px;margin:auto auto 25px;background:#fff;padding:10px;min-height:293px}.haveevents{background:linear-gradient(120deg,var(--primary),#fff);color:var(--textcolor)}.flexdays .day{padding:2px;width:28px!important;height:28px!important;border-radius:50%;margin:2px;text-align:center}.flexdays .day:hover,.yeardayactive{background:#eee;cursor:pointer}.monthname{text-align:center;font-size:18px;color:var(--themecolor);text-transform:capitalize}.title-calendar-year{margin-bottom:25px}.todayclass{background:var(--themecolor)!important;color:#fff}.eventclass{background:#4ab3cc!important;color:#fff}.todaytext{color:var(--themecolor)!important}.eventtext{color:#4ab3cc!important}.void_day{pointer-events:none}.pop_year_day{color:#6c6c6c;font-size:16px}.pop_year_day_number{font-size:38px;color:#b3b3b3;margin-left:6px;margin-top:-15px}.circle_day_color{width:10px;height:10px;border-radius:50%;float:left;margin-right:6px;margin-top:5px;border:1px solid}.pop_year_event_title{width:200px;color:#b7b7b6;margin-top:-8px}.progressbar_popyear{width:200px;padding:13px 0}.pop_year_event_title:hover{text-decoration:underline;cursor:pointer}.icon-action-calendar{float:right;color:#8a8989!important;cursor:pointer}.icon-action-calendar:hover{opacity:.4}.calendar-loading .spinner{height:200px;width:200px;-webkit-animation:2s linear infinite rotate;animation:2s linear infinite rotate;-webkit-transform-origin:center center;transform-origin:center center;position:absolute;top:0;bottom:0;left:0;right:0;margin:auto}.calendar-loading .spinner .path{stroke-dasharray:1,200;stroke-dashoffset:0;-webkit-animation:1.5s ease-in-out infinite dash;animation:1.5s ease-in-out infinite dash;stroke-linecap:round;stroke:var(--themecolor)}@-webkit-keyframes rotate{100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes rotate{100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@-webkit-keyframes dash{0%{stroke-dasharray:1,200;stroke-dashoffset:0}50%{stroke-dasharray:89,200;stroke-dashoffset:-35px}100%{stroke-dasharray:89,200;stroke-dashoffset:-124px}}@keyframes dash{0%{stroke-dasharray:1,200;stroke-dashoffset:0}50%{stroke-dasharray:89,200;stroke-dashoffset:-35px}100%{stroke-dasharray:89,200;stroke-dashoffset:-124px}}.loader_popover_calendar{height:6px;width:90%;margin-bottom:10px;overflow:hidden;background-color:#ffdede00;position:absolute}.loader_popover_calendar:before{display:block;position:absolute;content:\"\";left:-20px;width:20px;height:4px;background-color:var(--themecolor);-webkit-animation:1s linear infinite loading;animation:1s linear infinite loading}@-webkit-keyframes loading{from{left:-20px;width:30%}50%{width:30%}70%{width:70%}80%{left:50%}95%{left:120%}to{left:100%}}@keyframes loading{from{left:-20px;width:30%}50%{width:30%}70%{width:70%}80%{left:50%}95%{left:120%}to{left:100%}}.titles_calendar{font-weight:700;text-transform:capitalize}.responsivecontainer{width:25%}@media screen and (max-width:499px){.responsivecontainer{width:100%!important}}@media screen and (min-width:500px) and (max-width:749px){.responsivecontainer{width:50%!important}}@media screen and (min-width:750px) and (max-width:999px){.responsivecontainer{width:33%!important}}@media screen and (min-width:1000px){.responsivecontainer{width:25%!important}}"]
            }] }
];
/** @nocollapse */
AngularCalendarYearViewComponent.ctorParameters = () => [
    { type: DomSanitizer }
];
AngularCalendarYearViewComponent.propDecorators = {
    style: [{ type: HostBinding, args: ['style',] }],
    themecolor: [{ type: Input }],
    events: [{ type: Input }],
    viewDate: [{ type: Input }],
    nothingToshowText: [{ type: Input }],
    popoverEnabled: [{ type: Input }],
    customTemplate: [{ type: Input }],
    eventClicked: [{ type: Output }],
    actionClicked: [{ type: Output }],
    dayClicked: [{ type: Output }]
};
if (false) {
    /** @type {?} */
    AngularCalendarYearViewComponent.prototype.themecolor;
    /** @type {?} */
    AngularCalendarYearViewComponent.prototype.events;
    /** @type {?} */
    AngularCalendarYearViewComponent.prototype.viewDate;
    /** @type {?} */
    AngularCalendarYearViewComponent.prototype.nothingToshowText;
    /** @type {?} */
    AngularCalendarYearViewComponent.prototype.popoverEnabled;
    /** @type {?} */
    AngularCalendarYearViewComponent.prototype.customTemplate;
    /** @type {?} */
    AngularCalendarYearViewComponent.prototype.eventClicked;
    /** @type {?} */
    AngularCalendarYearViewComponent.prototype.actionClicked;
    /** @type {?} */
    AngularCalendarYearViewComponent.prototype.dayClicked;
    /** @type {?} */
    AngularCalendarYearViewComponent.prototype.loader;
    /** @type {?} */
    AngularCalendarYearViewComponent.prototype.days;
    /** @type {?} */
    AngularCalendarYearViewComponent.prototype.dayindex;
    /** @type {?} */
    AngularCalendarYearViewComponent.prototype.daydetails;
    /** @type {?} */
    AngularCalendarYearViewComponent.prototype.year;
    /** @type {?} */
    AngularCalendarYearViewComponent.prototype.calendar;
    /** @type {?} */
    AngularCalendarYearViewComponent.prototype.spinner;
    /** @type {?} */
    AngularCalendarYearViewComponent.prototype.sanitizer;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci1jYWxlbmRhci15ZWFyLXZpZXcuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1jYWxlbmRhci15ZWFyLXZpZXcvIiwic291cmNlcyI6WyJsaWIvYW5ndWxhci1jYWxlbmRhci15ZWFyLXZpZXcuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFVLEtBQUssRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBQyxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDeEcsT0FBTyxLQUFLLFNBQVMsTUFBTSxrQkFBa0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7O01BQ25ELEtBQUssR0FBYyxDQUFDLG1CQUFLLFNBQVMsRUFBQSxDQUFDLENBQUMsT0FBTyxJQUFJLFNBQVM7QUFrRTlELE1BQU0sT0FBTyxnQ0FBZ0M7Ozs7SUF3QzNDLFlBQW1CLFNBQXNCO1FBQXRCLGNBQVMsR0FBVCxTQUFTLENBQWE7UUFoQ3pDLGVBQVUsR0FBSyxTQUFTLENBQUE7UUFFeEIsV0FBTSxHQUFHLEVBQUUsQ0FBQztRQUdaLGFBQVEsR0FBUyxJQUFJLElBQUksRUFBRSxDQUFDO1FBRzVCLHNCQUFpQixHQUFXLHlDQUF5QyxDQUFDO1FBR3RFLG1CQUFjLEdBQVksSUFBSSxDQUFDO1FBTS9CLGlCQUFZLEdBQUcsSUFBSSxZQUFZLEVBQU8sQ0FBQztRQUd2QyxrQkFBYSxHQUFHLElBQUksWUFBWSxFQUFPLENBQUM7UUFHeEMsZUFBVSxHQUFHLElBQUksWUFBWSxFQUFPLENBQUM7UUFFckMsV0FBTSxHQUFRLEtBQUssQ0FBQztRQUNwQixTQUFJLEdBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLElBQUksSUFBSSxDQUFDLElBQUksRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVB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LEtBQUssRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFBO0lBQ3pELENBQUM7OztZQTdPRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLDRCQUE0QjtnQkFDdEMsUUFBUSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTJEVDs7YUFFRjs7OztZQWxFUSxZQUFZOzs7b0JBb0VsQixXQUFXLFNBQUMsT0FBTzt5QkFNbkIsS0FBSztxQkFFTCxLQUFLO3VCQUdMLEtBQUs7Z0NBR0wsS0FBSzs2QkFHTCxLQUFLOzZCQUdMLEtBQUs7MkJBR0wsTUFBTTs0QkFHTixNQUFNO3lCQUdOLE1BQU07Ozs7SUF2QlAsc0RBQ3dCOztJQUN4QixrREFDWTs7SUFFWixvREFDNEI7O0lBRTVCLDZEQUNzRTs7SUFFdEUsMERBQytCOztJQUUvQiwwREFDZ0M7O0lBRWhDLHdEQUN1Qzs7SUFFdkMseURBQ3dDOztJQUV4QyxzREFDcUM7O0lBRXJDLGtEQUFvQjs7SUFDcEIsZ0RBQXVKOztJQUN2SixvREFBYzs7SUFDZCxzREFBcUI7O0lBQ3JCLGdEQUFxQzs7SUFDckMsb0RBQW1COztJQUNuQixtREFBb0I7O0lBQ1IscURBQTZCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBPbkluaXQsIElucHV0LCBPdXRwdXQsIEV2ZW50RW1pdHRlciwgSG9zdEJpbmRpbmcsVGVtcGxhdGVSZWYgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0ICogYXMgY2xvbmVEZWVwIGZyb20gXCJsb2Rhc2gvY2xvbmVEZWVwXCI7XG5pbXBvcnQgeyBEb21TYW5pdGl6ZXIgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcbmNvbnN0IGNsb25lOiBjbG9uZURlZXAgPSAoPGFueT5jbG9uZURlZXApLmRlZmF1bHQgfHwgY2xvbmVEZWVwXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2FuZ3VsYXItY2FsZW5kYXIteWVhci12aWV3JyxcbiAgdGVtcGxhdGU6IGBcbiAgPGRpdiBjbGFzcz1cImNhbGVuZGFyY29udGFpbmVyIGZsZXhtb250aHNcIj5cbiAgPGRpdiBjbGFzcz1cInJlc3BvbnNpdmVjb250YWluZXJcIiAqbmdGb3I9XCJsZXQgTW9udGggb2YgY2FsZW5kYXI7bGV0IG0gPWluZGV4XCI+XG4gICAgICA8ZGl2ICBjbGFzcz1cIm1vbnRoY29udGFpbmVyIFwiPlxuICAgICAgICA8cCBjbGFzcz1cIm1vbnRobmFtZVwiPnt7TW9udGguZGF0ZSB8IGRhdGU6J01NTU0nfX08L3A+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4ZGF5c1wiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXlcIiAqbmdGb3I9XCJsZXQgbGFiZWwgb2YgZGF5c1wiPlxuICAgICAgICAgICAge3tsYWJlbCB8IGRhdGU6J0VFRUVFRSd9fVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiAqbmdGb3I9XCJsZXQgd2VlayBvZiBNb250aC5kYXlzXCIgY2xhc3M9XCJmbGV4ZGF5c1wiPlxuICAgICAgICAgIDxkaXYgKm5nRm9yPVwibGV0IGRheSBvZiB3ZWVrO2xldCBpPWluZGV4XCIgW25nQ2xhc3NdPVwiZGF5PyggZGF5LmlzdG9kYXk/J3RvZGF5Y2xhc3MnOihkYXkubmI+MD8naGF2ZWV2ZW50cyc6JycpKTogICAndm9pZF9kYXknXCJcbiAgICAgICAgICAgIFtzdHlsZS5iYWNrZ3JvdW5kLWltYWdlXT1cImRheT8gKCdsaW5lYXItZ3JhZGllbnQoMTIwZGVnLCAnK2RheS5jb2xvcnMrJywjZmZmKScpOicnXCIgY2xhc3M9XCJkYXlcIiBcbiAgICAgICAgICAgIFtvdXRzaWRlQ2xpY2tdPVwidHJ1ZVwiXG4gICAgICAgICAgICBbcG9wb3Zlcl09XCJwb3BvdmVyRW5hYmxlZD8oY3VzdG9tVGVtcGxhdGU/Y3VzdG9tVGVtcGxhdGU6eWVhcmNhbGVuZGFycG9wdGVtcGxhdGUpOicnXCIgXG4gICAgICAgICAgICBwbGFjZW1lbnQ9XCJyaWdodFwiIFxuICAgICAgICAgICAgKG9uU2hvd24pPVwiZGF5aW5kZXg9aTtnZXRUb2RheUV2ZW50cyhkYXksbSlcIlxuICAgICAgICAgICAgKGNsaWNrKT1cImRheUNsaWNrZWRGbihkYXksbSlcIj5cbiAgICAgICAgICAgIHt7ZGF5Py5kYXl9fVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICA8L2Rpdj5cbjwvZGl2PlxuPGRpdiAqbmdJZj1cInNwaW5uZXJcIiBjbGFzcz1cImNhbGVuZGFyLWxvYWRpbmdcIj5cbiAgPHN2ZyBjbGFzcz1cInNwaW5uZXJcIiB2aWV3Qm94PVwiMjUgMjUgNTAgNTBcIj5cbiAgICA8Y2lyY2xlIGNsYXNzPVwicGF0aFwiIGN4PVwiNTBcIiBjeT1cIjUwXCIgcj1cIjIwXCIgZmlsbD1cIm5vbmVcIiBzdHJva2Utd2lkdGg9XCIyXCIgc3Ryb2tlLW1pdGVybGltaXQ9XCIxMFwiIC8+XG4gIDwvc3ZnPlxuPC9kaXY+XG48bmctdGVtcGxhdGUgI3llYXJjYWxlbmRhcnBvcHRlbXBsYXRlPlxuICA8ZGl2IGNsYXNzPVwiY29sLW1kLTEyIGNvbC1jYWxlbmRhclwiPlxuICAgIDxwIFtuZ0NsYXNzXT1cImRheWRldGFpbHMuaXN0b2RheT8ndG9kYXl0ZXh0JzonJ1wiIGNsYXNzPVwicG9wX3llYXJfZGF5XCI+e3tkYXlzW2RheWluZGV4XXwgZGF0ZTonRUVFRUVFJ319LjwvcD5cbiAgICA8cCBbbmdDbGFzc109XCJkYXlkZXRhaWxzLmlzdG9kYXk/J3RvZGF5dGV4dCc6JydcIiBjbGFzcz1cInBvcF95ZWFyX2RheV9udW1iZXJcIj57e2RheWRldGFpbHM/LmRheX19IDwvcD5cbiAgICA8ZGl2ICpuZ0lmPVwiIWxvYWRlclwiPlxuICAgICAgPGRpdiAqbmdGb3I9XCJsZXQgZXZlbnQgb2YgZGF5ZGV0YWlscy5ldmVudHNcIj5cbiAgICAgICAgICA8YSAgIFtzdHlsZS5jb2xvcl09XCJldmVudC5jb2xvci5wcmltYXJ5KychaW1wb3J0YW50cydcIiBcbiAgICAgICAgICAgICAgIGNsYXNzPVwiaWNvbi1hY3Rpb24tY2FsZW5kYXJcIiBcbiAgICAgICAgICAgICAgICpuZ0Zvcj0nbGV0IGFjdGlvbiBvZiBldmVudC5hY3Rpb25zJyBcbiAgICAgICAgICAgICAgICBbaW5uZXJIVE1MXT0nYWN0aW9uLmxhYmVsJyBcbiAgICAgICAgICAgICAgICAoY2xpY2spPVwiYWN0aW9uQ2xpY2tlZEZuKGFjdGlvbi5uYW1lLGV2ZW50KVwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgXG4gICAgICAgICAgPC9hPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2lyY2xlX2RheV9jb2xvclwiIFtzdHlsZS5iYWNrZ3JvdW5kXT1cImV2ZW50LmNvbG9yLnNlY29uZGFyeVwiIFtzdHlsZS5ib3JkZXItY29sb3JdPVwiZXZlbnQuY29sb3IucHJpbWFyeVwiPjwvZGl2PlxuICAgICAgICA8cCBjbGFzcz1cInBvcF95ZWFyX2V2ZW50X3RpdGxlXCIgKGNsaWNrKT1cImV2ZW50Q2xpY2tlZEZuKGV2ZW50KVwiPlxuICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAge3tldmVudC5zdGFydHwgZGF0ZTonSEg6bW0nfX1cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAge3tldmVudC50aXRsZX19XG4gICAgICAgIDwvcD5cbiAgICAgICAgXG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwicHJvZ3Jlc3NiYXJfcG9weWVhclwiICpuZ0lmPVwiIWRheWRldGFpbHMuZXZlbnRzfHwoZGF5ZGV0YWlscy5ldmVudHMubGVuZ3RoPT0wKSYmIWxvYWRlclwiPlxuICAgICB7e25vdGhpbmdUb3Nob3dUZXh0fX0gXG4gICAgPC9kaXY+XG4gICAgPGRpdiBbaGlkZGVuXT1cIiFsb2FkZXJcIiBjbGFzcz1cImxvYWRlcl9wb3BvdmVyX2NhbGVuZGFyXCI+PC9kaXY+XG4gIDwvZGl2PlxuPC9uZy10ZW1wbGF0ZT5cbiAgYCxcbiAgc3R5bGVVcmxzOiBbJy4vYW5ndWxhci1jYWxlbmRhci15ZWFyLXZpZXcuc2NzcyddXG59KVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJDYWxlbmRhclllYXJWaWV3Q29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgQEhvc3RCaW5kaW5nKCdzdHlsZScpXG4gIGdldCBzdHlsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5zYW5pdGl6ZXIuYnlwYXNzU2VjdXJpdHlUcnVzdFN0eWxlKFxuICAgICAgYC0tdGhlbWVjb2xvcjogJHt0aGlzLnRoZW1lY29sb3J9O2BcbiAgICApO1xuICB9XG4gIEBJbnB1dCgpXG4gIHRoZW1lY29sb3I6YW55PScjZmYwMDAwJ1xuICBASW5wdXQoKVxuICBldmVudHMgPSBbXTtcblxuICBASW5wdXQoKVxuICB2aWV3RGF0ZTogRGF0ZSA9IG5ldyBEYXRlKCk7XG4gIFxuICBASW5wdXQoKVxuICBub3RoaW5nVG9zaG93VGV4dDogc3RyaW5nID0gXCJUaGVyZSBhcmUgbm8gZXZlbnRzIHNjaGVkdWxlZCB0aGF0IGRheS5cIjtcblxuICBASW5wdXQoKVxuICBwb3BvdmVyRW5hYmxlZDogYm9vbGVhbiA9IHRydWU7XG5cbiAgQElucHV0KClcbiAgY3VzdG9tVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT4gXG4gIFxuICBAT3V0cHV0KClcbiAgZXZlbnRDbGlja2VkID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gIFxuICBAT3V0cHV0KClcbiAgYWN0aW9uQ2xpY2tlZCA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuXG4gIEBPdXRwdXQoKVxuICBkYXlDbGlja2VkID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG5cbiAgbG9hZGVyOiBhbnkgPSBmYWxzZTtcbiAgZGF5czogYW55ID0gW25ldyBEYXRlKDIwMTksMSwzKSxuZXcgRGF0ZSgyMDE5LDEsNCksbmV3IERhdGUoMjAxOSwxLDUpLCBuZXcgRGF0ZSgyMDE5LDEsNiksIG5ldyBEYXRlKDIwMTksMSw3KSwgbmV3IERhdGUoMjAxOSwxLDgpLCBuZXcgRGF0ZSgyMDE5LDEsOSldO1xuICBkYXlpbmRleDogYW55O1xuICBkYXlkZXRhaWxzOiBhbnkgPSB7fTtcbiAgeWVhcjogYW55ID0gbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpO1xuICBjYWxlbmRhcjogYW55ID0gW107XG4gIHNwaW5uZXI6IGFueSA9IHRydWU7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzYW5pdGl6ZXI6RG9tU2FuaXRpemVyLFxuXG4gICkgeyB9XG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMuaW5pdENhbGVuZGFyKHRoaXMudmlld0RhdGUpO1xuICB9XG4gIG5nT25DaGFuZ2VzKCkgeyAgICBcbiAgICB0aGlzLmluaXRDYWxlbmRhcih0aGlzLnZpZXdEYXRlKTtcbiAgfVxuICBpbml0Q2FsZW5kYXIoZGF0ZSkge1xuICAgIHRoaXMueWVhciA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgICB0aGlzLmNhbGVuZGFyID0gW107XG4gICAgdGhpcy5zcGlubmVyID0gdHJ1ZTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgMTI7IGluZGV4KyspIHtcbiAgICAgIHRoaXMuY2FsZW5kYXIucHVzaCh7XG4gICAgICAgIGRhdGU6IG5ldyBEYXRlKHRoaXMueWVhciwgaW5kZXggKyAxLCAwKSxcbiAgICAgICAgZGF5czogdGhpcy5nZW5lcmF0ZUNhbGVuZGFyKGluZGV4ICsgMSwgdGhpcy55ZWFyKVxuICAgICAgfSk7XG4gICAgfVxuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNlbGYuc3Bpbm5lciA9IGZhbHNlO1xuICAgIH0sIDIwMDApO1xuICB9XG4gIGdlbmVyYXRlQ2FsZW5kYXIobW9udGgsIHllYXIpIHtcbiAgICBsZXQgbW9udGhMaXN0ID0gW107XG4gICAgbGV0IG5id2Vla3MgPSB0aGlzLmdldE5iV2Vla3MobW9udGgsIHllYXIpO1xuICAgIGxldCBkYXlvbmUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCAtIDEsIDEpLmdldERheSgpO1xuICAgIGxldCBuYmRheXNNb250aCA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCAwKS5nZXREYXRlKCk7XG4gICAgbGV0IGxhc3RkYXlpbmRleCA9IG5ldyBEYXRlKHllYXIsIG1vbnRoIC0gMSwgbmJkYXlzTW9udGgpLmdldERheSgpO1xuICAgIGxldCBsYXN0ZGF5ID0gNztcbiAgICBsZXQgZGF5ID0gMTtcbiAgICBsZXQgdG9kYXkgPSBuZXcgRGF0ZSgpLnRvRGF0ZVN0cmluZygpO1xuXG4gICAgZm9yIChsZXQgaW5kZXh3ZWVrID0gMDsgaW5kZXh3ZWVrIDwgbmJ3ZWVrczsgaW5kZXh3ZWVrKyspIHtcbiAgICAgIG1vbnRoTGlzdFtpbmRleHdlZWtdID0gW107XG4gICAgICBpZiAobmJ3ZWVrcyA9PSBpbmRleHdlZWsgKyAxKSB7XG4gICAgICAgIGxhc3RkYXkgPSBsYXN0ZGF5aW5kZXggKyAxO1xuICAgICAgfVxuICAgICAgaWYgKGluZGV4d2VlayA+IDApIHtcbiAgICAgICAgZGF5b25lID0gMDtcbiAgICAgIH1cbiAgICAgIGZvciAobGV0IGluZGV4ZGF5ID0gZGF5b25lOyBpbmRleGRheSA8IGxhc3RkYXk7IGluZGV4ZGF5KyspIHtcbiAgICAgICAgbGV0IGQxID0gbmV3IERhdGUoeWVhciwgbW9udGggLSAxLCBkYXkpLnRvRGF0ZVN0cmluZygpO1xuICAgICAgICBsZXQgaXN0b2RheSA9IGQxID09IHRvZGF5O1xuICAgICAgICBsZXQgY29sb3JzRXZlbnRzID0gdGhpcy5nZXRuYmV2ZW50cyhkYXksIG1vbnRoIC0gMSlcbiAgICAgICAgbW9udGhMaXN0W2luZGV4d2Vla11baW5kZXhkYXldID0ge1xuICAgICAgICAgIGRheTogZGF5LFxuICAgICAgICAgIGlzdG9kYXk6IGlzdG9kYXksXG4gICAgICAgICAgY29sb3JzOiBjb2xvcnNFdmVudHMuY29sb3IsXG4gICAgICAgICAgZXZlbnRzOiBbXSxcbiAgICAgICAgICBuYjogY29sb3JzRXZlbnRzLm5iXG4gICAgICAgIH07XG4gICAgICAgIGRheSsrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtb250aExpc3Q7XG4gIH1cbiAgZ2V0TmJXZWVrcyhtb250aCwgeWVhcikge1xuICAgIGxldCBkYXlvbmUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCAtIDEsIDEpLmdldERheSgpO1xuICAgIGxldCBuYmRheXNNb250aCA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCAwKS5nZXREYXRlKCk7XG4gICAgbGV0IGxhc3RkYXkgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCAtIDEsIG5iZGF5c01vbnRoKS5nZXREYXkoKTtcbiAgICByZXR1cm4gKG5iZGF5c01vbnRoICsgZGF5b25lICsgKDYgLSBsYXN0ZGF5KSkgLyA3O1xuICB9XG4gIGRheUNsaWNrZWRGbihkYXksIG1vbnRoKXtcbiAgIGxldCBkYXRlID0gIG5ldyBEYXRlKHRoaXMueWVhciwgbW9udGgsIGRheS5kYXkpXG4gICB0aGlzLmRheWRldGFpbHMgPSB7ZXZlbnRzOltdfVxuXG4gICBpZiAodGhpcy5ldmVudHMubGVuZ3RoID4gMCkge1xuICAgICB0aGlzLmxvYWRlciA9IHRydWU7XG4gICAgIHRoaXMuZGF5ZGV0YWlscyA9IGNsb25lKGRheSk7XG4gICAgIGxldCBkMSA9IG5ldyBEYXRlKHRoaXMueWVhciwgbW9udGgsIGRheS5kYXkpLnRvRGF0ZVN0cmluZygpO1xuICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5ldmVudHMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuZXZlbnRzW2luZGV4XTtcbiAgICAgICBsZXQgZDIgPSBlbGVtZW50LnN0YXJ0LnRvRGF0ZVN0cmluZygpO1xuICAgICAgIGlmIChkMiA9PSBkMSkge1xuICAgICAgICAgdGhpcy5kYXlkZXRhaWxzLmV2ZW50cy5wdXNoKGVsZW1lbnQpO1xuICAgICAgIH1cbiAgICAgfVxuICAgfVxuICAgdGhpcy5kYXlDbGlja2VkLmVtaXQoe2RhdGU6ZGF0ZSxldmVudHM6dGhpcy5kYXlkZXRhaWxzLmV2ZW50c30pXG4gIH1cbiAgZ2V0VG9kYXlFdmVudHMoZGF5LCBtb250aCkge1xuICAgIHRoaXMuZGF5ZGV0YWlscyA9IHt9XG5cbiAgICBpZiAodGhpcy5ldmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5sb2FkZXIgPSB0cnVlO1xuICAgICAgdGhpcy5kYXlkZXRhaWxzID0gY2xvbmUoZGF5KTtcbiAgICAgIGxldCBkMSA9IG5ldyBEYXRlKHRoaXMueWVhciwgbW9udGgsIGRheS5kYXkpLnRvRGF0ZVN0cmluZygpO1xuXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5ldmVudHMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmV2ZW50c1tpbmRleF07XG4gICAgICAgIGxldCBkMiA9IGVsZW1lbnQuc3RhcnQudG9EYXRlU3RyaW5nKCk7XG4gICAgICAgIGlmIChkMiA9PSBkMSkge1xuICAgICAgICAgIHRoaXMuZGF5ZGV0YWlscy5ldmVudHMucHVzaChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5kZXggPT0gdGhpcy5ldmVudHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHNlbGYubG9hZGVyID0gZmFsc2U7XG4gICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIH1cblxuICAgICAgfVxuICAgIH1cbiAgfVxuICBnZXRuYmV2ZW50cyhkYXksIG1vbnRoKSB7XG4gICAgbGV0IG5iID0gMDtcbiAgICBsZXQgY29sb3JzID0gW11cbiAgICBpZiAodGhpcy5ldmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgbGV0IGQxID0gbmV3IERhdGUodGhpcy55ZWFyLCBtb250aCwgZGF5KS50b0RhdGVTdHJpbmcoKTtcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmV2ZW50cy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuZXZlbnRzW2luZGV4XTtcbiAgICAgICAgbGV0IGQyID0gZWxlbWVudC5zdGFydC50b0RhdGVTdHJpbmcoKTtcbiAgICAgICAgaWYgKGQyID09IGQxKSB7XG4gICAgICAgICAgbmIrKztcbiAgICAgICAgICBjb2xvcnMucHVzaChlbGVtZW50LmNvbG9yLnNlY29uZGFyeSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuICh7IG5iOiBuYiwgY29sb3I6IGNvbG9ycy50b1N0cmluZygpIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7IGNvbG9yOiBcIlwiLCBuYjogMCB9XG4gICAgfVxuICB9XG4gIGV2ZW50Q2xpY2tlZEZuKGV2ZW50KSB7XG4gICAgdGhpcy5ldmVudENsaWNrZWQuZW1pdChldmVudCk7XG4gIH1cbiAgcmVmcmVzaChkYXRlKSB7XG4gICAgdGhpcy5pbml0Q2FsZW5kYXIoZGF0ZSk7XG4gIH1cbiAgYWN0aW9uQ2xpY2tlZEZuKGFjdGlvbixldmVudD8pe1xuICAgICAgIHRoaXMuYWN0aW9uQ2xpY2tlZC5lbWl0KHthY3Rpb246YWN0aW9uLGV2ZW50OmV2ZW50fSlcbiAgfVxuXG59XG4iXX0=