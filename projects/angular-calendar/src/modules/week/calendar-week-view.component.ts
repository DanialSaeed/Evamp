import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnChanges,
  OnInit,
  OnDestroy,
  LOCALE_ID,
  Inject,
  TemplateRef,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import {
  WeekDay,
  CalendarEvent,
  WeekViewAllDayEvent,
  WeekView,
  ViewPeriod,
  WeekViewHourColumn,
  WeekViewTimeEvent,
  WeekViewHourSegment,
  WeekViewHour,
  WeekViewAllDayEventRow,
} from 'calendar-utils';
import { ResizeEvent } from 'angular-resizable-element';
import { CalendarDragHelper } from '../common/calendar-drag-helper.provider';
import { CalendarResizeHelper } from '../common/calendar-resize-helper.provider';
import {
  CalendarEventTimesChangedEvent,
  CalendarEventTimesChangedEventType,
} from '../common/calendar-event-times-changed-event.interface';
import { CalendarUtils } from '../common/calendar-utils.provider';
import {
  validateEvents,
  roundToNearest,
  trackByWeekDayHeaderDate,
  trackByHourSegment,
  trackByHour,
  getMinutesMoved,
  getDefaultEventEnd,
  getMinimumEventHeightInMinutes,
  addDaysWithExclusions,
  isDraggedWithinPeriod,
  shouldFireDroppedEvent,
  getWeekViewPeriod,
  trackByWeekAllDayEvent,
  trackByWeekTimeEvent,
} from '../common/util';
import { DateAdapter } from '../../date-adapters/date-adapter';
import {
  DragEndEvent,
  DropEvent,
  DragMoveEvent,
  ValidateDrag,
} from 'angular-draggable-droppable';
import { PlacementArray } from 'positioning';

export interface WeekViewAllDayEventResize {
  originalOffset: number;
  originalSpan: number;
  edge: string;
}

export interface CalendarWeekViewBeforeRenderEvent extends WeekView {
  header: WeekDay[];
}

/**
 * Shows all events on a given week. Example usage:
 *
 * ```typescript
 * <mwl-calendar-week-view
 *  [viewDate]="viewDate"
 *  [events]="events">
 * </mwl-calendar-week-view>
 * ```
 */
@Component({
  selector: 'mwl-calendar-week-view',
  templateUrl: './calendar-week-view.component.html',
})
export class CalendarWeekViewComponent implements OnChanges, OnInit, OnDestroy {
  /**
   * The current view date
   */
  @Input() viewDate: Date;

  /**
   * An array of events to display on view
   * The schema is available here: https://github.com/mattlewis92/calendar-utils/blob/c51689985f59a271940e30bc4e2c4e1fee3fcb5c/src/calendarUtils.ts#L49-L63
   */
  @Input() events: CalendarEvent[] = [];

  /**
   * An array of day indexes (0 = sunday, 1 = monday etc) that will be hidden on the view
   */
  @Input() excludeDays: number[] = [];

  /**
   * An observable that when emitted on will re-render the current view
   */
  @Input() refresh: Subject<any>;

  /**
   * The locale used to format dates
   */
  @Input() locale: string;

  /**
   * The placement of the event tooltip
   */
  @Input() tooltipPlacement: PlacementArray = 'auto';

  /**
   * A custom template to use for the event tooltips
   */
  @Input() tooltipTemplate: TemplateRef<any>;

  /**
   * Whether to append tooltips to the body or next to the trigger element
   */
  @Input() tooltipAppendToBody: boolean = true;

  /**
   * The delay in milliseconds before the tooltip should be displayed. If not provided the tooltip
   * will be displayed immediately.
   */
  @Input() tooltipDelay: number | null = null;

  /**
   * The start number of the week.
   * This is ignored when the `daysInWeek` input is also set as the `viewDate` will be used as the start of the week instead.
   * Note, you should also pass this to the calendar title pipe so it shows the same days: {{ viewDate | calendarDate:(view + 'ViewTitle'):locale:weekStartsOn }}
   * If using the moment date adapter this option won't do anything and you'll need to set it globally like so:
   * ```
   * moment.updateLocale('en', {
   *   week: {
   *     dow: 1, // set start of week to monday instead
   *     doy: 0,
   *   },
   * });
   * ```
   */
  @Input() weekStartsOn: number;

