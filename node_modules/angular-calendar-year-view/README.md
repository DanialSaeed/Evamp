# angular 6.0+ calendar year view

## Demo
Live Demo: https://angular-ft5znm.stackblitz.io/

## How it looks
![Image description](https://i.imgur.com/IafcF0j.png)

 

## Getting started
First install through npm:

```bash
npm i angular-calendar-year-view --save
```

You need to import in your index.html:

```html
  <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" rel="stylesheet">

  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"/>
```

## Usage
Finally import the calendar module into your apps module:

```typescript
import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularCalendarYearViewModule } from 'angular-calendar-year-view';

@NgModule({
  imports: [
    BrowserModule,
    AngularCalendarYearViewModule
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
})
export class MyModule {}
```
Use the view in your html:
```html
<angular-calendar-year-view  
       [themecolor]="themecolor" 
       [events]="events"  
       [viewDate]="viewDate"  
       [nothingToshowText]="nothingToshowText"
       (eventClicked)="eventClicked($event)" 
       (actionClicked)="actionClicked($event)" >
</angular-calendar-year-view>
```
In your typescript:

```typescript
nothingToshowText:any='Nothing to show'; // "By default" => There are no events scheduled that day. 
const colors: any = {
    red: {
      primary: '#ad2121',
      secondary: '#FAE3E3'
    },
    yellow: {
      primary: '#e3bc08',
      secondary: '#FDF1BA'
    }
  };
  actions: any[] = [
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      name: 'delete'
    },
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      name: 'edit'
    }
  ];
  events: any = [
    {
      start: new Date(),
      end: new Date(),
      title: 'title event 1',
      color: this.colors.red,
      actions: this.actions
    },
    {
      start: new Date(),
      end: new Date(),
      title: 'title event 2',
      color: this.colors.yellow,
      actions: this.actions
    }
  ]
  viewDate: Date = new Date();
  themecolor: any = '#0a5ab3'
```
```typescript
  eventClicked(event) {
    console.log(event);
  }
   actionClicked(event) {
    console.log('action',event.action)
    console.log('event',event.event)
  }
```
## Custom popover template
 ![Image description](https://i.imgur.com/qFxZnIX.png)
```html
<angular-calendar-year-view  [events]="events"  [viewDate]="viewDate" [customTemplate]="Customtemplate" ></angular-calendar-year-view>
<ng-template #Customtemplate>
        My custom template
</ng-template>
```
## Set locale language
In your apps module:
```typescript
import { NgModule,CUSTOM_ELEMENTS_SCHEMA,LOCALE_ID  } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
@NgModule({
  imports: [
    AngularCalendarYearViewModule
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'fr'
    }
  ]
})
export class MyModule {}
```
## Inputs
| Input | description |
| ------ | ------ |
| themecolor | By default is #ff0000 |
| events | Events List |
| viewDate | It take the current date by default |
| nothingToshowText |By default => There are no events scheduled that day.   |
| popoverEnabled | true  by default |
| customTemplate | You can pass your temlate to popover  |


## Outputs
| Output | description |
| ------ | ------ |
| eventClicked | When event was clicked |
| actionClicked | When action was clicked |
| dayClicked | When day was clicked |


## License
MIT
