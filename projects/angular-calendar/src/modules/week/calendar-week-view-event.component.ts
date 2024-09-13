import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
} from '@angular/core';
import {
  WeekViewAllDayEvent,
  WeekViewTimeEvent,
  WeekViewHourColumn,
} from 'calendar-utils';
import { PlacementArray } from 'positioning';

@Component({
  selector: 'mwl-calendar-week-view-event',
  templateUrl: './calendar-week-view-event.component.html',
})
export class CalendarWeekViewEventComponent {
  @Input() locale: string;

  @Input() weekEvent: WeekViewAllDayEvent | WeekViewTimeEvent;

  @Input() tooltipPlacement: PlacementArray;

  @Input() tooltipAppendToBody: boolean;

  @Input() tooltipDisabled: boolean;

  @Input() tooltipDelay: number | null;

  @Input() customTemplate: TemplateRef<any>;

  @Input() eventTitleTemplate: TemplateRef<any>;

  @Input() eventActionsTemplate: TemplateRef<any>;

  @Input() tooltipTemplate: TemplateRef<any>;

  @Input() column: WeekViewHourColumn;

  @Input() daysInWeek: number;

  @Output() eventClicked = new EventEmitter<{
    sourceEvent: MouseEvent | any;
  }>();
}
