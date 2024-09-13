import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, AlertService } from 'src/app/services';
import { config } from 'src/config';
import * as Msal from "msal";
import { getLoginFieldMsg } from 'src/app/shared/field-validation-messages';


@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['../auth-app-login.component.scss']
})
export class LoginComponent implements OnInit
{
	formControl = new FormControl('', [
		Validators.required
		// Validators.email,
	]);
	forgotPassword: Boolean = false;
	buttonLabel: String = "Sign In";
	bolderText: String = "Sign In";
	emailIcon: String = "assets/images/sdn/ic_account_box_24px.png"
	lighterText2: String = "Please enter your email and password to sign in";
	Form: FormGroup;

	msalConfig = {
        auth: {
            clientId: config.clientId
        }
    };
	msalInstance: any;


	constructor(protected router: Router,
		protected formbuilder: FormBuilder,
		protected apiService: ApiService,
		protected alert: AlertService,)
	{
		this.Form = this.formbuilder.group({
			email: [null, [Validators.required, Validators.email]],
			password: [null, [Validators.required]]
		});
	}

	ngOnInit(): void
	{
		console.log('TESTING');
		this.msalInstance = new Msal.UserAgentApplication(this.msalConfig);

		this.msalInstance.handleRedirectCallback((error, response) => {
			// handle redirect response or error
			console.log("handleRedirectCallback", error, response);
		});
	}

	onClickForgot()
	{
		this.router.navigateByUrl('/auth/forgot');
	}

	onLogin(event)
	{
		if (event.keyCode == 13)
		{

			this.onSubmit()
		}
	}

	onSubmit()
	{
		if (this.Form.valid)
		{
			this.apiService.auth(config.base_url_slug + 'login_v2', this.Form.value).then(result =>
			{

				if (result.code == 200)
				{
					localStorage.setItem('title', "Dashboard");
					this.router.navigateByUrl('main/dashboard');
				}
				else if (result.code == 401)
				{
					this.alert.alertError(result.status, 'Unauthorized user, Invalid Credentials.')
				}
				else
				{
					this.alert.alertError(result.status, 'Your access has been revoked. Please contact admin.');
				}
			})
		}
		else
		{
			this.Form.markAllAsTouched()
			this.alert.alertError('WARNING', 'Please fill the required data.');
		}
	}

	onBtnLogin()
	{
		var loginRequest = {
			scopes: ["user.read"] // optional Array<string>
		};

		 this.msalInstance.loginPopup(loginRequest)
			 .then(response => {
				// this.alert.alertError("Login Office 365", response);
				let token = response.idToken.rawIdToken
				this.apiService.auth(config.base_url_slug + 'login/portal', {'idToken': token}).then(result =>
					{
						if (result.code == 200)
						{
							localStorage.setItem('title', "Dashboard");
							this.router.navigateByUrl('main/dashboard');
						}
						else if (result.code == 401)
						{
							this.alert.alertError(result.status, 'Unauthorized user, Invalid Credentials.')
						}
						else
							{
								this.alert.alertError(result.status, 'Your access has been revoked. Please contact admin.');
							}
					})
			 })
			 .catch(err => {
				this.alert.alertError("Login Office 365", err);
			 });
	}

	getField(field: any, form?: any): any
    {
        if (form)
        {
            return form.get(field).invalid;
        }
        return this.Form.get(field).invalid;
    }

	getErrorMessage(field: any): any
	{
		return getLoginFieldMsg[field];
	}
}
