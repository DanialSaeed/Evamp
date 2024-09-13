import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService, UtilsService } from 'src/app/services';
import { MatDialogRef } from '@angular/material/dialog';
import { ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Location, Appearance, GermanAddress } from '@angular-material-extensions/google-maps-autocomplete';
// import { } from '@types/googlemaps';
import PlaceResult = google.maps.places.PlaceResult;
import { getAddressDialogFieldMsg, getBranchFieldMsg } from 'src/app/shared/field-validation-messages';


@Component({
	selector: 'app-address',
	templateUrl: './address.component.html',
	styleUrls: ['/src/app/views/shared-style.scss']
})
export class AddressComponent implements OnInit
{
	Form: FormGroup;
	street=""
	city=""
	streetAdded=false;
	public appearance = Appearance;
	public zoom: number;
	public latitude: number;
	public longitude: number;
	public selectedAddress: PlaceResult;
	addressRequire = true;
	streetExist = false;
	country = '';
	areaLevel1 = '';
	areaLevel2 = '';

	// countries = 
	// 	['AF', 'AX', 'AL', 'DZ', 'AS', 'AD', 'AO', 'AI', 'AQ', 'AG', 'AR', 'AM', 'AW', 'AU', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BM', 'BT', 'BO', 'BA', 'BW', 'BV', 'BR', 'IO', 'BN', 'BG', 'BF', 'BI', 'KH', 'CM', 'CA', 'CV', 'KY', 'CF', 'TD', 'CL', 'CN', 'CX', 'CC', 'CO', 'KM', 'CG', 'CD', 'CK', 'CR', 'CI', 'HR', 'CU', 'CY', 'CZ', 'DK', 'DJ', 'DM', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'ET', 'FK', 'FO', 'FJ', 'FI', 'FR', 'GF', 'PF', 'TF', 'GA', 'GM', 'GE', 'DE', 'GH', 'GI', 'GR', 'GL', 'GD', 'GP', 'GU', 'GT', 'GG', 'GN', 'GW', 'GY', 'HT', 'HM', 'VA', 'HN', 'HK', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IM', 'IL', 'IT', 'JM', 'JP', 'JE', 'JO', 'KZ', 'KE', 'KI', 'KR', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT', 'LU', 'MO', 'MK', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MQ', 'MR', 'MU', 'YT', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MS', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'AN', 'NC', 'NZ', 'NI', 'NE', 'NG', 'NU', 'NF', 'MP', 'NO', 'OM', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'PH', 'PN', 'PL', 'PT', 'PR', 'QA', 'RE', 'RO', 'RU', 'RW', 'BL', 'SH', 'KN', 'LC', 'MF', 'PM', 'VC', 'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SK', 'SI', 'SB', 'SO', 'ZA', 'GS', 'ES', 'LK', 'SD', 'SR', 'SJ', 'SZ', 'SE', 'CH', 'SY', 'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TK', 'TO', 'TT', 'TN', 'TR', 'TM', 'TC', 'TV', 'UG', 'UA', 'AE', 'GB', 'US', 'UM', 'UY', 'UZ', 'VU', 'VE', 'VN', 'VG', 'VI', 'WF', 'EH', 'YE', 'ZM', 'ZW']


	data: any;
	searchAddress: any = '';

	constructor(private titleService: Title,
		protected alertService: AlertService,
		protected formbuilder: FormBuilder,
		protected util: UtilsService,
		protected dialogRef: MatDialogRef<AddressComponent>)
	{
		this.Form = this.formbuilder.group({});
		this.Form.addControl('city', new FormControl('', [Validators.required, this.util.trimWhitespaceValidator]));
		this.Form.addControl('postalCode', new FormControl('', [Validators.required, this.util.trimWhitespaceValidator]));
		this.Form.addControl('address', new FormControl('', [Validators.required]));
		this.Form.addControl('streetNumber', new FormControl('', [Validators.required, this.util.trimWhitespaceValidator]));
		this.Form.addControl('streetAddress', new FormControl('', [this.util.trimWhitespaceValidator]));
		this.Form.addControl('latitude', new FormControl(''));
		this.Form.addControl('longitude', new FormControl(''));
		this.Form.addControl('addressLabel', new FormControl(''));
		this.Form.addControl('country', new FormControl(''));
		this.Form.addControl('region', new FormControl(''));
	}

	ngOnInit(): void
	{
		this.titleService.setTitle('Home | @angular-material-extensions/google-maps-autocomplete');

		this.zoom = 10;
		this.latitude = 52.520008;
		this.longitude = 13.404954;

		this.setCurrentPosition();
		if (this.data)
		{
			this.Form.patchValue(this.data);
			this.searchAddress = this.data.address;
			this.streetExist = this.data.streetNumber ? true : false;
			this.Form.get('addressLabel').setValue('');
			if (!this.Form.get('country').value && this.searchAddress) {
				let strArray = this.searchAddress.split(',');
				this.country = strArray[strArray.length - 1];
			}
		}

		// if (!this.addressRequire) {
		// 	this.Form.get('city').clearValidators();
		// 	this.Form.get('postalCode').clearValidators();
		// 	this.Form.get('address').clearValidators();
		// 	this.Form.get('streetNumber').clearValidators();
		// }	 
	}