  /**
   * A custom template to use to replace the header
   */
  @Input() headerTemplate: TemplateRef<any>;

  /**
   * A custom template to use for week view events
   */
  @Input() eventTemplate: TemplateRef<any>;

  /**
   * A custom template to use for event titles
   */
  @Input() eventTitleTemplate: TemplateRef<any>;

  /**
   * A custom template to use for event actions
   */
  @Input() eventActionsTemplate: TemplateRef<any>;

  /**
   * The precision to display events.
   * `days` will round event start and end dates to the nearest day and `minutes` will not do this rounding
   */
  @Input() precision: 'days' | 'minutes' = 'days';

  /**
   * An array of day indexes (0 = sunday, 1 = monday etc) that indicate which days are weekends
   */
  @Input() weekendDays: number[];

  /**
   * Whether to snap events to a grid when dragging
   */
  @Input() snapDraggedEvents: boolean = true;

  /**
   * The number of segments in an hour. Must divide equally into 60.
   */
  @Input() hourSegments: number = 2;

  /**
   * The height in pixels of each hour segment
   */
  @Input() hourSegmentHeight: number = 30;

  /**
   * The day start hours in 24 hour time. Must be 0-23
   */
  @Input() dayStartHour: number = 0;

  /**
   * The day start minutes. Must be 0-59
   */
  @Input() dayStartMinute: number = 0;

  /**
   * The day end hours in 24 hour time. Must be 0-23
   */
  @Input() dayEndHour: number = 23;

  /**
   * The day end minutes. Must be 0-59
   */
  @Input() dayEndMinute: number = 59;

  /**
   * A custom template to use to replace the hour segment
   */
  @Input() hourSegmentTemplate: TemplateRef<any>;

  /**
   * The grid size to snap resizing and dragging of hourly events to
   */
  @Input() eventSnapSize: number;

  /**
   * A custom template to use for the all day events label text
   */
  @Input() allDayEventsLabelTemplate: TemplateRef<any>;

  /**
   * The number of days in a week. Can be used to create a shorter or longer week view.
   * The first day of the week will always be the `viewDate` and `weekStartsOn` if set will be ignored
   */
  @Input() daysInWeek: number;

  /**
   * A custom template to use for the current time marker
   */
  @Input() currentTimeMarkerTemplate: TemplateRef<any>;

  /**
   * Called when a header week day is clicked. Adding a `cssClass` property on `$event.day` will add that class to the header element
   */
  @Output() dayHeaderClicked = new EventEmitter<{
    day: WeekDay;
    sourceEvent: MouseEvent;
  }>();

  /**
   * Called when the event title is clicked
   */
  @Output() eventClicked = new EventEmitter<{
    event: CalendarEvent;
    sourceEvent: MouseEvent | any;
  }>();

  /**
   * Called when an event is resized or dragged and dropped
   */
  @Output() eventTimesChanged = new EventEmitter<
    CalendarEventTimesChangedEvent
  >();

  /**
   * An output that will be called before the view is rendered for the current week.
   * If you add the `cssClass` property to a day in the header it will add that class to the cell element in the template
   */
  @Output() beforeViewRender = new EventEmitter<
    CalendarWeekViewBeforeRenderEvent
  >();

  /**
   * Called when an hour segment is clicked
   */
  @Output() hourSegmentClicked = new EventEmitter<{
    date: Date;
    sourceEvent: MouseEvent;
  }>();

  /**
   * @hidden
   */
  days: WeekDay[];

  /**
   * @hidden
   */
  view: WeekView;

  /**
   * @hidden
   */
  refreshSubscription: Subscription;

  /**
   * @hidden
   */
  allDayEventResizes: Map<
    WeekViewAllDayEvent,
    WeekViewAllDayEventResize
  > = new Map();

