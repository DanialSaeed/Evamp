import { Component, Input, OnInit, } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AlertService, CommunicationService, PermissionService } from 'src/app/services';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GlobalFormComponent } from 'src/app/shared/global-form';
import * as moment from 'moment';
import { config } from 'src/config';


@Component({
  selector: 'app-additional-item-detail',
  templateUrl: './additional-item-detail.component.html',
  styleUrls: ['/src/app/views/shared-style.scss']
})
export class AdditionalItemDetailComponent extends GlobalFormComponent implements OnInit
{
  @Input() itemData: any;
  selectedChilds = []
  Form: FormGroup;
  calendar: String = "assets/images/sdn/ic_event_24px.svg"
  tableConfigAndProps = {};
  footerProps: any;
  childs: any;
  rateError = false;
  // dataSource = new MatTableDataSource();

  data =
    [
      // {
      //   'id': '1', 'room': 'Room 1', 'childName': 'mazhar', 'item': 'Birthday cake', 'date': '7/05/2021', 'rate': '25'
      // },
    ]
  dataSource = new MatTableDataSource(this.data);

  inputData = {
    'actionColumn': 'Actions',
    'buttonEvent': "output",
    'hasCheckBox': false,

  }
  Actionbuttons = [
    { buttonLabel: "Delete", type: 'delete', buttonRoute: "", visibility: true },
  ]
  // this.permissionsService.getPermissionsBySubModuleName(config.md_child_m, config.sub_md_child_additional_items).delete

  columnHeader = {
    'id': 'ID', 'room': 'Room', 'childName': 'Child Name', 'itemDisplayName': 'Item', 'matDate': 'Date', 'displayRate': 'Rate', 'Actions': 'Actions'
  };

  additionalItems = [];

  constructor(protected router: Router,
    protected _route: ActivatedRoute,
    protected alertService: AlertService,
    protected apiService: ApiService,
    protected formbuilder: FormBuilder,
    protected dialog: MatDialog,
    protected communicationService: CommunicationService,
    protected permissionsService: PermissionService)
  {

    super(router, _route, alertService, apiService, formbuilder, dialog);
    // this.Form = this.formbuilder.group({});
    this.Form.addControl('childIds', new FormControl(null));
    this.Form.addControl('item', new FormControl('', [Validators.required]));
    this.Form.addControl('rate', new FormControl(null));
    this.Form.addControl('matRate', new FormControl(null));
    this.Form.addControl('date', new FormControl('', [Validators.required]));
    this.Form.addControl('matDate', new FormControl('', [Validators.required]));

    let date = new Date();
    this.Form.get('matDate').setValue(date);
    this.Form.get('date').setValue(date);


    this.tableConfigAndProps = {
      ActionButtons: this.Actionbuttons,
      inputData: this.inputData, columnHeader: this.columnHeader, dataSource: this.dataSource,
    };

    // this.listApi = config.base_url_slug +'view/childs';
    // this.getList()

    super.ngOnInit();
    this.footerProps = {
      'subButtonLabel': "Save Info",
      'hasSubButton': true,
      'hasbackButton': true,
      'backButtonLabel': 'Cancel',
      'type': 'output'
    };
  }
  ngOnInit()
  {
    this.formApi = config.base_url_slug + "add/childs/additional-item";
    this.getAdditionalItems();
    // if (localStorage.getItem('additionalItems'))
    // {
    // 	this.childs = JSON.parse(localStorage.getItem('additionalItems'))

    // }
    if (this.itemData)
    {
      this.childs = this.itemData;
      console.log("i got data ", this.childs);

    }
  }

  getAdditionalItems()
  {
    let branchId = localStorage.getItem('branchId');
    let url = config.base_url_slug + 'view/global/additionalItem?branchId=' + branchId + '&perpage=' + 500;
    this.apiService.get(url).then(response =>
    {
      this.additionalItems = response.data.listing;
    })
  }

  getCount(): any
  {
    let rate = 0.00;
    this.data.forEach(element =>
    {
      rate = rate + parseFloat(element.rate);
    });
    return rate;
  }
  onSelectItemFromDropdown(value)
  {
    this.Form.get('matRate').setValue(this.additionalItems.find(x => x.id == this.Form.get('item').value).amount);
  }

