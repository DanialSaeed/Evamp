import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AlertService, ApiService } from 'src/app/services';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { ViewMoreDialogComponent } from 'src/app/shared/view-more-dialog/view-more-dialog.component';

import {MatSort, Sort} from '@angular/material/sort';
import { AttendanceBreakListComponent } from 'src/app/shared/attendance-break-list/attendance-break-list.component';

@Component({
  selector: 'app-staff-attendance-table',
  templateUrl: './staff-attendance-table.component.html',
  styleUrls: ['./staff-attendance-table.component.scss'],
  animations: [
		trigger('detailExpand', [
			state('collapsed', style({ height: '0px', minHeight: '0' })),
			state('expanded', style({ height: '*' })),
			transition('expanded <=> collapsed', animate('85ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
		]),
	],
})

export class StaffAttendanceTableComponent implements OnInit
{
	objectKeys = Object.keys;
	perPage = 10
	inputData: any;
	columnHeader: any;
	@Input() props: { ActionButtons: any; inputData: any; checkedBoxes: any; checkedOne: any; columnHeader: any; dataSource: any; pagination: any; };
	@Output() selectedItem: EventEmitter<string> = new EventEmitter<string>();
	@Output() status: EventEmitter<string> = new EventEmitter<string>();
	@Output() onRowAction: EventEmitter<any> = new EventEmitter<any>();
	@Output() onPagination: EventEmitter<any> = new EventEmitter<any>();
	@Output() emitSelectedCheckBox: EventEmitter<any> = new EventEmitter<any>();
	@Output() emitSelectedCheckBoxAll: EventEmitter<any> = new EventEmitter<any>();
	@Output() emitHeaderCheckBoxValue: EventEmitter<any> = new EventEmitter<any>();
	@Output() emitColumnAction: EventEmitter<any> = new EventEmitter<any>();
	@Output() emitColumnSortAction: EventEmitter<any> = new EventEmitter<any>();
	@Input() hasHeaderCheckBox: any = false;
	@Input() isViewClick: any = false;
	@Input() sortFields: any = [];
	@Input() isExpandable = false;
	@Input() nestedDataKey: any;
	@Input() nestedColumns: any;
	@Input() isCellFixedWidth = false;
	@Input() cellWidth: any;
	@Input() height: any = '60vh';


  selection = new SelectionModel<any>(true, []);


	checkedBoxes=0;
	checkedOne;
	showImage: boolean = false;
	showActions: boolean = false;
	expandPanel: boolean = false;
	expandButton: boolean = false;
	hasDivs: boolean = false;
  hasTitle:boolean =false;
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
	checkBoxCol: "checkbox";
	headerCheckBoxValue: any = false;
	sortheaders:any[] = [];
	ellipse = true;
	expandedElement: any;

	@ViewChild(MatSort) sort: MatSort;
	parentHeight: any;
	nameColumns = ['child', 'guardianName', 'firstName', 'lastName', 'name', 'parentName', 'childName','staffName', 'branchName', 'room']

	constructor(protected router: Router, public dialog: MatDialog, protected alertService: AlertService, protected apiService: ApiService)
	{

	}
	// @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

    ngOnChanges()
	{
		if(this.props.checkedBoxes)
		{
			this.checkedBoxes = this.props.checkedBoxes;

		}
		if(this.props.checkedOne)
		{
			this.checkedOne = this.props.checkedOne;

		}
		this.onAllChecked();

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
		console.log(this.sort);
		if (this.sortFields.length != 0) {
			this.sortheaders = this.sortFields.map(x => x.field);
			console.log(this.sortheaders);
			
		}
		console.log(this.nestedColumns);
		// this.props.dataSource.sort = this.sort;
	}

	updateInputData()
	{
		this.roundedTable = this.inputData?.roundedTable;
		this.hasSwitch = this.inputData?.hasSwitch;
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

		this.hasPreCircle = element === this.inputData.preCircleCol ? true : false
		this.hasCheckBox = element === this.inputData.checkBoxCol ? true : false
	}

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
		if (pageData.perPage) {
          this.perPage = pageData.perPage; 
		}
		this.onPagination.emit(pageData);
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

	columnClick(row)
	{
		this.emitColumnAction.emit(row);
	}

	onHeaderCheckBox(checked)
	{
		console.log('onHeaderCheckBox', checked, this.props.dataSource.data);
		this.emitSelectedCheckBoxAll.emit(checked);

		this.props.dataSource.data.forEach(element => {
            element['checkbox'] = checked;
            element['fillBackground'] = checked;
		});

		this.emitHeaderCheckBoxValue.emit(checked);
	}

	clickView(row, column) {
		
		if (this.isViewClick && (column != 'checkbox' && column != 'Actions')) {
			// let item = this.props.ActionButtons.find(p => p.buttonLabel == 'View');
					
			this.sendOutput = {
				"row": row,
				"item": {type: ''},
			}
			this.selectedItem.emit(this.sendOutput);
		}
	}

	//SDN Checkbox
	onCheckBox(element, checked)
	{
		if (!this.inputData?.onlyOneCheck)
		{
			if (checked == true)
				{
				element['checkbox'] = true;
					element['fillBackground'] = true;
				}
				else
				{
				element['checkbox'] = false;
					element['fillBackground'] = false;
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
					this.checkedOne=element;
					element['checkbox']=true;
					element['fillBackground'] = true;
				}
				else
				{
					if(this.checkedOne.id==element.id)
					{
						var response = {
							'element': element,
							'checked': checked
						};
						this.emitSelectedCheckBox.emit(response);
						this.checkedOne=null;
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
		
		if (this.props.pagination) {
			let windowHeight = document.body.getBoundingClientRect().height;
			let topOffset = document.querySelector('.data-table').getBoundingClientRect().y;
			let height = (windowHeight - topOffset) - 100;

			this.parentHeight = this.props?.pagination?.count > 6 ? height + 'px' : 'auto';
		}
    // console.log(this.props);

		this.props.dataSource.data.forEach(element => {
            if (element['checkbox'] == true)
			{
				checkedCount++;
			}
		});
		let dataLength = this.props.dataSource.data.length;
		this.headerCheckBoxValue = (dataLength > 0 && dataLength  === checkedCount) ? true : false;
		this.emitHeaderCheckBoxValue.emit(this.headerCheckBoxValue);
	}

	getPaginationText()
	{
		let pagination = 'Total Count : ';
		if (this.props.pagination.page < this.props?.pagination?.pages)
		{
			pagination += this.perPage * this.props?.pagination?.page +"/"+ this.props?.pagination?.count;
		}
		else if (this.props?.pagination?.page == this.props?.pagination?.pages)
		{
			pagination += this.props?.pagination?.count +"/"+ this.props?.pagination?.count;
		}

		return pagination;
	}

  //------ Checklist in table Code -------//

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
      const numSelected = this.selection.selected.length;
      const numRows = this.dataSource.data.length;
      return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
      this.isAllSelected() ?
          this.selection.clear() :
          this.dataSource.data.forEach(row => this.selection.select(row));
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: any): string {
      if (!row) {
        return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
      }
      return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
    }

    getCondition(item,element) {
	  if (item.hide) {
		  return false;
	  }	

	  if (item.isConditional && (item.condition.value instanceof Array)) {
		return item.condition.value.includes(element[item.condition.key]);
	}	

      if (item.isConditional) {
        return element[item.condition.key] == item.condition.value;
      } else {
        return true;
      }
    }

	sortColumn(d) {
      let col = this.sortFields.find(x => x.field == d);
	  if (col) {
		col.asc = !col.asc;
		// this.emitColumnSortAction.emit(col);

		// if (col.order == 'def') {
        //    col.order = 'ASC'
		// }  else if(col.order == 'ASC') {
		// 	col.order = 'DESC'
		// } else {
		// 	col.order = 'def'
		// }

		col['order'] = col.asc ? 'ASC': 'DESC';
		this.emitColumnSortAction.emit(col);
	  }
	  	
	}

	deleteRow(row, column) {
		let item = this.props.ActionButtons.find(p => p.buttonLabel == 'Delete');
		this.sendOutput = {
			"row": row,
			"item": item,
		}
		this.selectedItem.emit(this.sendOutput);
	}

	downloadAction(row,column) {
		this.sendOutput = {
			"row": row,
			"item": {type: 'download'},
		}
		this.selectedItem.emit(this.sendOutput);
	}

	getTrimmedText(str) {
		
		if (str && str.length > 30 && this.ellipse) {
			let txt = str.substring(0, 30);
			return txt;
		} else {
			return str;
		}
	}

	openViewMore(text) {
		let dialogRef = this.dialog.open(ViewMoreDialogComponent);
		dialogRef.componentInstance.text = text;
	}

	// Dialog for Staff Attendance Listing
	openViewBreaksDialog(logData) {
		let dialogRef = this.dialog.open(AttendanceBreakListComponent);
		dialogRef.componentInstance.listData = logData?.staffAttendanceBreaksLog;
	}

	getDataSource(d) {
      return new MatTableDataSource(d);
	}

  getCellWidth(name) {
    switch (name) {
      case 'createdDate':
        return '235px'
      break;

      case 'staffName':
          return '250px'  
      break;

      case 'branchName':
          return '260px'  
      break;

      case 'expand':
        return '70px'  
      break;

      case 'breakType':
        return '150px'  
      break;

	  case 'Actions':
        return '150px'  
      break;
    
      default:
        return '115px'
      break;
    }
  }

  isNameColumn(name) {
	return this.nameColumns.includes(name);
  }

	onMouseEnter() {
		if (this.parentHeight != 'auto') {
			$('.main-layout').mCustomScrollbar("disable");
		}
	}

	onMouseLeave() {
	$('.main-layout').mCustomScrollbar("update");
	}
}



