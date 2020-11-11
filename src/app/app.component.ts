import {Component, OnInit} from '@angular/core';
import {ChartsDataService} from './core/services/charts-data.service';
import {Observable} from 'rxjs';
import {BarChartData} from './shared/components/bar-chart/bar-chart.component';
import {debounceTime} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  readonly userActionsData$: Observable<BarChartData[]> = this.chartsDataService.userActionsData$;
  readonly adminActionsData$: Observable<BarChartData[]> = this.chartsDataService.adminActionsData$
    .pipe(debounceTime(500));

  constructor(private chartsDataService: ChartsDataService) {}

  ngOnInit(): void {
    this.chartsDataService.getUserActionsData();
    this.chartsDataService.getAdminActionsData();
  }
}
