import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService, ApiService } from 'src/app/services';
import { config } from 'src/config';

@Component({
	selector: 'app-all-settings',
	templateUrl: './all-settings.component.html',
	styleUrls: ['/src/app/views/shared-style.scss']
})
export class AllSettingsComponent implements OnInit
{

	branches: any
	imageIndex = 0
	branchId: any
	imagesData1: any = [
		"assets/images/sdn/Group 491.svg",
		"assets/images/sdn/Group 492.svg",
		"assets/images/sdn/Group 493.svg",
		"assets/images/sdn/Group 494.svg"
	];
	@Output() open: EventEmitter<any> = new EventEmitter();
	constructor(protected router: Router,
		protected _route: ActivatedRoute,
		protected alertService: AlertService,
		protected apiService: ApiService,
	)
	{
		this.branchId = localStorage.getItem('branchId');
	}

	ngOnInit(): void
	{
		this.getBranches()
	}

	getBranches(newUrl?: any): any
	{
		let data = [];
		let url = config.base_url_slug +'view/branches?sortBy=name&sortOrder=ASC&attributes=[{"key": "status","value": "1" }]&fetchType=dropdown';
		if (newUrl)
		{
			url = url + newUrl;
		}
		this.apiService.get(url).then(res =>
		{
			if (res.code == 200)
			{
				let outerIndex = 0;
				res.data.forEach((element, index) =>
				{
					if (outerIndex < 4)
					{
						let dict = {
							key: 'branchId',
							value: element.id,
							label: element.name,
							image: this.imagesData1[outerIndex],
							operationalPeriod: element.operationalPeriod
						}
						outerIndex++;
						data.push(dict);
					}

					if(outerIndex == 4)
					{
						outerIndex = 0;
					}

				});

				this.branches = data;
			}
			else
			{
				this.branches = [];
			}
		});
	}

	onClick(branch)
	{
		let url = 'staff/set/staff-member/branch/' + branch.value;
		this.apiService.post(url,{}).then((res)=> {
			console.log(res);
			if (res.code == 200 || res.code == 201) {
			  this.open.emit(branch);
			}
		  })
		  .catch(err => console.log(err));
	}
	// getImages()
	// {
	// 	let url

	// 	if (this.imageIndex == 3)
	// 	{
	// 		url = this.imagesData1[this.imageIndex]
	// 		this.imageIndex = 0
	// 	}
	// 	else
	// 	{
	// 		url = this.imagesData1[this.imageIndex]
	// 		this.imageIndex++
	// 	}
	// 	return url
	// }

}
