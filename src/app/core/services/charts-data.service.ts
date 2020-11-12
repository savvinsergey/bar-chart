import { Injectable } from '@angular/core';
import {BehaviorSubject, timer} from 'rxjs';
import {takeWhile} from 'rxjs/operators';
import {BarChartData} from '../../shared/components/bar-chart/bar-chart.component';

@Injectable({
  providedIn: 'root'
})
export class ChartsDataService {
  readonly userActionsData$: BehaviorSubject<BarChartData[]> = new BehaviorSubject<BarChartData[]>([]);
  readonly adminActionsData$: BehaviorSubject<BarChartData[]> = new BehaviorSubject<BarChartData[]>([]);

  private get userActionsData(): BarChartData[] {
    return this.userActionsData$.value;
  }

  private get adminActionsData(): BarChartData[] {
    return this.adminActionsData$.value;
  }

  /* EMULATE DATA STREAM */
  getUserActionsData(): void {
    timer(0, 300)
      .pipe(
        takeWhile(() => this.userActionsData.length < 5)
      ).subscribe(() => {
        const action = this.getRandomAction();
        if (this.userActionsData.find(item => item.title === action)) {
          return;
        }

        this.userActionsData$.next([...this.userActionsData, this.generateDataObj(action)]);
      });
  }

  getAdminActionsData(): void {
    timer(0, 100)
      .pipe(
        takeWhile(() => this.adminActionsData.length < 5)
      )
    .subscribe(() => {
        const action = this.getRandomAction();
        if (this.adminActionsData.find(item => item.title === action)) {
          return;
        }

        this.adminActionsData$.next([...this.adminActionsData, this.generateDataObj(action)]);
      });
  }

  private generateNumber(): number {
    return Math.floor(Math.random() * Math.floor(1000000));
  }

  private getRandomAction(): string {
    const actions: string[] = ['Open', 'Close', 'Delete', 'Create', 'Update', 'View', 'Click'];
    return actions[Math.floor(Math.random() * actions.length)];
  }

  private generateDataObj(action: string): BarChartData {
    return {
      title: action,
      data: [this.generateNumber(), this.generateNumber()]
    };
  }
}
