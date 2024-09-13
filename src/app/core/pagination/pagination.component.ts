import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';
@Component({
	selector: 'app-pagination',
	templateUrl: './pagination.component.html',
	styleUrls: ['./pagination.scss']
})
export class PaginationComponent implements OnInit
{

	@Output() setPage: EventEmitter<any>;
	@Input() perPage: number;
	@Input() totalPages: number;
	@Input() currentPage: number;
	@ViewChild('dropdown') dropdown: ElementRef<HTMLInputElement>;

	constructor()
	{
		this.setPage = new EventEmitter();
		this.perPage = 20;
		this.totalPages = 0;
		this.currentPage = 1;
	}

	ngOnInit()
	{
    console.log("currentPage",this.currentPage);
  }

	makePagination(page): void
	{
		let dict = {page: page, perPage: this.perPage};
		this.setPage.emit(dict);
	}

	onChangePerPage(): void
	{
		// this.paginationService.perPage = this.perPage;
		// this.onPerPageOutput.emit()
		this.dropdown.nativeElement.blur();
		let dict = {page: 1, perPage: this.perPage};
		this.setPage.emit(dict);
	}

}
