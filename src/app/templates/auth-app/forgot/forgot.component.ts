import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, AlertService } from 'src/app/services';
import { config } from 'src/config';

@Component({
	selector: 'app-forgot',
	templateUrl: './forgot.component.html',
	styleUrls: ['../auth-app-login.component.scss']
})
export class ForgotComponent implements OnInit
{
	bolderText = "Forgot Password";
	lighterText = "Please enter your Email Address to"
	iconClass = ""
	emailIcon = "assets/images/ic_lock_open.png"
	lighterText2 = "reset your password"
	Form: FormGroup;

	constructor(protected router: Router, protected formbuilder: FormBuilder, protected apiService: ApiService, protected alert: AlertService)
	{
		this.Form = this.formbuilder.group({
			email: [null, [Validators.required]]
		});
	}

	ngOnInit(): void
	{

	}

	onSubmit()
	{
		this.apiService.auth(config.base_url_slug +'reset-password', this.Form.value).then(result =>
		{
			if (result.code == 200)
			{
				// Logs console.log(result);
				localStorage.setItem('email', this.Form.get('email').value);
				this.router.navigateByUrl('auth/login');
			}
			else if (result.code == 401)
			{
				this.alert.alertError(result.status, 'Unauthorized user, Invalid Email.')
			}
			else
			{
				this.alert.alertError(result.status, result.message)
			}
		})
	}
}
