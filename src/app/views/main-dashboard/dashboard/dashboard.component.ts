import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { AlertService, ApiService, AutocompleteFiltersService } from 'src/app/services';
import { config } from 'src/config';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  kpiData = {
    roomsCount: 0,
    staffCount: 0,
    bookingsCount: 0,
    childrenCount: 0,
    branchList: []
  }

  branchId = localStorage.getItem('branchId');
  selectedBranch: any;
  branches: any[] = [];
  isGlobal = false;
  role = localStorage.getItem('system_user_role');
  branchLabel: any;
  filteredBranches = [];
  Form: FormGroup;
  
  constructor(private apiService: ApiService, private alertService: AlertService,protected formbuilder: FormBuilder, protected filterService: AutocompleteFiltersService) {

    this.Form = this.formbuilder.group({
       branchLabel: new FormControl('')
    });
		
		// Populate autcomplete data for ageBand
			let branch = this.Form.get('branchLabel').valueChanges.pipe(
				startWith(''),
				map(value => this.filterService._filterStaff(value, this.branches))
			);
			branch.subscribe((d)=> this.filteredBranches =  d);
	        // End
   }

  ngOnInit(): void {
    this.getKpiData();
    this.getBranches();
  }

  getKpiData() {
    let url = `staff/view/dashboard/kpi/` + this.branchId;

    // if (this.selectedBranch) {
    //   url += '?isGlobalDashboard=' + this.isGlobal + '&globalDashboardBranchId=' + this.selectedBranch;
    // }

    this.apiService.get(url).then((res)=> {
      console.log(res);

      if (res.code == 200 || res.code == 201) {
        this.kpiData = res.data;
      } else {
        this.alertService.alertSuccess('Sorry', 'Data not available');
      } 
    })
    .catch(err => console.log(err));
  }

  getBranches(newUrl?: any): any
	{
		let data = [];
		let url = config.base_url_slug +'view/branches?sortBy=name&sortOrder=ASC&attributes=[{"key": "status","value": "1" }]&fetchType=dropdown';
		if (newUrl)
		{
			url = url + newUrl;
		}
		this.apiService.get(url).then(res => {
			if (res.code == 200) {
				this.branches = res.data;
        this.filteredBranches = [...this.branches];
			}
			else
			{
				this.branches = [];
			}
		});
	}

  
	setBranchId() {
		let branch = this.branches.find(x => x.name == this.Form.get('branchLabel').value);
    if (branch) {
      this.branchId = branch.id;
      this.onBranchSelect(branch.id);
    }
	}

  onBranchSelect(id) {
    this.selectedBranch = id;
    this.getKpiData();
  }

}
