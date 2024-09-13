import { Component, OnInit, Input,Output, EventEmitter} from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
@Component({
	selector: 'app-app-headers',
	templateUrl: './app-headers.component.html',
	styleUrls: ['./app-headers.component.scss']
})
export class AppHeadersComponent implements OnInit
{

	@Input() headingLabelDivWidth = '27';
	@Input() fxFlexInSortForFilter = '210px';
	@Input() fxFlexInSearchForFilter = '260px';
	@Input() hasToggle = false;
	@Input() isTwoRowsFilter = false;
	@Input() currentScreen = '';
	@Input() showLegends = false;
	@Input() legendColor: any;
	@Input() legendLabel: any;
	@Input() headerProps: {
		headingLabel: string;
		rightLabel: string;
		ActionButtons: any;
		hasButton: boolean,
		hasHeading: boolean,
		showBack: boolean,
		hasRightLabel: boolean,
		colortype: any,
		labelMargin: any,
		buttonsMargin: any
		float: any;
		margin: any;
		padding:any;
		textclass: "text-normal dark-blue-color";
		hasFlex: any;
		buttonFlex: any;
		hasFilters:boolean;
		searchConfig:any;
		builtInFilters:any;
		filterArray:any;
		headingLabelDivWidth: any;

	};
	filterArray: any;
    @Output() filnalFilters: EventEmitter<any> = new EventEmitter<any>();
    @Output() outPutHeaders: EventEmitter<any> = new EventEmitter<any>();



	constructor(protected router: Router, private location: Location)
	{
		this.filterArray = [
			{
			    label: 'Sort by ', type: 'sort', key: 'name' ,selected: 'All',
			    options: [
			        { key: 'All', value: 'All', label: 'All' },
			        { key: 'ASC', value: 'ASC', label: 'Ascending' },
			        { key: 'DESC', value: 'DESC', label: 'Descending' }
			    ]
			},
			// {
			// 	label: 'Filter by Status', type: 'filter', key: 'status', selected: 'All',
			// 	options: [
			// 		{ key: 'All', value: 'All', label: 'All' },
			// 		{ key: 'status', value: true, label: 'Active' },
			// 		{ key: 'status', value: false, label: 'Inactive' }
			// 	]
			// },
		]

	}

	ngOnInit(): void
	{
        if(this.headerProps?.filterArray)
		{
			this.filterArray=this.headerProps?.filterArray;
		}
		console.log(this.headerProps);
		
	}

	goback()
	{
		this.location.back();
	}
    filtersChange(event)
	{
		this.filnalFilters.emit(event);
	}

	onTableHeaderButton(item): void
	{
		if (item.type=="output")
		{
			this.outPutHeaders.emit(item);
		} else {
			// this.router.navigateByUrl('/main/' + item.buttonRoute + '/new');
			let url = '/main/' + item.buttonRoute + '/new';
            if (item.isMultiple) {
				var routeArray = item.buttonRoute.split('/');
				var endPoint = routeArray[routeArray.length - 1];
                url = url + '/' + item.firstFormName + '/' + endPoint + '/new';
            }
            this.router.navigateByUrl(url);
		}
		// this.router.navigate(['/main/' + this.props.buttonRoute], {
		// 	state: { type: this.props.buttonLabel }
		//   });
	}
}
