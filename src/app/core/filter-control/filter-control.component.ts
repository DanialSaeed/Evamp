import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { fil } from 'date-fns/locale';
import * as moment from 'moment';
import { AlertService, CommunicationService, UtilsService } from 'src/app/services';
import { config } from 'src/config';
import { DateRangeHeaderCustomComponent } from '../date-range-header-custom/date-range-header-custom.component';
import { DateAdapter } from '@angular/material/core';

import { log } from 'console';
import { MatDatepicker } from '@angular/material/datepicker';
import { Subscription } from 'rxjs';

@Component({
  selector: 'filter-control',
  templateUrl: 'filter-control.component.html',
  styleUrls: ['./filter.scss']
})
export class FilterControlComponent implements OnInit, OnChanges, OnDestroy
{
  currentDate = new Date();
  @Input() placeholder: any = '';
  @Input() options: any;
  @Input() builtInFilters: any;
  @Input() filterArray: any = [];
  @Input() storage: any = [];

  selectedFilters: any = [];
  sub: Subscription;

  valueSelected: string;
  options1 = { 'sort 1': 'Product 1', 'sort 2': 'Product 2', 'sort 3': 'Product 3' }

  @Output() selectedItem: EventEmitter<string> = new EventEmitter<string>();
  @Output() filnalFilters: EventEmitter<any> = new EventEmitter<any>();
  @Output() toggleValue: EventEmitter<any> = new EventEmitter<any>();
  @Output() clearAllFilters: EventEmitter<any> = new EventEmitter<any>();
  @Output() buttonClickEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() archiveBtnClickEvent: EventEmitter<any> = new EventEmitter<any>();

  Form: FormGroup;
  FormTwo: FormGroup;
  @Input() label: any = null;
  @Input() start: Date = null;
  @Input() end: Date = null;
  @Input() hasDatePicker: any = false;
  @Input() hasOnlyDate: any = false;
  @Input() hasCustomOnlyDate: any = false;
  @Input() hasSearch: any = false;
  @Input() searchConfig: any = null;
  @Input() fxFlexInSearch: any = "260px";
  @Input() fxFlexInSort: any = "210px";
  @Input() hasButton: any = false;
  @Input() layoutAlign: any = "end start";
  @Input() hasClearButton: any = false;
  @Input() isGreyBackground: any = false;
  @Input() hasTwoDateRanges: any = false;
  @Input() hasToggle: any = false;
  @Input() isTwoRows: any = false;
  @Input() hasSwitch: any = false;
  @Input() screen: any = '';
  @Input() whiteBackgroundInputs: any = false;
  @Input() hasCustomButton: boolean = false;
  @Input() customButtonLabel: string = '';
  @Input() rangeWidth = '312px';
  // @Input() hasArchiveButton: boolean = false;
  // @Input() archiveButtonLabel: string = '';

  whiteBackStyle = {};

  searchTimer: any;
  minDate: Date;
  switchValue = false;
  year: number;
  month: number;
  readonly presetsDateRange = DateRangeHeaderCustomComponent;
  isCurrentDateSelected: boolean = false;
  isPreviousButtonActive: boolean = false;
  isNextButtonActive: boolean = false;

  constructor(private comm: CommunicationService, private dateAdapter: DateAdapter<Date>, protected util: UtilsService, private alertService: AlertService)
  {
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 20, 0, 1);
    this.Form = new FormGroup({
      start: new FormControl(this.start),
      search: new FormControl(this.searchConfig?.value,[this.util.trimWhitespaceValidator]),
      sort: new FormControl(this.start),
      invoiceNo: new FormControl(this.searchConfig?.value),

      end: new FormControl(this.end)
    });

    this.FormTwo = new FormGroup({
      date: new FormControl(this.start)
    });

    this.Form.valueChanges.subscribe(result =>
    {

    })

    this.sub = this.comm.discountChildren.subscribe((switchValue: any) => {
      this.switchValue = switchValue;
      this.onChangeFilters();
    });
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    this.whiteBackStyle = {
      'background': this.whiteBackgroundInputs ? 'white' : 'unset',
      'border-radius': this.whiteBackgroundInputs ? '13px' : 'unset'
    };
    if (this.hasCustomOnlyDate)
    {
      this.FormTwo.get('date').setValue(this.currentDate);
    }
    console.log(this.searchConfig);
    
