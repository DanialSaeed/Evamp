import { Directive, ElementRef, HostListener } from '@angular/core';
declare let $: any;

@Directive({
  selector: '[appHorizontalScroll]'
})
export class HorizontalScrollDirective {

  isShiftKeyPressed = false;

  constructor(private element: ElementRef) {}

  @HostListener('window:keydown.shift')
  onShiftKeyDown(event: KeyboardEvent) {
    this.isShiftKeyPressed = true;
  }

  @HostListener('window:keyup.shift')
  onShiftKeyUp() {
    this.isShiftKeyPressed = false;
    $('.main-layout').mCustomScrollbar("update");
  }

  @HostListener("wheel", ["$event"])
  onScroll(event: WheelEvent) {
    if (this.isShiftKeyPressed) {
      $('.main-layout').mCustomScrollbar("disable");
      // $('.main-layout').mCustomScrollbar("disable");
      // $('.data-table').mCustomScrollbar('scrollTo', 'right',{
      //   scrollInertia:3000
      // });
      this.element.nativeElement.scrollLeft += event.deltaY;
    }
  }



}
