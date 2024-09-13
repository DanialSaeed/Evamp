import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
} from '@angular/core';
import { CalendarEvent, WeekDay } from 'calendar-utils';
import { trackByWeekDayHeaderDate } from '../common/util';

@Component({
  selector: 'mwl-calendar-week-view-header',
  templateUrl: './calendar-week-view-header.component.html',
})
export class CalendarWeekViewHeaderComponent {
  @Input() days: WeekDay[];

  @Input() locale: string;

  @Input() customTemplate: TemplateRef<any>;

  @Output() dayHeaderClicked = new EventEmitter<{
    day: WeekDay;
    sourceEvent: MouseEvent;
  }>();

  @Output() eventDropped = new EventEmitter<{
    event: CalendarEvent;
    newStart: Date;
  }>();

  @Output() dragEnter = new EventEmitter<{ date: Date }>();

  trackByWeekDayHeaderDate = trackByWeekDayHeaderDate;
}