	private setCurrentPosition()
	{
		if ('geolocation' in navigator)
		{
			navigator.geolocation.getCurrentPosition((position) =>
			{
				this.latitude = position.coords.latitude;
				this.longitude = position.coords.longitude;
				this.zoom = 12;
			});
		}
	}

	setCustomAddress(r) {
		this.Form.get('address').setValue(r.target.value);
		this.Form.get('latitude').setValue(0)
		this.Form.get('longitude').setValue(0)
		
	}

	onAutocompleteSelected(result: PlaceResult)
	{	
		console.log(result);
		console.log(this.searchAddress);
		
		
		this.city=""
		this.street=""
		this.country = "";
		this.areaLevel1 = "";
		this.areaLevel2 = "";
		this.streetAdded=false;
		this.Form.get('postalCode').setValue('');
		this.Form.get('streetAddress').setValue('');
		this.Form.get('address').setValue(result.formatted_address);
		console.log(result);
		
        result?.address_components.forEach(element => {

			element.types?.forEach(type=>
				{
                   if (type=="street_number" || type=="route")
				   {
					 this.street+=" "+element.short_name;
				   }
				   else if (type=="postal_town" || type=="administrative_area_level_2" || type=="political")
				   {
					   if(!this.streetAdded)
					   {
						this.city=element.long_name;
						this.streetAdded=true;

					   }
				   }
				   else if(type=="postal_code")
				   {
					this.Form.get('postalCode').setValue(element.long_name);
				   }
				});

				if (element.types.includes('country')) {
					this.country = element.long_name;
				}

				if (element.types.includes('administrative_area_level_1')) {
					this.areaLevel1 = element.long_name;
				}

				if (element.types.includes('administrative_area_level_2')) {
					this.areaLevel2 = element.long_name;
				}

				if (element.types.includes('administrative_area_level_1') && element.types.includes('political')) {
					this.Form.get('region').setValue(element.long_name);
				}
			
		});
		this.Form.get('city').setValue(this.city);
		console.log(this.street);
		this.Form.get('streetNumber').setValue(this.street.trim());
		// this.Form.get('streetAddress').setValue(this.street);

		
	}

	onLocationSelected(location: Location)
	{
		this.latitude = location.latitude;
		this.longitude = location.longitude;

		this.Form.get('latitude').setValue(this.latitude)
		this.Form.get('longitude').setValue(this.longitude)
	}

	onGermanAddressMapped($event: GermanAddress)
	{
		console.log('onGermanAddressMapped', $event);
	}

	getErrorMessage(field: any, form?): any
	{
		if (form) {
			return form.get(field) && form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getAddressDialogFieldMsg[field];
		}
		return this.Form.get(field) && this.Form.get(field).hasError('whitespace') ? 'No whitespaces allowed' : getAddressDialogFieldMsg[field];
	}

	getField(field: any, form?: any): any
	{
		if (form)
		{
			return form.get(field).invalid;
		}
		return this.Form.get(field).invalid;
		// return false;
	}

	onSubmitAddress(): void
	{
		if (this.Form.valid)
		{
			// if (this.Form.get('streetAddress').value) {
			let strAddress = this.Form.get('streetAddress').value ? this.Form.get('streetAddress').value  + ', ' : '';
			let area1 = this.areaLevel1 ? this.areaLevel1 + ', ' : '';
			let area2 = this.areaLevel2 ? this.areaLevel2 + ', ' : '';
			this.country = area1 + area2 + (this.country ? this.country : (this.Form.get('country').value ? this.Form.get('country').value : ''));
			let finalAddress = this.Form.get('streetNumber').value + ', ' + strAddress  + this.Form.get('city').value + ', ' + this.Form.get('postalCode').value + ', ' + this.country;
			this.Form.get('country').setValue(this.country);
			this.Form.get('addressLabel').setValue(finalAddress);
			this.Form.get('address').setValue(finalAddress);	
			// } else {
			// 	this.Form.get('addressLabel').setValue(this.Form.get('streetAddress').value);	
			// }

			this.dialogRef.close(this.Form.value);
		}
		else
		{
			this.Form.markAllAsTouched()
			this.alertService.alertError('WARNING', 'Please fill the required data.');
		}

	}
	onCancel()
	{
		this.dialogRef.close();
	}

	genericHeadingProps(label, textClass, margin)
	{
		var props
		props = {
			headingLabel: label,
			hasButton: false,
			hasHeading: true,
			hasRightLabel: false,
			showBack: false,
			labelMargin: '10px',
			textclass: textClass,
			margin: margin
		}
		return props
	}

}