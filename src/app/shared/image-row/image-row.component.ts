import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'app-image-row',
	templateUrl: './image-row.component.html',
	styleUrls: ['./image-row.component.scss']
})
export class ImageRowComponent implements OnInit
{
	@Input() imageUrl;
	@Input() label;
	onlyImage: boolean = true;


	constructor() { }

	ngOnInit(): void
	{
	}

}
