import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: '[noInput]',
    templateUrl: 'no-input.component.html'
})
export class NoInputComponent implements OnInit
{
    @Input() label: any = false;
    @Input() value: any = true;
    @Input() flex: any = false;

    constructor()
    {
    }

    ngOnInit()
    {
    }
}
