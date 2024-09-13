import { Component, OnInit, Input, Output, EventEmitter, HostBinding } from "@angular/core";
import * as cloneDeep from "lodash/cloneDeep";
import { DomSanitizer } from '@angular/platform-browser';
const clone: cloneDeep = (<any>cloneDeep).default || cloneDeep
@Component({
  selector: 'angular-calendar-year-view',
  templateUrl: './angular-calendar-year-view.component.html',
  styleUrls: ['./angular-calendar-year-view.component.scss']
})
export class AngularCalendarYearViewComponent implements OnInit
{
  @HostBinding('style')
  get style()
  {
    return this.sanitizer.bypassSecurityTrustStyle(
      `--themecolor: ${this.themecolor};`
    );
  }
  @Input()
  themecolor: any = '#ff0000'
  @Input() events = [];

  @Input()
  viewDate: Date = new Date();

  @Input() view: any;

  @Input() currentTerm: any;

  @Output()
  eventClicked = new EventEmitter<any>();

  @Output()
  actionClicked = new EventEmitter<any>();

  @Output()
  openDialogg = new EventEmitter<any>();

  loader: any = false;
  days: any = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  dayindex: any;
  daydetails: any = {};
  year: any = new Date().getFullYear();
  calendar: any = [];
  termCalendar: any = [];
  spinner: any = true;
  eventsOngoing: any = [];
  color: any;
  nb: any;
  endDate: any;
  multipleEvent: boolean = false;
  prevColor: any = [];
  prevEvent: any = [];
  prevEnd: any = [];
  type: any;
  termCurrent: any;
  nonTermCurrent: any = "";
  termEventgoing = false;
  nonTermEventgoing = false;
  classs = 'hasEvents';
  termEnded=false;
  startedEvents: any[] = [];
  onGoingEvent: any = '';
  onGoingEventBank: any = '';
  onGoingEventNES: any = '';
  startedEventsBank: any[] = [];

  constructor(public sanitizer: DomSanitizer
  ) { }

  ngOnInit()
  {
    if (this.currentTerm && this.view == 'term')
    {
      this.events ? this.inittermCalendar(this.viewDate) : '';
    }
    else 
    {
      this.events ? this.initCalendar(this.viewDate) : '';
    }
  }

  ngOnChanges()
  {
      // Setting all bankholidays at end of array.
      // if (this.events) {
      //   let tempEvents = [];
      //   tempEvents = this.events.filter(e => e.type != 'bankHolidays');
      //   tempEvents = [...tempEvents, ...this.events.filter(e => e.type == 'bankHolidays')]
      //   console.log(tempEvents);
      //   this.events = tempEvents;
      // }
      // End
    if (this.currentTerm && this.view == 'term')
    {
      this.events ? this.inittermCalendar(this.viewDate) : '';
    }
    else 
    {
      this.events ? this.initCalendar(this.viewDate) : '';
    }
  }

  initCalendar(date)
  {
    console.log(date);
    
    this.year = date.getFullYear();
    this.calendar = [];
    this.spinner = true;

    let firstYear = date.getFullYear();
    let secondYear = date.getFullYear() + 1;

    // Loop for Sep to Dec (first year)
    for (let index = 8; index < 12; index++)
    {
      this.calendar.push({
        date: new Date(firstYear, index + 1, 0),
        days: this.generateCalendar(index + 1, firstYear)
      });
    }

    // Loop for Jan to Aug (second year)
    for (let index = 0; index < 8; index++)
    {
      this.calendar.push({
        date: new Date(secondYear, index + 1, 0),
        days: this.generateCalendar(index + 1, secondYear)
      });
    }

    console.log(this.calendar);
    
    let self = this;
    setTimeout(() =>
    {
      self.spinner = false;
    }, 2000);
  }

  //mazhar code
  inittermCalendar(date)
  {
    this.year = date.getFullYear();
    let month = date.getMonth() + 1;
    console.log(this.currentTerm);
    
    let startDate = this.currentTerm.startDate.getMonth() + 1;
    let endDate = this.currentTerm.endDate.getMonth() + 1;
    let year = this.currentTerm.startDate.getFullYear();
    // if (month >= startDate && month <= endDate)
    // {
    this.termCalendar = [];
    for (let index = startDate; index <= endDate; index++)
    {
      this.termCalendar.push({
        date: new Date(year, index, 0),
        days: this.generateCalendar(index, year)
      });
    }
    console.log(this.termCalendar);
    //mazhar code

    this.spinner = true;
    let self = this;
    setTimeout(() =>
    {
      self.spinner = false;
    }, 2000);
  }