  /**
   * @hidden
   */
  timeEventResizes: Map<CalendarEvent, ResizeEvent> = new Map();

  /**
   * @hidden
   */
  eventDragEnterByType = {
    allDay: 0,
    time: 0,
  };

  /**
   * @hidden
   */
  dragActive = false;

  /**
   * @hidden
   */
  dragAlreadyMoved = false;

  /**
   * @hidden
   */
  validateDrag: ValidateDrag;

  /**
   * @hidden
   */
  validateResize: (args: any) => boolean;

  /**
   * @hidden
   */
  dayColumnWidth: number;

  /**
   * @hidden
   */
  calendarId = Symbol('angular calendar week view id');

  /**
   * @hidden
   */
  lastDraggedEvent: CalendarEvent;

  /**
   * @hidden
   */
  trackByWeekDayHeaderDate = trackByWeekDayHeaderDate;

  /**
   * @hidden
   */
  trackByHourSegment = trackByHourSegment;

  /**
   * @hidden
   */
  trackByHour = trackByHour;

  /**
   * @hidden
   */
  trackByWeekAllDayEvent = trackByWeekAllDayEvent;

  /**
   * @hidden
   */
  trackByWeekTimeEvent = trackByWeekTimeEvent;

  /**
   * @hidden
   */
  private lastDragEnterDate: Date;

  /**
   * @hidden
   */
  constructor(
    protected cdr: ChangeDetectorRef,
    protected utils: CalendarUtils,
    @Inject(LOCALE_ID) locale: string,
    protected dateAdapter: DateAdapter
  ) {
    this.locale = locale;
  }

  /**
   * @hidden
   */
  trackByHourColumn = (index: number, column: WeekViewHourColumn) =>
    column.hours[0] ? column.hours[0].segments[0].date.toISOString() : column;

  /**
   * @hidden
   */
  trackById = (index: number, row: WeekViewAllDayEventRow) => row.id;

  /**
   * @hidden
   */
  ngOnInit(): void {
    if (this.refresh) {
      this.refreshSubscription = this.refresh.subscribe(() => {
        this.refreshAll();
        this.cdr.markForCheck();
      });
    }
  }

  /**
   * @hidden
   */
  ngOnChanges(changes: any): void {
    const refreshHeader =
      changes.viewDate ||
      changes.excludeDays ||
      changes.weekendDays ||
      changes.daysInWeek ||
      changes.weekStartsOn;

    const refreshBody =
      changes.viewDate ||
      changes.dayStartHour ||
      changes.dayStartMinute ||
      changes.dayEndHour ||
      changes.dayEndMinute ||
      changes.hourSegments ||
      changes.weekStartsOn ||
      changes.weekendDays ||
      changes.excludeDays ||
      changes.hourSegmentHeight ||
      changes.events ||
      changes.daysInWeek;

    if (refreshHeader) {
      this.refreshHeader();
    }

    if (changes.events) {
      validateEvents(this.events);
    }

    if (refreshBody) {
      this.refreshBody();
    }

    if (refreshHeader || refreshBody) {
      this.emitBeforeViewRender();
    }
  }

  /**
   * @hidden
   */
  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  /**
   * @hidden
   */
  timeEventResizeStarted(
    eventsContainer: HTMLElement,
    timeEvent: WeekViewTimeEvent,
    resizeEvent: ResizeEvent
  ): void {
    this.timeEventResizes.set(timeEvent.event, resizeEvent);
    this.resizeStarted(eventsContainer);
  }

  /**
   * @hidden
   */
  timeEventResizing(timeEvent: WeekViewTimeEvent, resizeEvent: ResizeEvent) {
    this.timeEventResizes.set(timeEvent.event, resizeEvent);
    const adjustedEvents = new Map<CalendarEvent, CalendarEvent>();

    const tempEvents = [...this.events];

    this.timeEventResizes.forEach((lastResizeEvent, event) => {
      const newEventDates = this.getTimeEventResizedDates(
        event,
        lastResizeEvent
      );
      const adjustedEvent = { ...event, ...newEventDates };
      adjustedEvents.set(adjustedEvent, event);
      const eventIndex = tempEvents.indexOf(event);
      tempEvents[eventIndex] = adjustedEvent;
    });

    this.restoreOriginalEvents(tempEvents, adjustedEvents, true);
  }

