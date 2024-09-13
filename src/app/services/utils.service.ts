import { Injectable } from '@angular/core';
import { FormControl, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() {}

  addNumberSuffix(number) {
    const lastDigit = number % 10;
    const secondLastDigit = Math.floor((number % 100) / 10);
    let suffix = 'th';
  
    if (secondLastDigit !== 1) {
      if (lastDigit === 1) {
        suffix = 'st';
      } else if (lastDigit === 2) {
        suffix = 'nd';
      } else if (lastDigit === 3) {
        suffix = 'rd';
      }
    }
  
    return `${number}${suffix}`;
  }


  trimWhitespaceValidator(control: FormControl): ValidationErrors | null {

    console.log(control);
    const value = control.value;
    const isWhitespace = (value && value.trim()) !== value;
    const isValid = !isWhitespace;
    

    return isValid ? null : { 'whitespace': true };
  }
  

}