  generateCalendar(month, year)
  {
    this.termEnded=false;
    let monthList = [];
    let nbweeks = this.getNbWeeks(month, year);
    let dayone = new Date(year, month - 1, 1).getDay() - 1;
    let nbdaysMonth = new Date(year, month, 0).getDate();
    let lastdayindex = new Date(year, month - 1, nbdaysMonth).getDay() - 1;
    let lastday = 7;
    let day = 1;
    let today = new Date().toDateString();
    for (let indexweek = 0; indexweek < nbweeks; indexweek++)
    {
      if( this.termEnded)
      {
        break;
      }
      monthList[indexweek] = [];
      if (nbweeks == indexweek + 1)
      {
        lastday = lastdayindex + 1;
      }
      if (indexweek > 0)
      {
        dayone = 0;
      }
      for (let indexday = dayone; indexday < lastday; indexday++)
      {
        this.classs = "hasEvents"
        let d1 = new Date(year, month - 1, day).toDateString();
        let istoday = d1 == today;
        let events = [];

        // Setting Holiday Priorities and mapping to each day with the required Class

				let tempHolidays = [];
				let nesHolidays = [];
        let termHolidays = [];
				tempHolidays = this.events.filter(e => e.type == 'bankHolidays');
        nesHolidays = this.events.filter(e => e.type == 'notEligibleForStretching');
        termHolidays = this.events.filter(e => e.type == 'endTermHolidays' || e.type == 'midTermHolidays');

        let finalBank = [];
        let finalNes = [];
        let finalTermHolidays = [];
        let finalEvents = [];

        tempHolidays.forEach((e)=> {
          let obj;
          // Check if Single
           if (e.startDate.toDateString() == d1 && e.startDate.getTime() == e.endDate.getTime()) {
              obj = {class: 'radiusComplete', event: e};
           }
          // Check if Start
          else if (e.startDate.toDateString() == d1 && e.endDate.toDateString() != d1) {
            obj = {class: 'radiusStart', event: e};
          }
          // Check if End
          else if (e.startDate.toDateString() != d1 && e.endDate.toDateString() == d1) {
            obj = {class: 'radiusEnd', event: e};
          }
          // Check if OnGoing
          else if (e.startDate < new Date(year, month - 1, day) && e.endDate > new Date(year, month - 1, day)) {
            obj = {class: 'hasEvents', event: e};
          }

          if (obj) {
            finalBank.push(obj);
          }
        })

        nesHolidays.forEach((e)=> {
          let obj;
            // Check if Single
            if (e.startDate.toDateString() == d1 && e.startDate.getTime() == e.endDate.getTime()) {
              obj = {class: 'radiusComplete', event: e};
            }
          // Check if Start
          else if (e.startDate.toDateString() == d1 && e.endDate.toDateString() != d1) {
            obj = {class: 'radiusStart', event: e};
          }
          // Check if End
          else if (e.startDate.toDateString() != d1 && e.endDate.toDateString() == d1) {
            obj = {class: 'radiusEnd', event: e};
          }
          // Check if OnGoing
          else if (e.startDate < new Date(year, month - 1, day) && e.endDate > new Date(year, month - 1, day)) {
            obj = {class: 'hasEvents', event: e};
          }

          if (obj) {
            finalNes.push(obj);
          }
        })

        termHolidays.forEach((e)=> {
          let obj;
            // Check if Single
            if (e.startDate.toDateString() == d1 && e.startDate.getTime() == e.endDate.getTime()) {
              obj = {class: 'radiusComplete', event: e};
            }
          // Check if Start
          else if (e.startDate.toDateString() == d1 && e.endDate.toDateString() != d1) {
            obj = {class: 'radiusStart', event: e};
          }
          // Check if End
          else if (e.startDate.toDateString() != d1 && e.endDate.toDateString() == d1) {
            obj = {class: 'radiusEnd', event: e};
          }
          // Check if OnGoing
          else if (e.startDate < new Date(year, month - 1, day) && e.endDate > new Date(year, month - 1, day)) {
            obj = {class: 'hasEvents', event: e};
          }

          if (obj) {
            finalTermHolidays.push(obj);
          }
        })

        
				finalEvents = [...finalBank, ...finalTermHolidays, ...finalNes];

        // End

        //             ===> Loop For Terms <=====
        let eventColor = this.termEvents(day, month - 1 ,year, 0, 3)
        
        if (istoday)
        {
          this.classs = 'todayclass'
        }
        else
        {
          this.classs = eventColor.class
        }
        if (eventColor.event != "")
        {
          events.push(eventColor.event)
        }
        //             ===> Loop For events <=====

        // eventColor = this.nonTermEvents(day, month - 1, 3, this.events.length)
        eventColor = finalEvents.length != 0 ? finalEvents[0]: {event: '', class: 'hasEvents'};

        //if term and day is endDate of term stop the loop
        
        if (istoday)
        {
          this.classs = 'todayclass'
        }
        else
        {
          this.classs = eventColor.class
        }
        if (eventColor.event != "")
        {

          events.push(eventColor.event)
        }

        monthList[indexweek][indexday] = {
          day: day,
          istoday: istoday,
          colors: "",
          events: events,
          class: this.classs,
          indexDay:indexday

        };
        if (this.view === 'term' && d1 == this.currentTerm?.endDate.toDateString())
        {
          this.termEnded=true;
          break;
        }
        day++;
      }
    }
    // console.log('==========>', monthList)
    return monthList;
  }

