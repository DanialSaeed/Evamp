import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, ApiService } from 'src/app/services';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import { MatDialog } from '@angular/material/dialog';
// import { getSpecieFieldMsg } from '../../../shared/field-validation-messages';
@Component({
  selector: 'app-declaration',
  templateUrl: './declaration.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class DeclarationComponent  implements OnInit
{
  

  ngOnInit(): void
  {
   

  }

  // getErrorMessage(field: any): any
  // {
  //   return getSpecieFieldMsg[field];
  // }

 
}
