import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss']
})
export class SessionsComponent implements OnInit
{
  @Input() attendanceDate: any;
  constructor() { }

  ngOnInit(): void
  {
    // console.log("attendanceDate",this.attendanceDate);

  }

}
