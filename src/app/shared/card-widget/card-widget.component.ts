import { Component, OnInit, Input } from '@angular/core';


@Component({
	selector: 'card-widget',
	templateUrl: './card-widget.component.html',
	styleUrls: ['./card-widget.component.scss']
})
export class CardWidgetComponent implements OnInit
{
	@Input() count: any;
	@Input() counttype: any;
	@Input() heading: any;
	@Input() icon: any;
	// @Input() imgHeight: any = '55px';
	
	constructor()
	{
		// console.log(this.heading);

	}

	ngOnInit()
	{
	}
}