  getNbWeeks(month, year)
  {
    let dayone = new Date(year, month - 1, 1).getDay() - 1;
    let nbdaysMonth = new Date(year, month, 0).getDate();
    let lastday = new Date(year, month - 1, nbdaysMonth).getDay() - 1;
    return (nbdaysMonth + dayone + (6 - lastday)) / 7;
  }

  termEvents(day, month, year, start, end)
  {

    let eventToSend = "";
    if (this.events.length > start)
    {
      let d1 = new Date(year, month, day).toDateString();
      for (let index = start; index < end; index++)
      {
        const element = this.events[index];

        if (!element) return { class: this.classs, event: eventToSend };

        let startDate = element.startDate;
        if (startDate.toDateString() == d1)
        {
          this.termEventgoing = true;
          this.classs = "radiusStart"
          this.endDate = element.endDate;
          this.termCurrent = element;

          if (element.endDate.getTime() == element.startDate.getTime())
          {
            this.classs = "radiusComplete";
            this.termCurrent = element
            this.termEventgoing = false;
          }
          eventToSend = this.termCurrent;
        }

        else if (d1 == element.endDate?.toDateString())
        {
          eventToSend = element;
          this.termCurrent = "";
          this.classs = "radiusEnd"
          this.termEventgoing = false;
        }
        else
        {
          if (!this.termEventgoing)
          {
            this.termCurrent = ''
          }
          else 
          {
            eventToSend = this.termCurrent;
          }
        }
      }
      return ({ class: this.classs, event: eventToSend })
    }
    else
    {
      return { class: this.classs, event: eventToSend }
    }

  }

  nonTermEvents(day, month, start, end)
  {    
    let eventToSend = "";
    // debugger;
    if (this.events.length > start)
    {
      let d1 = new Date(this.year, month, day).toDateString();

      //------ My Block
      let current = '';
      eventToSend = this.nonTermCurrent;

      //------------------- NEW START -------------------//


      let singleEventBank = this.events.find( ev => ev.type == 'bankHolidays' && ev.startDate.getTime() == ev.endDate.getTime() && ev.startDate.toDateString() == d1);
      let singleEventNonBank = this.events.find( ev => (ev.type != 'bankHolidays' && ev.type != 'notEligibleForStretching') && ev.startDate.getTime() == ev.endDate.getTime() && ev.startDate.toDateString() == d1);

      let startedEventBank = this.events.find( ev => ev.type == 'bankHolidays' && d1 == ev.startDate.toDateString());
      let startedEventNonBank = this.events.find( ev => (ev.type != 'bankHolidays' && ev.type != 'notEligibleForStretching') && d1 == ev.startDate.toDateString());

      let endEventBank = this.events.find( ev => ev.type == 'bankHolidays' && d1 == ev.endDate.toDateString());
      let endEventNonBank = this.events.find( ev => (ev.type != 'bankHolidays' && ev.type != 'notEligibleForStretching') && d1 == ev.endDate.toDateString());
      
      this.events.forEach((el) => {
        if((el.type == 'endTermHolidays' || el.type == 'midTermHolidays' || el.type == 'notEligibleForStretching') && d1 == el.startDate.toDateString()) {
          this.startedEvents.push(el);
        }
      })

      //---- Check if they are discontinued --- //
      if (endEventBank) {
        this.onGoingEventBank = '';
      }

      if (startedEventNonBank) {
        this.onGoingEvent = startedEventNonBank;
      }

      if (endEventNonBank) {
        this.startedEvents.splice(this.startedEvents.indexOf(endEventNonBank), 1);
        this.onGoingEvent = this.startedEvents.length != 0 ? this.startedEvents[0] : '';
        // this.onGoingEvent = '';
      }

      // ---- End ----//


      if (singleEventBank) {
        // if (endEventNonBank) {
        //   this.onGoingEvent = '';
        // }

        if (startedEventNonBank) {
          this.onGoingEvent = startedEventNonBank;
        }
        return ({ class: 'radiusComplete', event: singleEventBank });
      }

      if (singleEventNonBank && (!startedEventBank && !endEventBank && !this.onGoingEventBank)) {
        this.onGoingEvent = '';
        return ({ class: 'radiusComplete', event: singleEventNonBank });
      }

      if (startedEventBank) {
        this.onGoingEventBank = startedEventBank;
        return ({ class: 'radiusStart', event: startedEventBank });
      }

      if (startedEventNonBank && (!startedEventBank && !endEventBank && !this.onGoingEventBank)) {
        this.onGoingEvent = startedEventNonBank;
        return ({ class: 'radiusStart', event: startedEventNonBank });
      }

      if (startedEventNonBank && endEventBank) {
        this.onGoingEvent = startedEventNonBank;
      }

      if (endEventBank && endEventNonBank) {
        this.onGoingEvent = '';
      }

      if (endEventBank) {
        this.onGoingEventBank = '';
        return ({ class: 'radiusEnd', event: endEventBank });
      }

      if (endEventNonBank && (!startedEventBank && !endEventBank && !this.onGoingEventBank)) {
        this.startedEvents.splice(this.startedEvents.indexOf(endEventNonBank), 1);
        this.onGoingEvent = this.startedEvents.length != 0 ? this.startedEvents[0] : '';
        // this.onGoingEvent = '';
        return ({ class: 'radiusEnd', event: endEventNonBank });
      }

      let toSend = this.onGoingEventBank || this.onGoingEvent || ''; 

      return ({ class: 'hasEvents', event: toSend })

      

      //------------------- NEW END -------------------//

    }
    else
    {
      return { class: this.classs, event: this.onGoingEvent }
    }
  }

