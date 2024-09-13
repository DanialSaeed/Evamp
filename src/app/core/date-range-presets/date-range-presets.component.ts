import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatDateRangePicker } from '@angular/material/datepicker';
import * as moment from 'moment';

const customPresets = [
  'Today',
  'Last 7 days',
  'This week',
  'This month',
  'This year',
  'Last week',
  'Last month',
  'Last year',
] as const; // convert to readonly tuple of string literals

// equivalent to "today" | "last 7 days" | ... | "last year"
type CustomPreset = typeof customPresets[number];

@Component({
  selector: 'app-custom-range-panel',
  templateUrl: './date-range-presets.component.html',
  styleUrls: ['./date-range-presets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomRangePanelComponent<D> {
  // list of range presets we want to provide:
  readonly customPresets = customPresets;
  @HostBinding('class.touch-ui')
  readonly isTouchUi = this.picker.touchUi;
  selectedPreset = '';
  // dateAdapter: any;

  constructor(
    private dateAdapter: DateAdapter<D>,
    private picker: MatDateRangePicker<D>
  ) {
    // this.dateAdapter = DateAdapter;
    // if (localStorage.getItem('presetSelected')) {
    //   this.selectedPreset = localStorage.getItem('presetSelected');
    // }
  }

    // called when user selects a range preset:
    selectRange(rangeName: CustomPreset): void {
      console.log('choosed');
      
      const [start, end] = this.calculateDateRange(rangeName);
      this.picker.select(start);
      this.picker.select(end);
      this.picker.close();
    }
  
    private calculateDateRange(rangeName: CustomPreset) {
      const today = this.today;
      const year = this.dateAdapter.getYear(today);
      localStorage.setItem('presetSelected', rangeName);
      localStorage.setItem('isCustomSelectedDateRange', 'no');
  
      switch (rangeName) {
        case 'Today':
          return [today, today];
        case 'Last 7 days': {
          const start = this.dateAdapter.addCalendarDays(today, -6);
          return [start, today];
        }
        case 'This week': {
          return this.calculateWeek(today);
        }
        case 'This month': {
          return this.calculateMonth(today);
        }
        case 'This year': {
          const start = this.dateAdapter.createDate(year, 0, 1);
          const end = this.dateAdapter.createDate(year, 11, 31);
          return [start, end];
        }
        case 'Last week': {
          const thisDayLastWeek = this.dateAdapter.addCalendarDays(today, -7);
          return this.calculateWeek(thisDayLastWeek);
        }
        case 'Last month': {
          const thisDayLastMonth = this.dateAdapter.addCalendarMonths(today, -1);
          return this.calculateMonth(thisDayLastMonth);
        }
        case 'Last year': {
          const start = this.dateAdapter.createDate(year - 1, 0, 1);
          const end = this.dateAdapter.createDate(year - 1, 11, 31);
          return [start, end];
        }
        default:
          // exhaustiveness check;
          // rangeName has type never, if every possible value is handled in the switch cases.
          // Otherwise, the following line will result in compiler error:
          // "Type 'string' is not assignable to type '[start: D, end: D]'"
          return rangeName;
      }
    }
  
    private calculateMonth(forDay: any) {
      this.dateAdapter
      const year = this.dateAdapter.getYear(forDay);
      const month = this.dateAdapter.getMonth(forDay);
      const start = this.dateAdapter.createDate(year, month, 1);
      const end = this.dateAdapter.addCalendarDays(
        start,
        this.dateAdapter.getNumDaysInMonth(forDay) - 1
      );
      return [start, end];
    }
  
    private calculateWeek(forDay: any) {
      const deltaStart =
        this.dateAdapter.getFirstDayOfWeek() -
        this.dateAdapter.getDayOfWeek(forDay);
      const start = this.dateAdapter.addCalendarDays(forDay, deltaStart);
      const end = this.dateAdapter.addCalendarDays(start, 6);
      return [start, end];
    }
  
    private get today(): any {
      const today = moment();
      console.log(today);
      
      if (today === null) {
        throw new Error('date creation failed');
      }
      return today;
    }

}

