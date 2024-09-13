import { Component, OnInit,Input } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-top-heading',
  templateUrl: './top-heading.component.html',
  styleUrls: ['./top-heading.component.scss']
})
export class TopHeadingComponent implements OnInit {
  @Input() title:any;
  @Input() showBack1:any;
   showBack=false
  
  constructor(private location: Location) { }

  ngOnInit(): void {
    this.showBack=this.showBack1
  }
  goback()
	{
		this.location.back();
	}
}
