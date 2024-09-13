import { Component, OnInit } from '@angular/core';
import { ApiService, AlertService } from 'src/app/services';
import { config } from 'src/config';

@Component({
  selector: 'app-global-dashboard',
  templateUrl: './global-dashboard.component.html',
  styleUrls: ['./global-dashboard.component.scss']
})
export class GlobalDashboardComponent implements OnInit {

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
  
  constructor(private apiService: ApiService, private alertService: AlertService, ) { }

  ngOnInit(): void {
    this.getKpiData();
  }

  getKpiData() {
    let url = `staff/view/dashboard/kpi/` + this.branchId;

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


}
