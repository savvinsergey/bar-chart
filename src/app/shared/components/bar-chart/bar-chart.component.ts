import {ChangeDetectionStrategy, Component, ElementRef, Input} from '@angular/core';
import * as d3 from 'd3';
import {AxisDomain, AxisScale} from 'd3';

export interface BarChartData {
  title: string;
  data: [number, number];
}

interface BarChartInnerData {
  title: string;
  prevValue: number;
  currentValue: number;
}

export enum Operations {
  LOG = 0,
  LINEAR = 1
}

export enum Colors {
  GREY = '#ccd3d5',
  RED = '#fe2844',
  GREEN = '#32d574'
}

export enum Arrows {
  UP = '&#129045;',
  DOWN = '&#129047;'
}

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent {
  @Input()
  set data(value: BarChartData[]) {
    if (!value?.length) {
      return;
    }

    this.chartData = this.convertData(value);
    this.renderChart();
  }

  @Input()
  readonly height?: number = 500;

  @Input()
  readonly width?: number = 700;

  readonly operations: typeof Operations = Operations;
  operation: Operations = Operations.LINEAR;

  private chartData: BarChartInnerData[] = [];

  private readonly margin = {
    top: 30,
    right: 10,
    bottom: 20,
    left: 40
  };

  constructor(private elementRef: ElementRef){}

  renderChart(): void {
    const columns = ['title', 'prevValue', 'currentValue'];
    const svg: any = d3
      .select(this.elementRef.nativeElement)
      .select('svg');
    svg.selectAll('*').remove();

    const groupKey = columns[0];
    const keys = columns.slice(1);

    const x0 = d3.scaleBand()
      .domain(this.chartData.map(d => d[groupKey]))
      .rangeRound([this.margin.left + 50, this.width - this.margin.right])
      .paddingInner(0.1);

    const x1 = d3.scaleBand()
      .domain(keys)
      .rangeRound([0, x0.bandwidth()])
      .padding(0.05);

    const y = this.chooseYAxisType()
      .domain([0, d3.max(this.chartData, d => d3.max(keys, key => d[key]))])
      .nice()
      .rangeRound([this.height - this.margin.bottom, this.margin.top]);

    svg.append('g')
      .call(g => this.renderXAxis(g, x0));

    svg.append('g')
      .call(g => this.renderYAxis(g, y));

    const mainG = svg.append('g')
      .selectAll('g')
      .data(this.chartData)
      .join('g')
      .attr('transform', d => `translate(${x0(d[groupKey])},0)`)
      .selectAll('rect')
      .data(d => keys.map(key => ({
          key,
          value: d[key],
          difference: this.calcDifferectPercent(d.currentValue, d.prevValue)
        }))
      );

    this.renderRect(mainG, x1, y);
    this.renderText(mainG, x1, y);
  }

  private renderYAxis(g: any, y: AxisScale<AxisDomain>): SVGElement {
    return g
      .attr('transform', `translate(${this.margin.left},0)`)
      .call(d3
        .axisLeft(y)
        .tickSize(0)
        .tickFormat((value: number) => `${value / 1000}`))
      .call(g1 => g1.select('.domain').remove())
        .attr('color', 'grey')
        .attr('font-weight', 'bold')
        .attr('font-size', 14)
      .call(g1 => g1.selectAll('.tick line').clone()
        .attr('x2', this.width)
        .attr('stroke-opacity', 0.1))
      .call(g1 => g1.append('text')
        .attr('x', -this.margin.left + 15)
        .attr('y', 10)
        .attr('fill', 'currentColor')
        .attr('text-anchor', 'start')
        .text('(K)'));
  }

  private renderXAxis(g: any, x0: AxisScale<AxisDomain>): SVGElement {
    return g
      .attr('transform', `translate(0,${this.height - this.margin.bottom + 5})`)
      .call(d3
        .axisBottom(x0)
        .tickSize(0))
      .call(g1 => g1.select('.domain').remove())
        .attr('color', 'grey')
        .attr('font-weight', 'bold')
        .attr('font-size', 14);
  }

  private renderRect(mainG: any,  x1: AxisScale<AxisDomain>, y: AxisScale<AxisDomain>): void {
    mainG
      .join('rect')
      .attr('x', d => x1(d.key) - this.calculateXShift(d, x1))
      .attr('y', d => y(d.value))
      .attr('width', d => x1.bandwidth() / (d.key === 'prevValue' ? 4 : 1))
      .attr('height', d => y(0) - y(d.value))
      .attr('fill', d => d.key === 'prevValue' ? Colors.GREY : this.getColor(d.difference));
  }

  private renderText(mainG: any, x1: AxisScale<AxisDomain>, y: AxisScale<AxisDomain>): void {
    mainG
      .join('text')
      .text(d => d.key !== 'prevValue' && `${Math.round(d.value / 1000)}K` || null)
      .attr('font-size', 13)
      .attr('font-family', '"Arial", sans-serif')
      .attr('text-anchor', 'middle')
      .attr('x', d  => x1(d.key))
      .attr('y', d => y(d.value) + 15)
      .attr('fill', 'white');

    mainG
      .join('text')
      .html(d => d.key !== 'prevValue' && `${d.difference > 0 && '+' || ''}${d.difference}%${this.getArrow(d.difference)}` || null)
      .style('font-weight', 700)
      .attr('font-size', 13)
      .attr('font-family', '"Arial", sans-serif')
      .attr('text-anchor', 'middle')
      .attr('x', d  => x1(d.key))
      .attr('y', d => y(d.value) - 5)
      .attr('fill', d => this.getColor(d.difference));
  }

  private getColor(difference: number): Colors {
    return difference > 0 ? Colors.GREEN : Colors.RED;
  }

  private getArrow(difference: number): Arrows {
    return difference > 0 ? Arrows.UP : Arrows.DOWN;
  }

  private calcDifferectPercent(currentValue: number, prevValue: number): number {
    return currentValue > prevValue
      ? Math.round((currentValue - prevValue) / prevValue * 100)
      : -Math.round(100 - ((currentValue / prevValue) * 100));
  }

  private calculateXShift(d: {key: string, value: number}, x1: AxisScale<AxisDomain>): number {
    let shift = 0;
    switch (true) {
      case d.key === 'currentValue':
        shift = shift = x1.bandwidth() / 2;
        break;
      case d.key === 'prevValue':
        shift = x1.bandwidth() / 4;
        shift -= shift * 2;
        break;
    }
    return shift;
  }

  private chooseYAxisType(): any  {
    switch (true) {
      case this.operation === Operations.LOG:
        return d3.scaleSymlog();
      case this.operation === Operations.LINEAR:
        return d3.scaleLinear();
    }
  }

  private convertData(value: BarChartData[]): BarChartInnerData[] {
    return value.map(item => ({
        title: item.title,
        prevValue: item.data[0],
        currentValue: item.data[1],
      })
    );
  }
}