  /**
   * @hidden
   */
  timeEventResizeEnded(timeEvent: WeekViewTimeEvent) {
    this.view = this.getWeekView(this.events);
    const lastResizeEvent = this.timeEventResizes.get(timeEvent.event);
    if (lastResizeEvent) {
      this.timeEventResizes.delete(timeEvent.event);
      const newEventDates = this.getTimeEventResizedDates(
        timeEvent.event,
        lastResizeEvent
      );
      this.eventTimesChanged.emit({
        newStart: newEventDates.start,
        newEnd: newEventDates.end,
        event: timeEvent.event,
        type: CalendarEventTimesChangedEventType.Resize,
      });
    }
  }

  /**
   * @hidden
   */
  allDayEventResizeStarted(
    allDayEventsContainer: HTMLElement,
    allDayEvent: WeekViewAllDayEvent,
    resizeEvent: ResizeEvent
  ): void {
    this.allDayEventResizes.set(allDayEvent, {
      originalOffset: allDayEvent.offset,
      originalSpan: allDayEvent.span,
      edge: typeof resizeEvent.edges.left !== 'undefined' ? 'left' : 'right',
    });
    this.resizeStarted(
      allDayEventsContainer,
      this.getDayColumnWidth(allDayEventsContainer)
    );
  }

  /**
   * @hidden
   */
  allDayEventResizing(
    allDayEvent: WeekViewAllDayEvent,
    resizeEvent: ResizeEvent,
    dayWidth: number
  ): void {
    const currentResize: WeekViewAllDayEventResize = this.allDayEventResizes.get(
      allDayEvent
    );

    if (typeof resizeEvent.edges.left !== 'undefined') {
      const diff: number = Math.round(+resizeEvent.edges.left / dayWidth);
      allDayEvent.offset = currentResize.originalOffset + diff;
      allDayEvent.span = currentResize.originalSpan - diff;
    } else if (typeof resizeEvent.edges.right !== 'undefined') {
      const diff: number = Math.round(+resizeEvent.edges.right / dayWidth);
      allDayEvent.span = currentResize.originalSpan + diff;
    }
  }

  /**
   * @hidden
   */
  allDayEventResizeEnded(allDayEvent: WeekViewAllDayEvent): void {
    const currentResize: WeekViewAllDayEventResize = this.allDayEventResizes.get(
      allDayEvent
    );

    if (currentResize) {
      const allDayEventResizingBeforeStart = currentResize.edge === 'left';
      let daysDiff: number;
      if (allDayEventResizingBeforeStart) {
        daysDiff = allDayEvent.offset - currentResize.originalOffset;
      } else {
        daysDiff = allDayEvent.span - currentResize.originalSpan;
      }

      allDayEvent.offset = currentResize.originalOffset;
      allDayEvent.span = currentResize.originalSpan;

      let newStart: Date = allDayEvent.event.start;
      let newEnd: Date = allDayEvent.event.end || allDayEvent.event.start;
      if (allDayEventResizingBeforeStart) {
        newStart = addDaysWithExclusions(
          this.dateAdapter,
          newStart,
          daysDiff,
          this.excludeDays
        );
      } else {
        newEnd = addDaysWithExclusions(
          this.dateAdapter,
          newEnd,
          daysDiff,
          this.excludeDays
        );
      }

      this.eventTimesChanged.emit({
        newStart,
        newEnd,
        event: allDayEvent.event,
        type: CalendarEventTimesChangedEventType.Resize,
      });
      this.allDayEventResizes.delete(allDayEvent);
    }
  }

  /**
   * @hidden
   */
  getDayColumnWidth(eventRowContainer: HTMLElement): number {
    return Math.floor(eventRowContainer.offsetWidth / this.days.length);
  }

  /**
   * @hidden
   */
  dateDragEnter(date: Date) {
    this.lastDragEnterDate = date;
  }

