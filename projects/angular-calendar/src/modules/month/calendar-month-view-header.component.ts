import {
  Component,
  Input,
  TemplateRef,
  EventEmitter,
  Output,
} from '@angular/core';
import { WeekDay } from 'calendar-utils';
import { trackByWeekDayHeaderDate } from '../common/util';

@Component({
  selector: 'mwl-calendar-month-view-header',
  templateUrl: './calender-month-view-header.component.html',
})
export class CalendarMonthViewHeaderComponent {
  @Input() days: WeekDay[];

  @Input() locale: string;

  @Input() customTemplate: TemplateRef<any>;

  @Output() columnHeaderClicked = new EventEmitter<{
    isoDayNumber: number;
    sourceEvent: MouseEvent;
  }>();

  trackByWeekDayHeaderDate = trackByWeekDayHeaderDate;
}