    // this.filterArray = [];
    // console.log('ngOnChanges', changes);
    // this.filterArray = changes.currentValue;
    // console.log('ngOnChanges', this.filterArray);
  }

  ngOnInit()
  {
    setTimeout(() =>
    {
      this.storage.forEach(element =>
      {
        this.filterArray[element.at].options = JSON.parse(localStorage.getItem(element.get));
      });
    }, 1000);

    // this.comm.setlistingFilters.subscribe((filterData) => {

    // })

    // console.log(this.filterArray,"DDDDDD:")
    // if (this.builtInFilters)
    // {
    //     this.selectedFilters.push(this.builtInFilters);
    // }

    // let final = {
    //     sort: "",
    //     filter: this.selectedFilters
    // }

    // console.log('final', final, this.builtInFilters, this.selectedFilters);

    // this.filnalFilters.emit(final);

    if (this.searchConfig?.extraControl)
    {
      this.Form.addControl(this.searchConfig?.extraControl, new FormControl(this.searchConfig?.extraValue || '', [this.util.trimWhitespaceValidator]));
    }

    if (this.searchConfig?.searchValue)
    {
      this.Form.get('search').setValue(this.searchConfig?.searchValue);
    }

    if (this.searchConfig?.dateValue)
    {
      this.Form.get('date').setValue(this.searchConfig?.dateValue);
    }

    if (this.searchConfig?.startDateValue)
    {
      this.Form.get('start').setValue(this.searchConfig?.startDateValue);
    }

    if (this.searchConfig?.endDateValue)
    {
      this.Form.get('end').setValue(this.searchConfig?.endDateValue);
    }

    this.onChangeFilters();
  }

  optionSelected(value)
  {
    // Logs console.log("option selected is", value);
    this.valueSelected = value;
    this.selectedItem.emit(this.valueSelected);
    // Logs console.log(this.selectedItem)
  }



  onChangeFilters(): void
  {
    console.log(this.searchConfig);

    this.selectedFilters = [];
    let sort = '';
    let range = '';
    let search = '';
    let onlyDate = '';
    let toggle = false;

    let rangeStart = '';
    let rangeEnd = '';
    let switchValue = this.switchValue;


    if (this.builtInFilters)
    {
      this.selectedFilters.push(this.builtInFilters);
    }
    else if (localStorage.getItem('branchId'))
    {
      this.selectedFilters.push({ key: 'branchId', value: localStorage.getItem('branchId') });
    }

    if (this.Form.get('start').value && this.Form.get('end').value && (this.hasDatePicker || this.hasTwoDateRanges))
    {
      let dict = {
        startDate: moment(this.Form.get('start').value).format(config.serverDateFormat),
        endDate: moment(this.Form.get('end').value).format(config.serverDateFormat),
      }

      range = '&startDate=' + dict.startDate + '&endDate=' + dict.endDate;

      rangeStart = dict.startDate;
      rangeEnd = dict.endDate;
    }

    if (this.FormTwo.get('date').value && this.hasOnlyDate)
    {
      let start = moment(this.FormTwo.get('date').value).format(config.serverDateFormat);
      onlyDate = '&date=' + start;
    }

    if (this.searchConfig && this.hasSearch)
    {
      if (this.Form.get('search').value)
      {
        search = '&search=' + this.Form.get('search').value;
      }
    }

    // if (this.searchConfig.extraControl)
    // {
    //     if (this.Form.get(this.searchConfig.extraControl).value)
    //     {
    //         search = `&${this.searchConfig.extraControl}=`  + this.Form.get(this.searchConfig.extraControl).value;
    //     }
    // }

    if (this.searchConfig && this.hasToggle)
    {
      if (this.searchConfig.toggleValue)
      {
        toggle = true;
      }
    }

    this.filterArray.forEach(element =>
    {
      if (element.selected != 'All')
      {
        if (element.type == 'sort' && element.key == 'noSortOrder')
        {
          sort = '&sortOrder=' + element.selected
        }
        else if (element.type == 'sort' && element.key != 'noSortOrder')
        {
          sort = '&sortBy=' + element.key + '&sortOrder=' + element.selected;
        }
        else
        {
          let dict = {
            key: element.key, value: element.selected
          }
          this.selectedFilters.push(dict);
        }
      }
    });

    let searchVal = this.Form.get('search').hasError('whitespace') ? '' : this.Form.get('search')?.value;
    let extraVal = this.searchConfig.extraControl && this.Form.get(this.searchConfig.extraControl).hasError('whitespace') ? '' : this.Form.get(this.searchConfig.extraControl)?.value;
    
    let final = {
      sort: sort,
      range: range,
      search: search,
      date: onlyDate,
      toggle: toggle,
      filter: this.selectedFilters,

      rangeStart: rangeStart,
      rangeEnd: rangeEnd,
      switchValue: switchValue,

      searchValue: searchVal,
      extraValue: extraVal,
      dateValue: this.Form.get('date')?.value,
      startDateValue: this.Form.get('start')?.value,
      endDateValue: this.Form.get('end')?.value,
    }
    console.log(final);


    this.filnalFilters.emit(final);
  }

  valueChanged(): void
  {
    if (this.hasCustomOnlyDate)
    {
      let form = this.FormTwo;
      let date = form.get('date').value;
      let currentDate = new Date();
      let selectedDate;
      if(date){
        selectedDate = new Date(date);
      }
      if (date == null)
      {
        this.FormTwo.get('date').setValue(currentDate)
      }
      if (currentDate < selectedDate)
      {
        this.FormTwo.get('date').setValue(currentDate)
      }
      if (moment(date).format('dddd') == 'Saturday' || moment(date).format('dddd') == 'Sunday')
      {
        this.FormTwo.get('date').setValue(null);
        this.alertService.alertInfo('Warning', 'Selection not allowed on Saturday and Sunday');
        return;
      }
    }
    this.onChangeFilters();
  }

  valueChanged2(): void
  {
    if (this.Form.get('start').value && this.Form.get('end').value && (this.hasDatePicker || this.hasTwoDateRanges))
    {
      this.onChangeFilters();
    }
  }

  onSearch(type): void
  {
    if (!type && this.Form.get('search').hasError('whitespace')) return;
    if (type == 'extra' && this.searchConfig.extraControl && this.Form.get(this.searchConfig.extraControl).hasError('whitespace')) return;

    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() =>
    {
      this.onChangeFilters();
    }, 500);
  }

  onClear(): void
  {
    this.Form.reset();
    // this.FormTwo.reset();
    this.FormTwo.get('date').setValue(this.currentDate);
    // this.onDateRange.emit('removed');
    this.filterArray.forEach(element =>
    {
      element.selected = "All";
    });
    this.clearAllFilters.emit(true);
    this.onChangeFilters();
  }

  onClear2(): void
  {
    this.FormTwo.get('date').setValue(this.currentDate);
    // this.FormTwo.reset();
    // this.onDateRange.emit('removed');
    this.onChangeFilters();
  }

  emitToggleValue(value)
  {
    value = !value;
    this.searchConfig.toggleValue = value;
    this.onChangeFilters()
    // this.toggleValue.emit(value);
  }

  onClosed(): void
  {
    if (this.Form.get('start').value == null || this.Form.get('end').value == null)
    {
      this.onClear();
    }
  }

  onClickAction()
  {
    localStorage.removeItem('presetSelected')
  }

  onButtonClicked()
  {
    this.buttonClickEvent.emit();
  }

  onArchiveClicked()
  {
    this.archiveBtnClickEvent.emit();
  }

  chek()
  {
    console.log('xsd');

  }
  previousMonth(datepicker: MatDatepicker<Date>)
  {
    let currentDate = new Date();
    let currentDay = currentDate.getDay();
    const newDate = new Date(this.FormTwo.get('date').value);
    let selectedDay = newDate.getDay();
    const selectedMonth = newDate.getMonth();
    let previousDay = new Date();
    previousDay.setMonth(selectedMonth);
    previousDay.setDate(newDate.getDate() - 1);
    if (currentDay != selectedDay)
    {
      this.isCurrentDateSelected = false;
    }
    else
    {
      this.isCurrentDateSelected = false;
    }
    if (moment(previousDay).format('dddd') == 'Saturday' || moment(previousDay).format('dddd') == 'Sunday')
    {
      const selectedDayOfWeek = newDate.getDay();
      if (selectedDayOfWeek === 1)
      {
        newDate.setDate(newDate.getDate() - 3);
        this.FormTwo.get('date').setValue(newDate);
        this.onChangeFilters();
      }
    }
    else
    {
      newDate.setDate(newDate.getDate() - 1);
      this.FormTwo.get('date').setValue(newDate);
      this.onChangeFilters();
    }
  }

  nextDay(datepicker: MatDatepicker<any>)
  {
    let currentDate = new Date();

    const selectedDate = new Date(this.FormTwo.get('date').value);
    let selectedMonth = selectedDate.getMonth();

    let nextDay = new Date();
    nextDay.setMonth(selectedMonth);
    nextDay.setDate(selectedDate.getDate() + 1);
    if (selectedDate.toDateString() == currentDate.toDateString())
    {
      this.isCurrentDateSelected = true;
    }
    else if (moment(nextDay).format('dddd') == 'Saturday' || moment(nextDay).format('dddd') == 'Sunday')
    {
      const selectedDayOfWeek = selectedDate.getDay();
      if (selectedDayOfWeek === 5)
      {
        selectedDate.setDate(selectedDate.getDate() + 3);
        this.FormTwo.get('date').setValue(selectedDate);
        this.onChangeFilters();
      }
    }
    else
    {
      this.isCurrentDateSelected = false
      selectedDate.setDate(selectedDate.getDate() + 1);
      this.FormTwo.get('date').setValue(selectedDate);
      this.onChangeFilters();
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    // this.comm.discountChildren.unsubscribe();
    this.sub.unsubscribe();
  }

}