  /**
   * @hidden
   */
  eventDropped(
    dropEvent: DropEvent<{ event?: CalendarEvent; calendarId?: symbol }>,
    date: Date,
    allDay: boolean
  ): void {
    if (
      shouldFireDroppedEvent(dropEvent, date, allDay, this.calendarId) &&
      this.lastDragEnterDate.getTime() === date.getTime() &&
      (!this.snapDraggedEvents ||
        dropEvent.dropData.event !== this.lastDraggedEvent)
    ) {
      this.eventTimesChanged.emit({
        type: CalendarEventTimesChangedEventType.Drop,
        event: dropEvent.dropData.event,
        newStart: date,
        allDay,
      });
    }
    this.lastDraggedEvent = null;
  }

  /**
   * @hidden
   */
  dragEnter(type: 'allDay' | 'time') {
    this.eventDragEnterByType[type]++;
  }

  /**
   * @hidden
   */
  dragLeave(type: 'allDay' | 'time') {
    this.eventDragEnterByType[type]--;
  }

  /**
   * @hidden
   */
  dragStarted(
    eventsContainer: HTMLElement,
    event: HTMLElement,
    dayEvent?: WeekViewTimeEvent
  ): void {
    this.dayColumnWidth = this.getDayColumnWidth(eventsContainer);
    const dragHelper: CalendarDragHelper = new CalendarDragHelper(
      eventsContainer,
      event
    );
    this.validateDrag = ({ x, y, transform }) =>
      this.allDayEventResizes.size === 0 &&
      this.timeEventResizes.size === 0 &&
      dragHelper.validateDrag({
        x,
        y,
        snapDraggedEvents: this.snapDraggedEvents,
        dragAlreadyMoved: this.dragAlreadyMoved,
        transform,
      });
    this.dragActive = true;
    this.dragAlreadyMoved = false;
    this.lastDraggedEvent = null;
    this.eventDragEnterByType = {
      allDay: 0,
      time: 0,
    };
    if (!this.snapDraggedEvents && dayEvent) {
      this.view.hourColumns.forEach((column) => {
        const linkedEvent = column.events.find(
          (columnEvent) =>
            columnEvent.event === dayEvent.event && columnEvent !== dayEvent
        );
        // hide any linked events while dragging
        if (linkedEvent) {
          linkedEvent.width = 0;
          linkedEvent.height = 0;
        }
      });
    }
    this.cdr.markForCheck();
  }

  /**
   * @hidden
   */
  dragMove(dayEvent: WeekViewTimeEvent, dragEvent: DragMoveEvent) {
    const newEventTimes = this.getDragMovedEventTimes(
      dayEvent,
      dragEvent,
      this.dayColumnWidth,
      true
    );
    const originalEvent = dayEvent.event;
    const adjustedEvent = { ...originalEvent, ...newEventTimes };
    const tempEvents = this.events.map((event) => {
      if (event === originalEvent) {
        return adjustedEvent;
      }
      return event;
    });
    this.restoreOriginalEvents(
      tempEvents,
      new Map([[adjustedEvent, originalEvent]]),
      this.snapDraggedEvents
    );
    this.dragAlreadyMoved = true;
  }

  /**
   * @hidden
   */
  allDayEventDragMove() {
    this.dragAlreadyMoved = true;
  }

  /**
   * @hidden
   */
  dragEnded(
    weekEvent: WeekViewAllDayEvent | WeekViewTimeEvent,
    dragEndEvent: DragEndEvent,
    dayWidth: number,
    useY = false
  ): void {
    this.view = this.getWeekView(this.events);
    this.dragActive = false;
    this.validateDrag = null;
    const { start, end } = this.getDragMovedEventTimes(
      weekEvent,
      dragEndEvent,
      dayWidth,
      useY
    );
    if (
      (this.snapDraggedEvents ||
        this.eventDragEnterByType[useY ? 'time' : 'allDay'] > 0) &&
      isDraggedWithinPeriod(start, end, this.view.period)
    ) {
      this.lastDraggedEvent = weekEvent.event;
      this.eventTimesChanged.emit({
        newStart: start,
        newEnd: end,
        event: weekEvent.event,
        type: CalendarEventTimesChangedEventType.Drag,
        allDay: !useY,
      });
    }
  }

