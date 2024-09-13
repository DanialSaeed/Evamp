import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import * as Highcharts from 'highcharts';
import * as borderRadius from "highcharts-border-radius";
import { BehaviorSubject, Observable } from 'rxjs';
borderRadius(Highcharts);

@Component({
    selector: 'app-chart',
    styleUrls: ['chart.component.scss'],
    templateUrl: 'chart.component.html'
})

export class ChartComponent implements OnInit, AfterViewInit
{

    @ViewChild('container', { static: false }) container: ElementRef<any>;

    @Input() columnChart: any = {

    }

    @Input() chartContainer: string;
    @Input() chartType: string = '';
    @Input() circleChartText: any = 'ABC';
    @Input() circleChartValue: any = '10';
    @Input() circleChartClass: any = '10';
    @Input() circleChartColor: any = 'red';
    border: string;
    colChart: Highcharts.Chart;
    cWidth: any;

    constructor()
    {
        this.chartContainer = 'container';
    }

    ngOnInit()
    {
        this.border = '0.45em solid ' + this.circleChartColor;
    }

    ngAfterViewInit(): void
    {
        if (this.chartType == 'column')
        {
            this.colChart = Highcharts.chart(this.chartContainer, this.columnChart);
        }
    }

    @HostListener('document:click', ['$event'])
    onClick(event) 
    {
        setTimeout(() => {
            this.colChart.setSize(null);
        }, 230);
    }
}