  onAddItem(): void
  {
    if (this.Form.valid)
    {
      if (this.childs.length != 0)
      {
        this.childs.forEach(element =>
        {

          this.data.push(
            {
              id: element.id,
              room: element.room.name,
              childName: element.name,
              item: this.additionalItems.find(x => x.id == this.Form.get('item').value).name,
              itemDisplayName: this.additionalItems.find(x => x.id == this.Form.get('item').value).name,
              matDate: moment(this.Form.get('matDate').value).format(config.cmsDateFormat),
              date: moment(this.Form.get('matDate').value).format(config.serverDateFormat),
              rate: this.Form.value.matRate,
              displayRate: '£' + this.Form.value.matRate
            }
            // this.additionalItems.find(x => x.id == this.Form.get('item').value).amount
          )
        });
      }
      this.tableConfigAndProps = {
        ActionButtons: this.Actionbuttons,
        inputData: this.inputData,
        columnHeader: this.columnHeader,
        dataSource: new MatTableDataSource(this.data),
      };
      this.Form.disable();
    }
    else
    {
      this.alertService.alertError('WARNING', 'Please fill the required data.');
    }
  }
  //   onBlurEvent(event)
  //     {
  // 		if (event.target.value.includes('.')) {
  // 			if (event.target.value.split('.')[0] && event.target.value.split('.')[0].length > 6) {
  // 				this.rateError = true;
  // 				return;
  // 			}
  // 		} else {
  // 			if (event.target.value.length > 6) {
  // 				this.rateError = true;
  // 				return;
  // 			}
  // 		}

  //         if (event.target.value <= 0 || event.target.value == "")
  //         {
  //             this.Form.controls['rate'].setErrors({ 'incorrect': true });
  //             this.Form.controls['matRate'].setErrors(null);
  //         }
  //         else
  //         {
  //             this.Form.controls['rate'].setErrors(null);
  //             this.Form.controls['matRate'].setErrors(null);
  //             this.Form.controls['rate'].patchValue(parseFloat(event.target.value).toFixed(2))
  //         }
  //     }

  onBlurEvent(event)
  {
    if (event.target.value == 0 || event.target.value < 0)
    {
      this.Form.get('rate').setValue(null);
      this.Form.get('matRate').setValue(null);
      return;
    }

    if (event.target.value.includes('.'))
    {
      event.target.value = parseFloat(parseFloat(event.target.value).toFixed(2));
      this.Form.get('rate').setValue(event.target.value);
    } else
    {
      this.Form.get('rate').setValue(event.target.value);
    }
  }
  actionButtonOutput(event)
  {
    if (event.item.type === "delete")
    {
      let heading = 'Delete Item?';
      let message = 'Are you sure you want to delete ?';
      let rightButton = 'Delete';
      let leftButton = 'Cancel';
      this.alertService.alertAsk(heading, message, rightButton, leftButton, false).then(result =>
      {
        if (result)
        {
          for (var i = 0; i < this.data.length; i++)
          {
            if (this.data[i].id == event.row.id)
            {
              this.data.splice(i, 1);

            }
          }
          this.tableConfigAndProps = {
            ActionButtons: this.Actionbuttons,
            inputData: this.inputData,
            columnHeader: this.columnHeader,
            dataSource: new MatTableDataSource(this.data),
          };
          if (this.data.length == 0)
          {
            this.Form.enable();
          }
        }
      });
    }
  }

  onSaveInfo()
  {
    if (this.data.length > 0)
    {
      var childIds = []
      this.data.forEach(element =>
      {
        childIds.push(element.id)

      });
      this.Form.get('childIds').setValue(childIds)
      this.Form.get('item').setValue(this.data[0].item)
      this.Form.get('rate').setValue(this.data[0].rate)
      this.Form.get('date').setValue(this.data[0].date)
      this.isMultiple = true;
      this.onSubmit();
    }
    else
    {
      this.alertService.alertError('WARNING', 'Please fill the required data.');
    }
  }



  afterSuccessfullyAdd()
  {
    // localStorage.removeItem('additionalItems')
    this.router.navigateByUrl('main/additional-items')
  }

}


