import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-more-dialog',
  templateUrl: './view-more-dialog.component.html',
  styleUrls: ['./view-more-dialog.component.scss']
})
export class ViewMoreDialogComponent implements OnInit {

  text = '';
  constructor(private router: Router) { }

  ngOnInit(): void {
  }

}