  protected refreshHeader(): void {
    this.days = this.utils.getWeekViewHeader({
      viewDate: this.viewDate,
      weekStartsOn: this.weekStartsOn,
      excluded: this.excludeDays,
      weekendDays: this.weekendDays,
      ...getWeekViewPeriod(
        this.dateAdapter,
        this.viewDate,
        this.weekStartsOn,
        this.excludeDays,
        this.daysInWeek
      ),
    });
  }

  protected refreshBody(): void {
    this.view = this.getWeekView(this.events);
  }

  protected refreshAll(): void {
    this.refreshHeader();
    this.refreshBody();
    this.emitBeforeViewRender();
  }

  protected emitBeforeViewRender(): void {
    if (this.days && this.view) {
      this.beforeViewRender.emit({
        header: this.days,
        ...this.view,
      });
    }
  }

  protected getWeekView(events: CalendarEvent[]) {
    return this.utils.getWeekView({
      events,
      viewDate: this.viewDate,
      weekStartsOn: this.weekStartsOn,
      excluded: this.excludeDays,
      precision: this.precision,
      absolutePositionedEvents: true,
      hourSegments: this.hourSegments,
      dayStart: {
        hour: this.dayStartHour,
        minute: this.dayStartMinute,
      },
      dayEnd: {
        hour: this.dayEndHour,
        minute: this.dayEndMinute,
      },
      segmentHeight: this.hourSegmentHeight,
      weekendDays: this.weekendDays,
      ...getWeekViewPeriod(
        this.dateAdapter,
        this.viewDate,
        this.weekStartsOn,
        this.excludeDays,
        this.daysInWeek
      ),
    });
  }

  protected getDragMovedEventTimes(
    weekEvent: WeekViewAllDayEvent | WeekViewTimeEvent,
    dragEndEvent: DragEndEvent | DragMoveEvent,
    dayWidth: number,
    useY: boolean
  ) {
    const daysDragged = roundToNearest(dragEndEvent.x, dayWidth) / dayWidth;
    const minutesMoved = useY
      ? getMinutesMoved(
          dragEndEvent.y,
          this.hourSegments,
          this.hourSegmentHeight,
          this.eventSnapSize
        )
      : 0;

    const start = this.dateAdapter.addMinutes(
      addDaysWithExclusions(
        this.dateAdapter,
        weekEvent.event.start,
        daysDragged,
        this.excludeDays
      ),
      minutesMoved
    );
    let end: Date;
    if (weekEvent.event.end) {
      end = this.dateAdapter.addMinutes(
        addDaysWithExclusions(
          this.dateAdapter,
          weekEvent.event.end,
          daysDragged,
          this.excludeDays
        ),
        minutesMoved
      );
    }

    return { start, end };
  }

  protected restoreOriginalEvents(
    tempEvents: CalendarEvent[],
    adjustedEvents: Map<CalendarEvent, CalendarEvent>,
    snapDraggedEvents = true
  ) {
    const previousView = this.view;
    if (snapDraggedEvents) {
      this.view = this.getWeekView(tempEvents);
    }

    const adjustedEventsArray = tempEvents.filter((event) =>
      adjustedEvents.has(event)
    );
    this.view.hourColumns.forEach((column, columnIndex) => {
      previousView.hourColumns[columnIndex].hours.forEach((hour, hourIndex) => {
        hour.segments.forEach((segment, segmentIndex) => {
          column.hours[hourIndex].segments[segmentIndex].cssClass =
            segment.cssClass;
        });
      });

      adjustedEventsArray.forEach((adjustedEvent) => {
        const originalEvent = adjustedEvents.get(adjustedEvent);
        const existingColumnEvent = column.events.find(
          (columnEvent) =>
            columnEvent.event ===
            (snapDraggedEvents ? adjustedEvent : originalEvent)
        );
        if (existingColumnEvent) {
          // restore the original event so trackBy kicks in and the dom isn't changed
          existingColumnEvent.event = originalEvent;
          existingColumnEvent['tempEvent'] = adjustedEvent;
          if (!snapDraggedEvents) {
            existingColumnEvent.height = 0;
            existingColumnEvent.width = 0;
          }
        } else {
          // add a dummy event to the drop so if the event was removed from the original column the drag doesn't end early
          const event = {
            event: originalEvent,
            left: 0,
            top: 0,
            height: 0,
            width: 0,
            startsBeforeDay: false,
            endsAfterDay: false,
            tempEvent: adjustedEvent,
          };
          column.events.push(event);
        }
      });
    });
    adjustedEvents.clear();
  }