  getBackground(day)
  {
    
    let color = "#fffff"
    if (day?.events.length == 0)
    {
      return '#fffff'
    }
    else
    {
      //  alert("yes i got event"+day?.day)
      day?.events.forEach(element =>
      {

        // color = element?.color.primary;
        if (day.indexDay != 5 && day.indexDay != 6) {
          color = element?.color?.primary
        } else {
          // color = 'rgba(225, 209, 217, 0.45)';
          color = 'rgba(226, 222, 224, 0.8)';
        }
      });
      return color;
    }
  }

  eventClickedFn(event)
  {
    this.eventClicked.emit(event);
  }

  refresh(date)
  {
    this.initCalendar(date);
  }

  openDialog(day, month)
  {
    let m =  month.date.getMonth();
    let year = month.date.getFullYear();
    console.log(year);
    
    let d1 = new Date(year, m, day.day);
    
    // this.getTodayEvents(day, m)
    if (day.events.length > 0)
    {
      let eventTosend :any;
      eventTosend = { type:"add", date:d1 };
      day.events.forEach(event =>
      {
        if (event.type != "term")
        {
          eventTosend = {event:event};
        }
      });
      console.log(day.events);
      this.openDialogg.emit(eventTosend);
    }
    else 
    {
      this.openDialogg.emit({ type:"add", date:d1 });
    }
  }
  
  actionClickedFn(action, event?)
  {
    this.actionClicked.emit({ action: action, event: event })
  }

  dayCheck(day)
  {
    // console.log("day is ", day?.colors)
    return true;
  }
}
 // getTodayEvents(day, month)
  // {
  //   // console.log(day, month, "i am in events")
  //   this.daydetails = {}

  //   if (this.events.length > 0)
  //   {
  //     this.loader = true;
  //     this.daydetails = clone(day);
  //     let d1 = new Date(this.year, month, day.day).toDateString();

  //     for (let index = 0; index < this.events.length; index++)
  //     {
  //       const element = this.events[index];
  //       let d2 = element.startDate.toDateString();
  //       if (d2 == d1)
  //       {
  //         this.daydetails.events.push(element);
  //       }
  //       if (index == this.events.length - 1)
  //       {
  //         let self = this;
  //         setTimeout(() =>
  //         {
  //           self.loader = false;
  //         }, 1000);
  //       }

  //     }
  //   }
  // }
 // getBackground(day)
  // {
  //   if (startDate.toDateString() == d1)
  //   {
  //     console.log("matched for day",day,startDate)
  //     if (element.endDate.getTime() == element.startDate.getTime())
  //     {
  //       this.classs = "radiusComplete";
  //       this.eventgoing = false;
  //       this.currentEvent = element
  //       if(this.prevColor.length!=0)
  //       {
  //         this.color = this.prevColor.pop();
  //         this.endDate = this.prevEnd.pop();
  //       }
  //       else
  //       {
  //         this.color = element.color.primary
  //         this.endDate=null;
  //       }
  //       colors = this.color
  //       if(element.type!=='term')
  //         {
  //           // alert("yes breaking")
  //           break;
  //         }

  //       // break;
  //     }
  //   let color="#fffff"
  //   if(day?.events.length==0)
  //   {
  //     return '#fffff'
  //   }
  //  else 
  //  {
  //   //  alert("yes i got event"+day?.day)
  //    day?.events.forEach(element => {
  //      color=element?.color.primary
  //    });
  //    return color;
  //  }
  // }