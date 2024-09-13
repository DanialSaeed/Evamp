import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-top-table-header',
	templateUrl: './top-table-header.component.html',
	styleUrls: ['./top-table-header.component.scss']
})
export class TopTableHeaderComponent implements OnInit
{
	@Input() props: {
		headingLabel: string;
		buttonLabel: string;
		buttonRoute: string;
	};

	constructor(protected router: Router) { }

	ngOnInit(): void
	{

	}

	onTableHeaderButton(): void
	{
		this.router.navigateByUrl('/main/' + this.props.buttonRoute + '/new');
		// this.router.navigate(['/main/' + this.props.buttonRoute], { 
		// 	state: { type: this.props.buttonLabel } 
		//   });
	}
}
