import { AllInvoiceListingComponent } from './views/finance-management/invoice/all-invoice-listing/all-invoice-listing.component';
import { Injectable, NgModule } from '@angular/core';
import { Observable } from 'rxjs';
import { PermissionService } from './services';
import { AppComponent } from './app.component';
import { AuthGuard } from './guards/auth.guard';
import { ViewsGuard } from './guards/views.guard';
import { Routes, RouterModule, Resolve } from '@angular/router';
import { MainAppComponent } from './templates/main-app/main-app.component';
import { AuthAppLoginComponent } from './templates/auth-app/auth-app-login.component';
import { LoginComponent, ForgotComponent, OTPComponent } from './templates/auth-app';
import { BranchFormComponent } from './views/branch-management/branch-form/branch-form.component';
import { RoomListComponent } from './views/branch-management/room-list/room-list.component';
import { RoomFormComponent } from './views/branch-management/room-form/room-form.component';
import { SessionListComponent } from './views/session/session-list/session-list.component';
import { SessionFormComponent } from './views/session/session-form/session-form.component';
import { StaffAllocationComponent } from './views/hr-management/staff-allocation/staff-allocation.component';
import { BranchListComponent } from './views/branch-management/branch-list/branch-list.component';
import { InformationFormComponent } from './views/session/session-form/information-form/information-form.component';
import { PricingFormComponent } from './views/session/session-form/pricing-form/pricing-form.component';
import { ViewCalenderComponent } from './views/hr-management/view-calender/view-calender.component';
import { StaffComponent } from './views/hr-management/staff/staff.component';
import { CreateStaffComponent } from './views/hr-management/staff/create-staff/create-staff.component';
import { ContractSettingsComponent } from './views/hr-management/staff/create-staff/contract-settings/contract-settings.component';
import { PersonalDetailsComponent } from './views/hr-management/staff/create-staff/personal-details/personal-details.component';
import { ShiftPatternComponent } from './views/hr-management/staff/create-staff/shift-pattern/shift-pattern.component';
import { ChildrenComponent } from './views/child-management/children/children.component';
import { EnrolmentComponent } from './views/child-management/enrolment/enrolment.component';
import { BasicInformationComponent } from './views/child-management/enrolment/basic-information/basic-information.component';
import { GuardianInformationComponent } from './views/child-management/enrolment/guardian-information/guardian-information.component';
import { MedicalInformationComponent } from './views/child-management/enrolment/medical-information/medical-information.component';
import { EmergencyDetailsComponent } from './views/child-management/enrolment/emergency-details/emergency-details.component';
import { FundingComponent } from './views/child-management/enrolment/funding/funding.component';
import { ChildBookingComponent } from './views/child-management/child-booking/child-booking.component';
import { AddBookingComponent } from './views/child-management/child-booking/add-booking/add-booking.component';
import { SelectChildComponent } from './views/child-management/child-booking/add-booking/select-child/select-child.component';
import { BookingDetailComponent } from './views/child-management/child-booking/add-booking/booking-detail/booking-detail.component';
import { MainDashboardComponent } from './views/main-dashboard/main-dashboard.component';
import { AdditionalItemsComponent } from './views/child-management/additional-items/additional-items.component';
import { AddAdditionalItemsComponent } from './views/child-management/additional-items/add-additional-items/add-additional-items.component';
import { AdditionalItemDetailComponent } from './views/child-management/additional-items/add-additional-items/additional-item-detail/additional-item-detail.component';
import { SelectChildrenComponent } from './views/child-management/additional-items/add-additional-items/select-children/select-children.component';
import { AccessManagementComponent } from './views/global-settings/access-management/access-management.component';
import { AttendanceComponent } from './views/child-management/attendance/attendance.component';
import { ChildAttendanceReportComponent } from './views/report-management/child-attendance-report.component';
import { AttendanceDetailComponent } from './views/child-management/attendance/attendance-detail/attendance-detail.component';
import { StaffAttendanceDetailComponent } from './views/child-management/attendance/staff-attendance-detail/staff-attendance-detail.component';
import { InvoiceComponent } from './views/finance-management/invoice/invoice.component';
import { CreditListComponent } from './views/finance-management/credits/credit-list.component';
import { CreditComponent } from './views/finance-management/credits/addcredit/credit.component';
import { GenerateInvoiceComponent } from './views/finance-management/invoice/generate-invoice/generate-invoice.component';
import { AdhocInvoiceComponent } from './views/finance-management/invoice/adhoc-invoice/adhoc-invoice.component';
import { DiscrepancyHistoryComponent } from './views/child-management/attendance/discrepancy-history/discrepancy-history.component';
import { StaffDiscrepancyHistoryComponent } from './views/child-management/attendance/staff-discrepancy-history/staff-discrepancy-history.component';
import { StaffAttendanceReportComponent } from './views/report-management/staff-attendance-report/staff-attendance-report.component';
import { GuardianComponent } from './views/child-management/guardian/guardian.component';
import { AddGuardianComponent } from './views/child-management/guardian/add-guardian/add-guardian.component';
import { FinancialSettingsComponent } from './views/branch-management/financial-settings/financial-settings.component';
import { GlobalAdditionalItemsComponent } from './views/global-settings/global-additional-items/global-additional-items.component';
import { GlobalAddAdditionalItemsComponent } from './views/global-settings/global-additional-items/global-add-additional-items/global-add-additional-items.component';
import { ChildOffboardingComponent } from './views/child-management/children/active-children/childOffboarding/childOffboarding.component';
import { ManualAttendanceComponent } from './views/child-management/attendance/manual-attendance/manual-attendance.component';
//import { CacheTestComponent } from './views/cache-test/cache-test.component';

