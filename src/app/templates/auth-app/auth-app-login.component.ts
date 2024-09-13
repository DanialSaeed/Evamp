import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
	selector: 'app-auth-app-login',
	templateUrl: './auth-app-login.component.html',
	styleUrls: ['./auth-app-login.component.scss']
})
export class AuthAppLoginComponent implements OnInit
{
	formControl = new FormControl('', [
		Validators.required
		// Validators.email,
	]);
	forgotPassword: Boolean = false;
	gotCode: Boolean = false;
	buttonLabel: String = "Login";
	boldTExt: String = "Welcome To";
	bolderText: String = "A Greener Tomorrow";
	lighterText: String = "This is a secure website"
	iconClass: String = "lockIcon"
	emailIcon: String = "assets/images/ic_email.png"

	lighterText2: String = "Please Enter your email and password to login"
	constructor(protected router: Router)
	{

	}

	ngOnInit(): void
	{

	}
	onClickForgot()
	{
		this.forgotPassword = true;
		this.boldTExt = "";
		this.buttonLabel = "Proceed";
		this.bolderText = "Forgot Password";
		this.lighterText = "Please enter your Email Address to"
		this.iconClass = ""
		this.emailIcon = "assets/images/ic_lock_open.png"
		this.lighterText2 = "reset your password"
		// Logs console.log("I am here", this.forgotPassword)
	}
	onClick()
	{
		this.router.navigateByUrl('/main/dashboard');
		if (this.forgotPassword)
		{
			this.gotCode = true;
			this.boldTExt = "";
			this.bolderText = "Enter 4 Digit Code";
			this.lighterText = "Please enter the 4-digit code"
			this.lighterText2 = "sent to your registered email address"
		}
	}
}
