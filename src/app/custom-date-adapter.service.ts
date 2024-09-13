import { Inject, Injectable, LOCALE_ID, PLATFORM_ID } from "@angular/core";
import { NativeDateAdapter } from "@angular/material/core";
import { Platform } from "@angular/cdk/platform";
import { getLocaleFirstDayOfWeek } from "@angular/common";
import { MomentDateAdapter } from "@angular/material-moment-adapter";

@Injectable()
export class CustomDateAdapter extends MomentDateAdapter {

  getFirstDayOfWeek() {
    // just a test
    return 1;
  }
}