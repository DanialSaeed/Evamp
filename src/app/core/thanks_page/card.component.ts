import { Component, OnInit, Input } from '@angular/core';


@Component({
	selector: 'card',
	templateUrl: './card.component.html',
	styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit
{
	@Input() count: any;
	@Input() value: any;
	@Input() info: any;
	@Input() colortype: any;
	@Input() heading: any;
	@Input() icon: any;
	@Input() imgHeight: any = '40px';
	@Input() hasImage: any;
	@Input() bigCard: any = false;
	@Input() LongCard: any = false;
	@Input() smallCard: any = false;
	@Input() divLikeCard: any = false;
	@Input() textClass: any = false;
	@Input() infoCard: any = false;
	@Input() detailText: any ;



	



	constructor()
	{
		// Logs console.log(this.heading);

	}

	ngOnInit()
	{
	}
}
