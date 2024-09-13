import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
} from '@angular/core';
import { MonthViewDay, CalendarEvent } from 'calendar-utils';
import { isWithinThreshold, trackByEventId } from '../common/util';
import { PlacementArray } from 'positioning';

@Component({
  selector: 'mwl-calendar-month-cell',
  templateUrl: './calender-month-cell.component.html',
  host: {
    class: 'cal-cell cal-day-cell',
    '[class.cal-past]': 'day.isPast',
    '[class.cal-today]': 'day.isToday',
    '[class.cal-future]': 'day.isFuture',
    '[class.cal-weekend]': 'day.isWeekend',
    '[class.cal-in-month]': 'day.inMonth',
    '[class.cal-out-month]': '!day.inMonth',
    '[class.cal-has-events]': 'day.events.length > 0',
    '[class.cal-open]': 'day === openDay',
    '[class.cal-event-highlight]': '!!day.backgroundColor',
  },
})
export class CalendarMonthCellComponent {
  @Input() day: MonthViewDay;

  @Input() openDay: MonthViewDay;

  @Input() locale: string;

  @Input() tooltipPlacement: PlacementArray;

  @Input() tooltipAppendToBody: boolean;

  @Input() customTemplate: TemplateRef<any>;

  @Input() tooltipTemplate: TemplateRef<any>;

  @Input() tooltipDelay: number | null;

  @Output() highlightDay: EventEmitter<any> = new EventEmitter();

  @Output() unhighlightDay: EventEmitter<any> = new EventEmitter();

  @Output() eventClicked = new EventEmitter<{
    event: CalendarEvent;
    sourceEvent: MouseEvent;
  }>();
  seeElement(eventx,day)
  { 
    if(day.events.length!==0)
    {
      this.highlightDay.emit({ event: eventx })
      // console.log(day)
    }
   
  }
  trackByEventId = trackByEventId;

  validateDrag = isWithinThreshold;
}
