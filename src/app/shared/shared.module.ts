import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [BarChartComponent],
  exports: [BarChartComponent],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class SharedModule { }