@Injectable()
export class PermissionResolver implements Resolve<any> {
  constructor(private ps: PermissionService) { }
  resolve(): Observable<any>
  {
    return this.ps.loadPermissions();
  }
}

const mainApp: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: MainDashboardComponent , data:{route:"dashboard"} },
//  { path: 'testForCache', component: CacheTestComponent , data:{route:"dashboard"} },
  { path: 'branch', component: BranchListComponent, data:{route:"branch"} },
  { path: 'branch/:id/:type', component: BranchFormComponent, data:{route:"branch"}},
  { path: 'room', component: RoomListComponent, data:{route:"room"} },
  { path: 'finance-settings', component: FinancialSettingsComponent, data:{route:"finance-settings"} },
  { path: 'room/:id/:type', component: RoomFormComponent },
  { path: 'session', component: SessionListComponent , data:{route:"session"} },
  { path: 'session/:id/:type', component: SessionFormComponent },
  // children: [
  // 	{ path: 'session-info/:id/:type', component: InformationFormComponent, },
  // 	{ path: 'session-pricing/:id/:type', component: PricingFormComponent },

  // ]},
  { path: 'staff', component: StaffComponent , data:{route:"staff"} },
  { path: 'staff/:id/:type', component: CreateStaffComponent },
  // children: [
  // 	{ path: 'personal/:id/:type', component:  PersonalDetailsComponent},
  // 	{ path: 'contract/:id/:type', component: ContractSettingsComponent },
  // 	{ path: 'shift-pattern/:id/:type', component: ShiftPatternComponent }
  // ]},
  { path: 'children', component: ChildrenComponent , data:{route:"children"}},
  { path: 'child-booking', component: ChildBookingComponent , data:{route:"child-booking"}},
  { path: 'child-booking/:id/:type', component: AddBookingComponent },
  { path: 'guardian', component: GuardianComponent , data:{route:"guardian"}},
  { path: 'guardian/:id/:type', component: AddGuardianComponent },

  // children: [
  // 	{ path: 'select-child/:id/:type', component: SelectChildComponent, },
  // 	{ path: 'booking-detail/:id/:type', component: BookingDetailComponent }
  // ]},
  { path: 'enrolment/:id/:type', component: EnrolmentComponent },
  { path: 'offboard-child/:id/:type', component: ChildOffboardingComponent },
  // children: [
  // 	{ path: 'basic/:id/:type', component:  BasicInformationComponent},
  // 	{ path: 'guardian/:id/:type', component: GuardianInformationComponent },
  // 	{ path: 'medical/:id/:type', component: MedicalInformationComponent },
  // 	{ path: 'emergency/:id/:type', component: EmergencyDetailsComponent },
  // 	{ path: 'funding/:id/:type', component: FundingComponent },
  // ]},
  { path: 'additional-items', component: AdditionalItemsComponent , data:{route:"additional-items"}},
  { path: 'additional-items/:id/:type', component: AddAdditionalItemsComponent },
  // children: [
  // 	{ path: 'select-children/:id/:type', component: SelectChildrenComponent },
  // 	{ path: 'additional-item-detail/:id/:type', component: AdditionalItemDetailComponent }
  // ]},
  { path: 'child-attendance/:type', component: AttendanceComponent },
  { path: 'manual-child-attendance/child', component: ManualAttendanceComponent,data:{route:'manual-child-attendance/child'} },
  { path: 'child-attendance/discrepancy/history', component: DiscrepancyHistoryComponent,data:{route:'child-attendance/discrepancy/history'} },
  { path: 'staff-attendance/discrepancy/history', component: StaffDiscrepancyHistoryComponent,data:{route:'staff-attendance/discrepancy/history'} },
  { path: 'attendance-detail/:id/:type', component: AttendanceDetailComponent },
  { path: 'staff-attendance-detail/:id/:type', component: StaffAttendanceDetailComponent },

  // { path: 'staff-attendance/staff', component: AttendanceComponent,data:{route:'staff-attendance/staff'} },
  { path: 'staff-attendance/:type', component: AttendanceComponent,data:{route:'staff-attendance'} },

  { path: 'finance/invoice/:id/:type', component: InvoiceComponent },
  { path: 'finance/allInvoice', component: AllInvoiceListingComponent , data:{route:"finance/allInvoice"}},
  { path: 'finance/adHocInvoice/:id/:type', component: AdhocInvoiceComponent },
  { path: 'finance/generate-invoice/:id/:type', component: GenerateInvoiceComponent },
  { path: 'finance/credits', component: CreditListComponent, data:{route:"finance/credits"} },
  { path: 'finance/credits/:type/:id', component: CreditComponent },

  { path: 'staff-allocation/:id/:type', component: StaffAllocationComponent },
  { path: 'calendar', component: ViewCalenderComponent, data:{route:"calendar"} },
  { path: 'access-management', component: AccessManagementComponent , data:{route:"access-management"}},
  { path: 'settings/additional-items', component: GlobalAdditionalItemsComponent , data:{route:"settings/additional-items"}},
  { path: 'settings/additional-items/:id/:type', component: GlobalAddAdditionalItemsComponent },

  { path: 'child-attendance-report', component: ManualAttendanceComponent ,data:{route:'child-attendance-report'}},
  { path: 'staff-attendance-report', component: StaffAttendanceReportComponent ,data:{route:'staff-attendance-report'}},
];

const publicRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'login-old', component: AuthAppLoginComponent },
  { path: 'otp', component: OTPComponent },
  { path: 'forgot', component: ForgotComponent },
];

const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth', component: AppComponent, children: publicRoutes, canActivate: [AuthGuard] },
  {
    path: 'main', component: MainAppComponent, children: mainApp, canActivate: [ViewsGuard], resolve: {
      data: PermissionResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    PermissionResolver
  ]
})
export class AppRoutingModule { }
