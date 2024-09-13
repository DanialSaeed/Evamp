import { Component, Input, TemplateRef } from '@angular/core';
import { WeekViewHourSegment } from 'calendar-utils';

@Component({
  selector: 'mwl-calendar-week-view-hour-segment',
  templateUrl: './calendar-week-view-hour-segment.component.html',
})
export class CalendarWeekViewHourSegmentComponent {
  @Input() segment: WeekViewHourSegment;

  @Input() segmentHeight: number;

  @Input() locale: string;

  @Input() isTimeLabel: boolean;

  @Input() daysInWeek: number;

  @Input() customTemplate: TemplateRef<any>;
}
