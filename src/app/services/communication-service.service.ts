import { Injectable, } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService
{
  constructor() { }
  session = new Subject()
  staff = new Subject()
  title = new Subject()
  branch = new Subject()
  child = new Subject()
  booking = new Subject()
  additionalItems = new Subject()
  updateInvoiceListing = new Subject()
  unSavedForm = new Subject()
  discountChildren = new Subject()

  calendarYearChange = new Subject();
  getlistingFilters = new Subject();
  setlistingFilters = new Subject();

  invoiceFilters: any;
  childrenFilters: any;



  setTitle(title: any)
  {
    this.title.next(title) //Triggering an event
  }
  getTitle()
  {
    return this.title.asObservable()
  }
  setBranch(title: any)
  {
    this.branch.next(title) //Triggering an event
  }
  getBranch()
  {
    return this.branch.asObservable()
  }
  setSession(object: any)
  {
    this.session.next(object) //Triggering an event
  }
  getSession()
  {
    return this.session.asObservable()
  }
  setStaff(object: any)
  {
    this.staff.next(object) //Triggering an event
  }
  getStaff()
  {
    return this.staff.asObservable()
  }
  setChild(object: any)
  {
    this.child.next(object) //Triggering an event
  }
  getChild()
  {
    return this.child.asObservable()
  }
  setChildBooking(object: any)
  {
    this.booking.next(object) //Triggering an event
  }
  getChildBooking()
  {
    return this.booking.asObservable()
  }
  setAdditionalItems(object: any)
  {
    this.additionalItems.next(object) //Triggering an event
  }
  getAdditionalItems()
  {
    return this.additionalItems.asObservable()
  }
}
