import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, AlertService } from 'src/app/services';
import { config } from 'src/config';

@Component({
	selector: 'app-otp',
	templateUrl: './otp.component.html',
	styleUrls: ['../auth-app-login.component.scss']
})
export class OTPComponent implements OnInit
{
	bolderText = "Enter 4 Digit Code";
	lighterText = "Please enter the 4-digit code";
	lighterText2 = "sent to your registered email address";
	emailIcon: String = "assets/images/ic_lock_open.png"
	iconClass = ""
	Form: FormGroup;
	email: any;

	timerRunning: boolean = true;
	timer: any;
	maxTime: number = 60;
	timerValue: string = '1:00';

	constructor(protected router: Router, protected formbuilder: FormBuilder, protected apiService: ApiService, protected alert: AlertService)
	{
		this.Form = this.formbuilder.group({
			email: [null, [Validators.required]],
			otpCode: [null, [Validators.required]]
		});
	}

	ngOnInit(): void
	{
		this.email = localStorage.getItem('email');
		if (this.email)
		{
			this.Form.get('email').setValue(this.email);
		}
		else
		{
			this.router.navigateByUrl('auth/login');
		}
		this.otpTimerCheck();
	}

	otpTimerCheck()
	{
		this.timer = setTimeout(x =>
		{
			this.maxTime -= 1;

			if (this.maxTime < 10)
			{
				this.timerValue = '00:0' + this.maxTime;
			}

			if (this.maxTime > 10)
			{
				this.timerValue = '00:' + this.maxTime;
			}

			if (this.maxTime > 0)
			{
				this.timerRunning = true;
				this.otpTimerCheck();
			}
			else
			{
				this.timerRunning = false;
			}
		}, 1000);
	}

	onSubmit()
	{
		if (this.Form.get('otpCode').value == null)
		{
			this.alert.alertError("WARNING", "OTP is required");
			return;
		}
		this.apiService.auth(config.base_url_slug +'verify/otp-code', this.Form.value).then(result =>
		{
			if (result.code == 200)
			{
				this.router.navigateByUrl('main/dashboard');
			}
			else
			{

				this.alert.alertError(result.status, "OTP is invalid, please try again with a valid OTP");
			}
		})
	}

	onResend()
	{
		if (this.timerRunning)
		{
			return;
		}
		this.apiService.auth(config.base_url_slug +'resend/otp-code', { email: this.Form.get('email').value }).then(result =>
		{
			if (result.code == 200)
			{
				this.maxTime = 60;
				clearTimeout(this.timer);
				this.otpTimerCheck();
			}
			else if (result.code == 401)
			{
				this.alert.alertError(result.status, 'Unauthorized user, Invalid Code.');
			}
			else
			{
				this.alert.alertError(result.status, result.message);
			}
		})
	}
}
