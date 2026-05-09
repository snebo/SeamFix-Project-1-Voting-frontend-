import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PollResponse, PollService } from '../../services/poll.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-poll',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './poll.component.html',
  styleUrl: './poll.component.css',
})
export class PollComponent implements OnInit {
  @Input() poll!: PollResponse;
  @Input() mode: 'standard' | 'featured' = 'standard';
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
      x: { display: false, grid: { display: false }, border: { display: false }, max: 100 },
      y: { display: false, grid: { display: false }, border: { display: false } },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };
  public barChartType: ChartType = 'bar';
  public chartDataMap: Map<string, ChartData<'bar'>> = new Map();
  private readonly router = inject(Router);
  private readonly pollService = inject(PollService);

  ngOnInit(): void {
    if (this.poll && this.poll.options) {
      this.poll.options.forEach((option) => {
        const color = this.getOptionColor(option.id);
        this.chartDataMap.set(option.id, {
          labels: [''],
          datasets: [
            {
              data: [option.percentage || 0],
              backgroundColor: color,
              borderRadius: 10,
              barThickness: 8,
            },
          ],
        });
      });
    }
  }

  getOptionColor(id: string): string {
    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#6366F1'];
    const index = parseInt(id) % colors.length;
    return colors[index] || colors[0];
  }

  getStatusClass(): string {
    switch (this.poll.status) {
      case 'LIVE':
        return 'bg-pink-50 text-pink-600 border-pink-100';
      case 'TRENDING':
        return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'NEW':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'CLOSED':
        return 'bg-gray-50 text-gray-500 border-gray-100';
      default:
        return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  }

  selectPoll() {
    this.router.navigate(['/poll', this.poll.id]);
  }

  getTimeLeft(expiresAt: Date | string): string {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) return 'Expired';

    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d left`;
    if (diffHours > 0) return `${diffHours}h left`;
    if (diffMins > 0) return `${diffMins}m left`;
    return `${diffSecs}s left`;
  }
}