  protected getTimeEventResizedDates(
    calendarEvent: CalendarEvent,
    resizeEvent: ResizeEvent
  ) {
    const minimumEventHeight = getMinimumEventHeightInMinutes(
      this.hourSegments,
      this.hourSegmentHeight
    );
    const newEventDates = {
      start: calendarEvent.start,
      end: getDefaultEventEnd(
        this.dateAdapter,
        calendarEvent,
        minimumEventHeight
      ),
    };
    const { end, ...eventWithoutEnd } = calendarEvent;
    const smallestResizes = {
      start: this.dateAdapter.addMinutes(
        newEventDates.end,
        minimumEventHeight * -1
      ),
      end: getDefaultEventEnd(
        this.dateAdapter,
        eventWithoutEnd,
        minimumEventHeight
      ),
    };

    if (typeof resizeEvent.edges.left !== 'undefined') {
      const daysDiff = Math.round(
        +resizeEvent.edges.left / this.dayColumnWidth
      );
      const newStart = addDaysWithExclusions(
        this.dateAdapter,
        newEventDates.start,
        daysDiff,
        this.excludeDays
      );
      if (newStart < smallestResizes.start) {
        newEventDates.start = newStart;
      } else {
        newEventDates.start = smallestResizes.start;
      }
    } else if (typeof resizeEvent.edges.right !== 'undefined') {
      const daysDiff = Math.round(
        +resizeEvent.edges.right / this.dayColumnWidth
      );
      const newEnd = addDaysWithExclusions(
        this.dateAdapter,
        newEventDates.end,
        daysDiff,
        this.excludeDays
      );
      if (newEnd > smallestResizes.end) {
        newEventDates.end = newEnd;
      } else {
        newEventDates.end = smallestResizes.end;
      }
    }

    if (typeof resizeEvent.edges.top !== 'undefined') {
      const minutesMoved = getMinutesMoved(
        resizeEvent.edges.top as number,
        this.hourSegments,
        this.hourSegmentHeight,
        this.eventSnapSize
      );
      const newStart = this.dateAdapter.addMinutes(
        newEventDates.start,
        minutesMoved
      );
      if (newStart < smallestResizes.start) {
        newEventDates.start = newStart;
      } else {
        newEventDates.start = smallestResizes.start;
      }
    } else if (typeof resizeEvent.edges.bottom !== 'undefined') {
      const minutesMoved = getMinutesMoved(
        resizeEvent.edges.bottom as number,
        this.hourSegments,
        this.hourSegmentHeight,
        this.eventSnapSize
      );
      const newEnd = this.dateAdapter.addMinutes(
        newEventDates.end,
        minutesMoved
      );
      if (newEnd > smallestResizes.end) {
        newEventDates.end = newEnd;
      } else {
        newEventDates.end = smallestResizes.end;
      }
    }

    return newEventDates;
  }

  protected resizeStarted(eventsContainer: HTMLElement, minWidth?: number) {
    this.dayColumnWidth = this.getDayColumnWidth(eventsContainer);
    const resizeHelper: CalendarResizeHelper = new CalendarResizeHelper(
      eventsContainer,
      minWidth
    );
    this.validateResize = ({ rectangle }) =>
      resizeHelper.validateResize({ rectangle });
    this.cdr.markForCheck();
  }
}
