import { Component, OnInit, Input, Output, EventEmitter, ViewChild, Directive, HostListener, ElementRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AlertService, ApiService } from 'src/app/services';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { ViewMoreDialogComponent } from 'src/app/shared/view-more-dialog/view-more-dialog.component';
import { MatTable } from '@angular/material/table';

import { MatSort, Sort } from '@angular/material/sort';
import { AttendanceBreakListComponent } from 'src/app/shared/attendance-break-list/attendance-break-list.component';
import { config } from 'src/config';
import * as moment from 'moment';
@Component({
  selector: 'app-table-component',
  templateUrl: './table-component.component.html',
  styleUrls: ['./table-component.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('85ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TableComponentComponent implements OnInit
{
  objectKeys = Object.keys;
  perPage = 20
  inputData: any;
  columnHeader: any;
  showToolTip: any;
  toolTip; any;
  editableEndDate: any;
  calendar: String = "assets/images/sdn/ic_event_24px.svg";
  @Input() props: { ActionButtons: any; inputData: any; checkedBoxes: any; checkedOne: any; columnHeader: any; dataSource: any; pagination: any; showToolTip: any; toolTip: any; };
  @Input() dateProps: { MinDate: any };
  @Output() selectedItem: EventEmitter<string> = new EventEmitter<string>();
  @Output() status: EventEmitter<string> = new EventEmitter<string>();
  @Output() onRowAction: EventEmitter<any> = new EventEmitter<any>();
  @Output() onPagination: EventEmitter<any> = new EventEmitter<any>();
  @Output() emitSelectedCheckBox: EventEmitter<any> = new EventEmitter<any>();
  @Output() emitSelectedCheckBoxAll: EventEmitter<any> = new EventEmitter<any>();
  @Output() emitHeaderCheckBoxValue: EventEmitter<any> = new EventEmitter<any>();
  @Output() emitColumnAction: EventEmitter<any> = new EventEmitter<any>();
  @Output() emitColumnSortAction: EventEmitter<any> = new EventEmitter<any>();
  @Output() emitUpdatedAllRows: EventEmitter<any> = new EventEmitter<any>();

  @Input() hasHeaderCheckBox: any = false;
  @Input() isViewClick: any = false;
  @Input() sortFields: any = [];
  @Input() isExpandable = false;
  @Input() nestedDataKey: any;
  @Input() nestedColumns: any;
  @Input() totalAmount: any;
  @Input() selectedTotalAmount: any;
  @Input() height: any = '60vh';
  @Input() maxHeight: any = '60vh';
  @Input() nextLineText = false;
  @Input() editableDate = false;
  @Input() invoiceTab: any;
  @Input() isCheckboxRowClick = false;

  // @ViewChild('tableM') tableM: any;
  @ViewChild(MatTable) table: any;

  selection = new SelectionModel<any>(true, []);
  isSticky = false;

  //   @HostListener("wheel", ["$event"])
  //   onWindowScroll() {
  // 	console.log(this.table._elementRef.nativeElement.getBoundingClientRect());
  //   }


  checkedBoxes = 0;
  checkedOne;
  showImage: boolean = false;
  showActions: boolean = false;
  expandPanel: boolean = false;
  expandButton: boolean = false;
  hasDivs: boolean = false;
  hasTitle: boolean = false;
  makeDiv: boolean = false;
  hasCustomData: boolean = false;
  // canApprove: boolean = true;
  hasimageDialog = false;
  customData: any;
  divColor: any;
  dicIcon: any;

  firstColumn = "No."
  lastColumn = "Action"
  roundedTable: boolean;
  hasSwitch: string;
  hasViewMore: string;
  id: number;
  expand_button = ""
  expanded: any;
  expand_source = ""
  expandedElements: any;
  sendOutput: any;
  dataSource = new MatTableDataSource();
  divIcon: string;
  notApprovedNames = ""
  // star Day Nursery
  hasPreCircle: any;
  preCircleCol: any;
  hasCheckBox: any;
  hyperLink: any;
  checkBoxCol: "checkbox";
  headerCheckBoxValue: any = false;
  sortheaders: any[] = [];
  ellipse = true;
  expandedElement: any;
  nameColumns = ['child', 'guardianName', 'firstName', 'lastName', 'name', 'parentName', 'childName', 'staffName', 'branchName', 'room']
  nameHeaders = ['Child', 'Name', 'Room']
  public scrollbarOptions = { axis: 'y', theme: 'minimal-dark', scrollInertia: 10 };
  public scrollbarBottom = { axis: 'x', theme: 'minimal-dark', scrollInertia: 10 };

  @ViewChild(MatSort) sort: MatSort;
  parentHeight: any;
  parentMaxHeight: any;
  sessionCols = ['sessionFormonday', 'sessionFortuesday', 'sessionForwednesday', 'sessionForthursday', 'sessionForfriday']

  constructor(protected router: Router, public dialog: MatDialog, protected alertService: AlertService, protected apiService: ApiService, private element: ElementRef)
  {

  }
  // @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  ngOnChanges()
  {
    if (this.props.checkedBoxes)
    {
      this.checkedBoxes = this.props.checkedBoxes;

    }
    if (this.props.checkedOne)
    {
      this.checkedOne = this.props.checkedOne;

    }
    this.onAllChecked();
    // let minDate = new Date(this.dateProps.minDate);
    // this.dateProps.minDate = minDate;



    // this.props.dataSource.sort = this.sort;
    // this.dataSource = this.sort;

    // this.columnHeader = this.props.columnHeader;
  }

  ngOnInit()
  {
    // this.dataSource.paginator = this.paginator;
    this.inputData = this.props.inputData;
    this.columnHeader = this.props.columnHeader;
    //this.dataSource = new MatTableDataSource(this.inputListData);
    this.updateInputData();
    this.dataSource = this.props.dataSource;
    if (this.sortFields.length != 0)
    {
      this.sortheaders = this.sortFields.map(x => x.field);
    }
    // this.props.dataSource.sort = this.sort;
  }

  updateInputData()
  {
    this.roundedTable = this.inputData?.roundedTable;
    this.hasSwitch = this.inputData?.hasSwitch;
    this.hyperLink = this.inputData?.hyperLink;
    this.firstColumn = this.inputData?.firstColumn;
    this.lastColumn = this.inputData?.lastColumn;
    this.hasDivs = this.inputData?.hasDivs;
    this.hasViewMore = this.inputData?.hasViewMore;
    this.hasTitle = this.inputData?.hasTitle;
    console.log(this.dataSource);
  }

  seeElement(element, data)
  {
    // console.log("element was", element)
    this.showActions = element === this.inputData.actionColumn ? true : false;
    this.showImage = element === this.inputData.imageColumn ? true : false
    // this.expandPanel = element === this.inputData.expandColumn ? true : false
    // this.hasimageDialog = element === "contractImage" ? true : false
    //  console.log("this is ",element,data)
    // this.checkExpand(element, data)
    // this.checkAttendance(element, data)
    // ========>>> SD Nurdsery<-----------
    this.hasPreCircle = element === this.inputData.preCircleCol ? true : false
    this.hasCheckBox = element === this.inputData.checkBoxCol ? true : false

  }

  // checkExpand(element, data)
  // {
  // 	if (element == "typeEn")
  // 	{
  // 		this.expandButton = (data.typeEn === 'Multiple' || data.typeEn === 'Single') ? true : false
  // 		this.expandedElements = data.samplingRequestItems
  // 	}
  // }
  // checkAttendance(element, data)
  // {
  // 	if (element === "attendance")
  // 	{
  // 		this.hasDivs = true
  // 		if (data.attendance === "absent")
  // 		{
  // 			this.divColor = "#FFC3C1";
  // 			this.divIcon = 'close';
  // 		}
  // 		else if (data.attendance === "present")
  // 		{
  // 			this.divColor = "#89E4C0";
  // 			this.divIcon = 'done';
  // 		}
  // 		else
  // 		{
  // 			this.divColor = "#DDDDDD";
  // 			this.divIcon = 'done';
  // 		}
  // 		// Logs console.log(this.divColor)
  // 	}
  // 	else { this.hasDivs = false }
  // }

  applyFilter(filterValue: any)
  {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  afterListResponse(data): void
  {
    this.dataSource = new MatTableDataSource(data);
    this.onAllChecked();
  }

  statusChanged(element)
  {
    this.status.emit(element);
  }

  setPage(pageData: any)
  {
    if (pageData.perPage)
    {
      this.perPage = pageData.perPage;
    }
    this.onPagination.emit(pageData);
  }

  hasDaySessionCols(columnName)
  {
    return this.sessionCols.includes(columnName);
  }

  buttonClicked(row, item)
  {
    if (this.inputData.buttonEvent === "onRowAction")
    {
      let dict = {
        row: row,
        item: item,
      }
      this.onRowAction.emit(dict);
    }
    else if (this.inputData.buttonEvent === "output")
    {
      this.sendOutput = {
        "row": row,
        "item": item,
      }
      this.selectedItem.emit(this.sendOutput);
    }
  }
  hyperLinkClicked(element)
  {
    this.router.navigateByUrl(element.url);
  }
  columnClick(row)
  {
    this.emitColumnAction.emit(row);
  }

  onHeaderCheckBox(checked)
  {
    console.log('onHeaderCheckBox', checked, this.props.dataSource.data);
    this.emitSelectedCheckBoxAll.emit(checked);

    this.props.dataSource.data.forEach(element =>
    {
      element['checkbox'] = checked;
      // if(element.seprateInvoice){
      //   element['isSeparateInvoice'] = checked;
      // }
      element['fillBackground'] = checked;
    });

    this.emitHeaderCheckBoxValue.emit(checked);
  }

  clickView(row, column, event)
  {
    console.log(row);

    $('.main-layout').mCustomScrollbar("update");

    if (this.isViewClick && (column != 'checkbox' && column != 'Actions'))
    {
      let item = this.props.ActionButtons.find(p => p.buttonLabel == 'View');

      this.sendOutput = {
        "row": row,
        "item": item,
      }
      this.selectedItem.emit(this.sendOutput);
    }

    if (this.isCheckboxRowClick) {
      row.checkbox = !row.checkbox;
      this.onCheckBox(row,row.checkbox)
    //   var response = {
    //     'element': row,
    //     'checked': row.checkbox
    //   };
    //   this.emitSelectedCheckBox.emit(response);
    }
  }

  //SDN Checkbox
  onCheckBox(element, checked, column?, event?)
  {
    if (!this.inputData?.onlyOneCheck)
    {
      if (checked == true)
      {
        if (!column)
        {
          element['checkbox'] = true;
          element['fillBackground'] = true;
        }
        if (element.seprateInvoice && column == 'seprateInvoice')
        {
          element['isSeparateInvoice'] = true;
          return;
        }
      }
      else
      {
        if (!column)
        {
          element['checkbox'] = false;
          element['fillBackground'] = false;
        }
        if (column == 'seprateInvoice')
        {
          element['isSeparateInvoice'] = false;
          return;
        }
      }

      var response = {
        'element': element,
        'checked': checked
      };
      this.emitSelectedCheckBox.emit(response);
    }
    else
    {
      if (this.checkedBoxes == 0)
      {
        if (checked == true)
        {
          this.checkedBoxes++;
          this.checkedOne = element;
          element['checkbox'] = true;
          element['fillBackground'] = true;
        }

        var response = {
          'element': element,
          'checked': checked
        };
        this.emitSelectedCheckBox.emit(response);
      }
      else
      {
        if (checked == true)
        {
          this.checkedOne['checkbox'] = false;
          this.checkedOne['fillBackground'] = false;
          this.checkedOne = element;
          element['checkbox'] = true;
          element['fillBackground'] = true;
        }
        else
        {
          if (this.checkedOne.id == element.id)
          {
            var response = {
              'element': element,
              'checked': checked
            };
            this.emitSelectedCheckBox.emit(response);
            this.checkedOne = null;
            element['checkbox'] = false;
            element['fillBackground'] = false;
            this.checkedBoxes--;
          }
        }
        var response = {
          'element': this.checkedOne,
          'checked': checked
        };
        this.emitSelectedCheckBox.emit(response);
      }
    }
    this.onAllChecked();
  }

  onAllChecked()
  {
    let checkedCount = 0;
    this.parentHeight = this.height;
    this.parentMaxHeight = this.maxHeight;

    if (document.querySelector('.data-table')) {
      let windowHeight = document.body.getBoundingClientRect().height;
      let topOffset = document.querySelector('.data-table').getBoundingClientRect().y;
      let height = (windowHeight - topOffset) - 100;
  
      if (this.props.pagination)
      {
        this.parentHeight = this.props?.pagination?.count > 6 ? height + 'px' : 'auto';
        // this.parentHeight = this.props.dataSource?.data?.length == 0 ? 'auto' : height + 'px';
        // this.parentMaxHeight = this.props?.pagination?.count > 6 ? height + 'px' : 'auto';
      } 
      else {
        if (this.height != 'auto') {
          this.parentHeight = this.props.dataSource?.data?.length == 0 ? 'auto' : height + 'px';
        }
    }

    }


    this.props?.dataSource?.data.forEach(element =>
    {
      if (element['checkbox'] == true)
      {
        checkedCount++;
      }
    });
    let dataLength = this.props.dataSource?.data?.length;
    this.headerCheckBoxValue = (dataLength > 0 && dataLength === checkedCount) ? true : false;
    this.emitHeaderCheckBoxValue.emit(this.headerCheckBoxValue);
  }

  getPaginationText()
  {
    let pagination = 'Total Count : ';
    if (this.props.pagination.page < this.props?.pagination?.pages)
    {
      pagination += this.perPage * this.props?.pagination?.page + "/" + this.props?.pagination?.count;
    }
    else if (this.props?.pagination?.page == this.props?.pagination?.pages)
    {
      pagination += this.props?.pagination?.count + "/" + this.props?.pagination?.count;
    }

    return pagination;
  }

  //------ Checklist in table Code -------//

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected()
  {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle()
  {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string
  {
    if (!row)
    {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  getCondition(item, element)
  {


    if (item.hide)
    {
      return false;
    }

    //   if (item.isConditional && item.isMultipleValue) {
    // 	return item.multipleValues.includes()
    //   }

    if (item.isConditional)
    {
      if (typeof item.condition === 'object')
      {
        if (Array.isArray(item.condition))
        {
          return element[item.condition[0].key] == item.condition[0].value;
        } else
        {
          return element[item.condition.key] == item.condition.value;
        }
      }
    } else
    {
      return true;
    }
  }

  sortColumn(d)
  {
    let col = this.sortFields.find(x => x.field == d);
    if (col)
    {
      col.asc = !col.asc;
      // this.emitColumnSortAction.emit(col);

      // if (col.order == 'def') {
      //    col.order = 'ASC'
      // }  else if(col.order == 'ASC') {
      // 	col.order = 'DESC'
      // } else {
      // 	col.order = 'def'
      // }

      col['order'] = col.asc ? 'ASC' : 'DESC';
      this.emitColumnSortAction.emit(col);
    }

  }

  // deleteRow(row, column) {
  // 	let item = this.props.ActionButtons.find(p => p.buttonLabel == 'Delete');
  // 	this.sendOutput = {
  // 		"row": row,
  // 		"item": item,
  // 	}
  // 	this.selectedItem.emit(this.sendOutput);
  // }

  iconAction(row, column, type)
  {
    this.sendOutput = {
      "row": row,
      "item": { type: type },
    }

    // If delete row
    if (type == 'delete')
    {
      let item = this.props.ActionButtons.find(p => p.buttonLabel == 'Delete');
      if (item)
      {
        this.sendOutput.item = item;
      }
    }

    this.selectedItem.emit(this.sendOutput);
  }

  public onScroll(event: WheelEvent)
  {
    this.element.nativeElement.scrollLeft += event.deltaY;
  }

  updateDateFromColumn(element, event)
  {
    this.props.dataSource.filteredData.forEach(el =>
    {
      if (el.id === element.id)
      {
        el.end = moment(new Date(event.value)).format(config.serverDateFormat)
      }
    });
    this.emitUpdatedAllRows.emit(this.props.dataSource.filteredData);
  }

  // ============> Old Code <=====================

  // updateDataToSubmit(dataToSubmit, type)
  // {
  // 	dataToSubmit.samplingRequestItems.forEach((element, index) =>
  // 	{  element['serialNumber'] = index + 1;
  // 		if(type == 'Approve')
  // 		{
  // 			element['quantityGiven'] = element.quantityRequested
  // 		}
  // 		else
  // 		{
  // 			element['quantityGiven'] = 0
  // 		}
  // 	});
  // 	return dataToSubmit;

  // }

  // sendData(row, item, reason)
  // {
  // 	this.sendOutput = {
  // 		"row": row,
  // 		"status": item.buttonStatus,
  // 		"reason": reason,
  // 	}
  // 	console.log(this.sendOutput, "this is data i am sending")
  // 	// this.selectedItem.emit(this.sendOutput);
  // }

  // validateSaplingRequest(row)
  // {
  // 	row.samplingRequestItems.forEach(element =>
  // 	{
  // 		// console.log(element)
  // 		// console.log(this.notApprovedNames.length, "length")
  // 		if (element.quantityRequested > element.inventory.quantity)
  // 		{
  // 			this.canApprove = false;
  // 			this.notApprovedNames += this.notApprovedNames.length == 0 ? ' ' + element.inventory.specie.nameEn : ',' + element.inventory.specie.nameEn;
  // 		}
  // 	});
  // }


  // checkQuantityStatus(quantity, available)
  // {
  // 	if (available > quantity)
  // 	{
  // 		this.expand_source = "assets/images/tick.png"
  // 	}
  // 	else if (available === '0' || available < quantity)
  // 	{
  // 		this.expand_source = "assets/images/cross.png"
  // 	}
  // 	else
  // 	{
  // 		this.expand_source = "assets/images/warn.png"
  // 	}
  // 	return this.expand_source

  // }

  // expandClicked(element)
  // {
  // 	if (element.expanded == 'false')
  // 	{
  // 		element.expanded = 'true';
  // 	}
  // 	else
  // 	{
  // 		element.expanded = 'false';
  // 	}
  // }

  // getIcon(expanded)
  // {
  // 	if (expanded == 'false')
  // 	{
  // 		return "assets/images/dropdown_closed.png"
  // 	}
  // 	else
  // 	{
  // 		return "assets/images/dropdown_open.png"
  // 	}
  // }


  // openDialog(imageUrl)
  // {
  // 	console.log(imageUrl, "in open dialog");
  // 	const dialogRef = this.dialog.open(imageDialog, {
  // 		// width: '250px',
  // 		data: { src: imageUrl }
  // 	});

  // 	dialogRef.afterClosed().subscribe(result =>
  // 	{
  // 		console.log('The dialog was closed');
  // 	});
  // }

  getTrimmedText(str)
  {

    if (str && str.length > 30 && this.ellipse)
    {
      let txt = str.substring(0, 30);
      return txt;
    } else
    {
      return str;
    }
  }

  checkArray(element, column)
  {
    return Array.isArray(element[column]);
  }

  // toggle(data) {
  // 	this.ellipse = !this.ellipse;
  //     data['viewMore'] = !this.ellipse;
  // }

  openViewMore(text)
  {
    let dialogRef = this.dialog.open(ViewMoreDialogComponent);
    dialogRef.componentInstance.text = text;
  }

  // Dialog for Staff Attendance Listing
  openViewBreaksDialog(logData)
  {
    let dialogRef = this.dialog.open(AttendanceBreakListComponent);
    dialogRef.componentInstance.listData = logData?.staffAttendanceBreaksLog;
  }

  getDataSource(d)
  {
    return new MatTableDataSource(d);
  }

  isNameColumn(name)
  {
    return this.nameColumns.includes(name);
  }

  isNameHead(name)
  {
    return this.nameHeaders.includes(name);
  }

  onMouseEnter()
  {
    if (this.parentHeight != 'auto')
    {
      $('.main-layout').mCustomScrollbar("disable");
    }
  }

  onMouseLeave()
  {
    $('.main-layout').mCustomScrollbar("update");
  }
}
// @Component({
// 	selector: 'app-table-component',
// 	templateUrl: 'image-dialog.html',
// })
// export class imageDialog
// {

// 	constructor(
// 		public dialogRef: MatDialogRef<imageDialog>,
// 		@Inject(MAT_DIALOG_DATA) public data) { }

// 	onNoClick(): void
// 	{
// 		this.dialogRef.close();
// 	}
// }
