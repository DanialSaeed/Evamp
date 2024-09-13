// Angular core imports

import { NgModule, CUSTOM_ELEMENTS_SCHEMA, } from '@angular/core';
import { APP_BASE_HREF, LocationStrategy, PathLocationStrategy } from '@angular/common';

// Module File imports

import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { MaterialModule } from './material.module';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularCalendarYearViewModule } from 'projects/angular-calendar-year-view/src/public-api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldDefaultOptions, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { CalendarModule } from 'projects/angular-calendar/src/modules/calendar.module';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { NgxMaskModule } from 'ngx-mask';
import { AgmCoreModule } from '@agm/core';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { DateAdapter, MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import {  RxReactiveFormsModule } from "@rxweb/reactive-form-validators";
import { MomentDateModule } from '@angular/material-moment-adapter';
import { MatInputModule } from '@angular/material/input';

// Component imports

import { AppComponent } from './app.component';
import { AdhocInvoiceComponent } from './views/finance-management/invoice/adhoc-invoice/adhoc-invoice.component';
import { AuthAppLoginComponent } from './templates/auth-app/auth-app-login.component';
import { LoginComponent, ForgotComponent, OTPComponent } from './templates/auth-app';
import { TableComponentComponent } from './core/table-component/table-component.component';
import { InvokeDirective } from "./eachRow";
import { MainAppComponent } from './templates/main-app/main-app.component';
import { ParentFormComponent } from './shared/parent-form.component';
import { GlobalListComponent } from './shared/global-list';
import { GlobalFormComponent } from './shared/global-form';
import { TopTableHeaderComponent } from './shared/top-table-header/top-table-header.component';
import { TopHeadingComponent } from './shared/top-heading/top-heading.component';
import { CardWidgetComponent } from './shared/card-widget/card-widget.component';
import { ImageRowComponent } from './shared/image-row/image-row.component';
import { AuthGuard } from './guards/auth.guard';
import { ViewsGuard } from './guards/views.guard';
import { ApiService, LoaderService, AlertService,AutocompleteFiltersService, UtilsService } from './services';
import {
	// NgxMatDatetimePickerModule,
	NgxMatNativeDateModule,
	// NgxMatTimepickerModule
  } from '@angular-material-components/datetime-picker';
import { FormFoooterComponent } from './shared/form-foooter/form-foooter.component';
import { ConfigAlertComponent } from './shared/config-alert/config-alert.component';
import { BranchManagementComponent } from './views/branch-management/branch-management.component';
import { BranchFormComponent } from './views/branch-management/branch-form/branch-form.component';
import { RoomListComponent } from './views/branch-management/room-list/room-list.component';
import { RoomFormComponent } from './views/branch-management/room-form/room-form.component';
import { SessionListComponent } from './views/session/session-list/session-list.component';
import { SessionFormComponent } from './views/session/session-form/session-form.component';
import { BookingDetailComponent } from './views/child-management/child-booking/add-booking/booking-detail/booking-detail.component';
import { StaffAllocationComponent } from './views/hr-management/staff-allocation/staff-allocation.component';
import { AllocationFormComponent } from './views/hr-management/staff-allocation/allocation-form/allocation-form.component';
import { AllocationListComponent } from './views/hr-management/staff-allocation/allocation-list/allocation-list.component';
import { StaffComponent } from './views/hr-management/staff/staff.component';
import { StaffDetailComponent } from './views/hr-management/staff/staff-detail/staff-detail.component';
import { DeclarationComponent } from './views/hr-management/staff/declaration/declaration.component';
import { BranchListComponent } from './views/branch-management/branch-list/branch-list.component';
import { InformationFormComponent } from './views/session/session-form/information-form/information-form.component';
import { PricingFormComponent } from './views/session/session-form/pricing-form/pricing-form.component';
import { AddressComponent } from './core/address/address.component';
import { CalenderComponent } from './views/hr-management/view-calender/calender/calender.component';
import { FullCalanderComponent } from './views/hr-management/view-calender/full-calander/full-calander.component';
import { DateAdapter as CalendarDateAdapter}  from 'projects/angular-calendar/src/modules/calendar.module';
import { adapterFactory } from 'projects/angular-calendar/src/date-adapters/date-fns';
import { DashboardComponent } from './views/main-dashboard/dashboard/dashboard.component';
import { ViewCalenderComponent } from './views/hr-management/view-calender/view-calender.component';
import { HolidaysComponent } from './views/hr-management/view-calender/holidays/holidays.component';
import { ContractSettingsComponent } from './views/hr-management/staff/create-staff/contract-settings/contract-settings.component';
import { PersonalDetailsComponent } from './views/hr-management/staff/create-staff/personal-details/personal-details.component';
import { ShiftPatternComponent } from './views/hr-management/staff/create-staff/shift-pattern/shift-pattern.component';
import { ActivePatternComponent } from './views/hr-management/staff/create-staff/shift-pattern/active-pattern/active-pattern.component';
import { ArchivePatternComponent } from './views/hr-management/staff/create-staff/shift-pattern/archive-pattern/archive-pattern.component';
import { ShiftPatternDialogComponent } from './views/hr-management/staff/create-staff/shift-pattern/shift-pattern-dialog/shift-pattern-dialog.component';
import { CreateStaffComponent } from './views/hr-management/staff/create-staff/create-staff.component';
import { ChildrenComponent } from './views/child-management/children/children.component';
import { BasicInformationComponent } from './views/child-management/enrolment/basic-information/basic-information.component';
import { GuardianInformationComponent } from './views/child-management/enrolment/guardian-information/guardian-information.component';
import { MedicalInformationComponent } from './views/child-management/enrolment/medical-information/medical-information.component';
import { EmergencyDetailsComponent } from './views/child-management/enrolment/emergency-details/emergency-details.component';
import { FundingComponent } from './views/child-management/enrolment/funding/funding.component';
import { EnrolmentComponent } from './views/child-management/enrolment/enrolment.component';
import { ChildOffboardingComponent } from './views/child-management/children/active-children/childOffboarding/childOffboarding.component';
import { ChildBookingComponent } from './views/child-management/child-booking/child-booking.component';
import { ActiveBookingComponent } from './views/child-management/child-booking/active-booking/active-booking.component';
import { ArchiveBookingComponent } from './views/child-management/child-booking/archive-booking/archive-booking.component';
import { AddBookingComponent } from './views/child-management/child-booking/add-booking/add-booking.component';
import { SelectChildComponent } from './views/child-management/child-booking/add-booking/select-child/select-child.component';
import { MainDashboardComponent } from './views/main-dashboard/main-dashboard.component';
import { AllSettingsComponent } from './views/main-dashboard/all-settings/all-settings.component';
import { AdditionalItemsComponent } from './views/child-management/additional-items/additional-items.component';
import { AddAdditionalItemsComponent } from './views/child-management/additional-items/add-additional-items/add-additional-items.component';
import { AdditionalItemDetailComponent } from './views/child-management/additional-items/add-additional-items/additional-item-detail/additional-item-detail.component';
import { SelectChildrenComponent } from './views/child-management/additional-items/add-additional-items/select-children/select-children.component';
import { AdditionalDialogComponent } from './views/child-management/additional-items/additional-dialog/additional-dialog.component';
import { TimePicker } from './core/timepicker/timepicker';
import { TimePickerComponent } from './core/timepicker/timepicker.component';
import { AccessManagementComponent } from './views/global-settings/access-management/access-management.component';
import { UserRolesComponent } from './views/global-settings/access-management/user-roles/user-roles.component';
import { RolesPrivilagesComponent } from './views/global-settings/access-management/roles-privilages/roles-privilages.component';
import { AttendanceComponent } from './views/child-management/attendance/attendance.component'
import { AttendanceDialogComponent } from './views/child-management/attendance/attendance-dialog/attendance-dialog.component';
import { AttendanceDetailComponent } from './views/child-management/attendance/attendance-detail/attendance-detail.component';
import { StaffAttendanceDetailComponent } from './views/child-management/attendance/staff-attendance-detail/staff-attendance-detail.component';
import { ChildAttendanceReportComponent } from './views/report-management/child-attendance-report.component';
import { InvoiceComponent } from './views/finance-management/invoice/invoice.component';
import { CreditListComponent } from './views/finance-management/credits/credit-list.component';
import { CreditComponent } from './views/finance-management/credits/addcredit/credit.component';
import { CreditDetailComponent } from './views/finance-management/credits/addcredit/credit-detail/credit-detail.component';
import { SelectItemComponent } from './views/finance-management/credits/addcredit/select-item/select-item.component';
import { NetworkInterceptor } from './network.interceptor';
import { AllInvoiceListingComponent } from './views/finance-management/invoice/all-invoice-listing/all-invoice-listing.component';
import { InvoiceTableComponent } from './views/finance-management/invoice/invoice-table/invoice-table.component';
import { GenerateInvoiceComponent } from './views/finance-management/invoice/generate-invoice/generate-invoice.component';
import { SelectChildInvoiceComponent } from './views/finance-management/invoice/generate-invoice/select-child-invoice/select-child-invoice.component';
import { ProcessInvoiceComponent } from './views/finance-management/invoice/generate-invoice/process-invoice/process-invoice.component';
import { MultipleBookingsComponent } from './shared/multiple-bookings/multiple-bookings.component';
import { InvoiceBookingListingComponent } from './views/finance-management/invoice/invoice-booking-listing/invoice-booking-listing.component';
import { DiscrepancyHistoryComponent } from './views/child-management/attendance/discrepancy-history/discrepancy-history.component';
import { StaffDiscrepancyHistoryComponent } from './views/child-management/attendance/staff-discrepancy-history/staff-discrepancy-history.component';
import { ViewMoreDialogComponent } from './shared/view-more-dialog/view-more-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EndBookingDialogComponent } from './shared/end-booking-dialog/end-booking-dialog.component';
import { GlobalDashboardComponent } from './views/main-dashboard/global-dashboard/global-dashboard.component';
import { AttendanceBreakListComponent } from './shared/attendance-break-list/attendance-break-list.component';
import { StaffAttendanceTableComponent } from './core/staff-attendance-table/staff-attendance-table.component';
import { ChildAttendanceTableComponent } from './core/child-attendance-table/child-attendance-table.component';
import { StaffAttendanceDialogComponent } from './views/child-management/attendance/staff-attendance-dialog/staff-attendance-dialog.component';
import { StaffAttendanceReportComponent } from './views/report-management/staff-attendance-report/staff-attendance-report.component';
import { CustomDateAdapter } from './custom-date-adapter.service';
import { AddAttendanceDialogComponent } from './views/child-management/attendance/add-attendance-dialog/add-attendance-dialog.component';
import { CustomRangePanelComponent } from './core/date-range-presets/date-range-presets.component';
import { DateRangeHeaderCustomComponent } from './core/date-range-header-custom/date-range-header-custom.component';
import { HorizontalScrollDirective } from './directives/horizontal-scroll.directive';
import { SessionRateHistoryComponent } from './views/session/session-form/pricing-form/session-rate-history/session-rate-history.component';
import { GuardianComponent } from './views/child-management/guardian/guardian.component';
import { AddGuardianComponent } from './views/child-management/guardian/add-guardian/add-guardian.component';
import { FinancialSettingsComponent } from './views/branch-management/financial-settings/financial-settings.component';
import { LinkedChildrenComponent } from './views/child-management/guardian/add-guardian/linked-children/linked-children.component';
import { ChildLinkModalComponent } from './views/child-management/guardian/add-guardian/child-link-modal/child-link-modal.component';
import { RoomManagementComponent } from './views/child-management/enrolment/room-management/room-management.component';
import { GuardiansChildsComponent } from './views/child-management/enrolment/guardians-childs/guardians-childs.component';
import { LinkedGuardiansComponent } from './views/child-management/enrolment/guardians-childs/linked-guardians/linked-guardians.component';
import { GlobalAdditionalItemsComponent } from './views/global-settings/global-additional-items/global-additional-items.component';
import { GlobalAddAdditionalItemsComponent } from './views/global-settings/global-additional-items/global-add-additional-items/global-add-additional-items.component';
import { GlobalAdditionalDialogComponent } from './views/global-settings/global-additional-items/global-additional-dialog/global-additional-dialog.component';
import { BookingTypeDialogComponent } from './shared/booking-type-dialog/booking-type-dialog.component';
import { AdhocBookingDetailComponent } from './views/child-management/child-booking/add-booking/adhoc-booking-detail/adhoc-booking-detail.component';
import { MultipleBookingDetailComponent } from './views/child-management/child-booking/add-booking/multiple-booking-detail/multiple-booking-detail.component';
import { BookingPatterenDialogComponent } from './shared/booking-patteren/booking-patteren-dialog.component';
import {  FundingInformationComponent } from './views/child-management/enrolment/funding-information/funding-information.component';
import { AddFundingInformationComponent } from './views/child-management/enrolment/funding-information/add-funding-information/add-funding-information.component';
import { AdvancedSettingsDialogComponent } from './shared/advanced-settings-dialog/advanced-settings-dialog.component';
import { OverrideReccuringDialogComponent } from './shared/override-reccuring-dialog/override-reccuring-dialog.component';
import { OffboardingDetailsComponent  } from './views/child-management/children/active-children/childOffboarding/offboarding-details/offboarding-details.component';
import { BookingInformationComponent  } from './views/child-management/children/active-children/childOffboarding/booking-information/booking-information.component';

import { ActiveChildrenComponent } from './views/child-management/children/active-children/active-children.component';
import { AllChildrenComponent } from './views/child-management/children/all-children/all-children.component';
import { OffboardFundingInfoComponent } from './views/child-management/children/active-children/childOffboarding/offboard-funding-info/offboard-funding-info.component';
import { ChildSummaryComponent } from './views/child-management/children/active-children/childOffboarding/child-summary/child-summary.component';
import { AdditionalItemsFormDialogComponent } from './shared/additional-items-form-dialog/additional-items-form-dialog.component';
import { ManualAttendanceComponent } from './views/child-management/attendance/manual-attendance/manual-attendance.component';
import { AddManualAttendanceDialogComponent } from './views/child-management/attendance/manual-attendance/add-manual-attendance-dialog/add-manual-attendance-dialog.component';
import { ChildAttendanceDialogComponent } from './views/child-management/attendance/manual-attendance/child-attendance-dialog/child-attendance-dialog.component';
import { UnbookedSessionsComponent } from './views/child-management/attendance/attendance-detail/unbooked-sessions/unbooked-sessions.component';
import { BookedSessionsComponent } from './views/child-management/attendance/attendance-detail/booked-sessions/booked-sessions.component';
import { SessionsComponent } from './views/child-management/attendance/attendance-detail/sessions/sessions.component';


const appearance: MatFormFieldDefaultOptions = {
	appearance: 'outline'
};

export const MY_DATE_FORMATS = {
    parse: {
      dateInput: 'DD/MM/YYYY',
    },
    display: {
      dateInput: 'DD/MM/YYYY',
      monthYearLabel: 'MMMM YYYY',
      dateA11yLabel: 'LL',
      monthYearA11yLabel: 'MMMM YYYY'
    },
};

@NgModule({

	imports: [
		RouterModule,
		BrowserModule,
		AppRoutingModule,
		ReactiveFormsModule,
		BrowserAnimationsModule,
		FlexLayoutModule,
		MaterialModule,
		CoreModule,
		UiSwitchModule,
		UiSwitchModule, FormsModule,
		HttpClientModule,
		// NgxMatDatetimePickerModule,
		// NgxMatTimepickerModule,
		// NgxMatNativeDateModule,
		NgxMaterialTimepickerModule,
		NgxMaskModule.forRoot(),
		MalihuScrollbarModule.forRoot(),
		AngularCalendarYearViewModule.forRoot(),
		CalendarModule.forRoot({
			provide: CalendarDateAdapter,
			useFactory: adapterFactory
		}),
		MatGoogleMapsAutocompleteModule,
		AgmCoreModule.forRoot({
			apiKey: 'AIzaSyCE-pIIADNwC_gDRKGAdbU7wA4SkMV0TR0',
			libraries: ['places']
		}),
		NgxMatNativeDateModule,
		// NgxMatMomentModule,
		NgxMatTimepickerModule,
		NgxMatDatetimePickerModule,
		RxReactiveFormsModule,
		MomentDateModule,
		MatInputModule,
		MatNativeDateModule
	],
	declarations: [
		AppComponent,
		AuthAppLoginComponent,
		LoginComponent,
		OTPComponent,
		ForgotComponent,
		TableComponentComponent,
		InvokeDirective,
		MainAppComponent,
		TopTableHeaderComponent,
		TopHeadingComponent,
		CardWidgetComponent,
		ImageRowComponent,
		ParentFormComponent,
		GlobalListComponent,
		GlobalFormComponent,
		FormFoooterComponent,
		ConfigAlertComponent,
		BranchManagementComponent,
		BranchFormComponent,
		RoomListComponent,
		RoomFormComponent,
		SessionListComponent,
		SessionFormComponent,
		BookingDetailComponent,
		StaffAllocationComponent,
		AllocationFormComponent,
		AllocationListComponent,
		StaffComponent,
		StaffDetailComponent,
		DeclarationComponent,
		BranchListComponent,
		InformationFormComponent,
		PricingFormComponent,
		AddressComponent,
		CalenderComponent,
		FullCalanderComponent,
		DashboardComponent,
		ViewCalenderComponent,
		HolidaysComponent,
		ContractSettingsComponent,
		PersonalDetailsComponent,
		ShiftPatternComponent,
		ActivePatternComponent,
		ArchivePatternComponent,
		CreateStaffComponent,
		ChildrenComponent,
		BasicInformationComponent,
		GuardianInformationComponent,
		MedicalInformationComponent,
		EmergencyDetailsComponent,
		FundingComponent,
		EnrolmentComponent,
		ChildBookingComponent,
		ActiveBookingComponent,
		ArchiveBookingComponent,
		AddBookingComponent,
		SelectChildComponent,
		MainDashboardComponent,
		AllSettingsComponent,
		AdditionalItemsComponent,
		AddAdditionalItemsComponent,
		AdditionalItemDetailComponent,
		SelectChildrenComponent,
		AdditionalDialogComponent,
		TimePicker,
		TimePickerComponent,
		AccessManagementComponent,
		UserRolesComponent,
		RolesPrivilagesComponent,
		ShiftPatternDialogComponent,
		AttendanceComponent,
		AttendanceDialogComponent,
		AttendanceDetailComponent,
        StaffAttendanceDetailComponent,
		ChildAttendanceReportComponent,
		InvoiceComponent,
		CreditListComponent,
		CreditComponent,
		CreditDetailComponent,
		SelectItemComponent,
		AllInvoiceListingComponent,
		InvoiceTableComponent,
		GenerateInvoiceComponent,
		SelectChildInvoiceComponent,
		ProcessInvoiceComponent,
		AdhocInvoiceComponent,
		MultipleBookingsComponent,
		InvoiceBookingListingComponent,
		DiscrepancyHistoryComponent,
		StaffDiscrepancyHistoryComponent,
		ViewMoreDialogComponent,
		EndBookingDialogComponent,
		GlobalDashboardComponent,
		AttendanceBreakListComponent,
		StaffAttendanceTableComponent,
    ChildAttendanceTableComponent,
		StaffAttendanceDialogComponent,
		StaffAttendanceReportComponent,
		AddAttendanceDialogComponent,
		CustomRangePanelComponent,
		DateRangeHeaderCustomComponent,
		HorizontalScrollDirective,
		SessionRateHistoryComponent,
		GuardianComponent,
		AddGuardianComponent,
		FinancialSettingsComponent,
		LinkedChildrenComponent,
		ChildLinkModalComponent,
		RoomManagementComponent,
		GuardiansChildsComponent,
		LinkedGuardiansComponent,
		GlobalAdditionalItemsComponent,
		GlobalAddAdditionalItemsComponent,
		GlobalAdditionalDialogComponent,
		FinancialSettingsComponent,
		BookingTypeDialogComponent,
		AdhocBookingDetailComponent,
		MultipleBookingDetailComponent,
        BookingPatterenDialogComponent,
		FundingInformationComponent,
		AddFundingInformationComponent,
		AdvancedSettingsDialogComponent,
		OverrideReccuringDialogComponent,
        ChildOffboardingComponent,
        OffboardingDetailsComponent,
        BookingInformationComponent,
		ActiveChildrenComponent,
		AllChildrenComponent,
		OffboardFundingInfoComponent,
        ChildSummaryComponent,
        AdditionalItemsFormDialogComponent,
        ManualAttendanceComponent,
        AddManualAttendanceDialogComponent,
        ChildAttendanceDialogComponent,
        UnbookedSessionsComponent,
        BookedSessionsComponent,
        SessionsComponent
	],
	providers: [
		ApiService,
		LoaderService,
		AlertService,
		AuthGuard, ViewsGuard,
		UtilsService,
		AutocompleteFiltersService,
		{
			provide: DateAdapter,
			useClass: CustomDateAdapter
		},
		{
			provide: MatDialogRef,
			useValue: {}
		},
		{
			provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
			useValue: appearance
		},
		{ provide: LocationStrategy, useClass: PathLocationStrategy },
		// { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
		{ provide: APP_BASE_HREF, useValue: '/' },
		{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
		{
			provide: HTTP_INTERCEPTORS,
			useClass: NetworkInterceptor,
			multi: true,
		  },
	],
	bootstrap: [AppComponent],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	entryComponents: [BookingDetailComponent, AddressComponent, TimePicker, ShiftPatternDialogComponent, EndBookingDialogComponent]
})
export class AppModule { }
