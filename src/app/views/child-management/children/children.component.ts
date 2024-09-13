import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-children',
  templateUrl: './children.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class ChildrenComponent implements OnInit
{

  idToSend: any;
  constructor(){

  }

  ngOnInit(){

  }
}
