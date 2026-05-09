import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PollResponse, PollService } from '../../services/poll.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-poll-details',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective],
  templateUrl: './poll-details.html',
  styleUrl: './poll-details.css',
})
export class PollDetails implements OnInit {
  isVoting = signal(false);
  // Pie Chart Configuration
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#6366F1'],
      },
    ],
  };
  public pieChartType: ChartType = 'pie';

  pollId!: string;
  poll!: PollResponse;
  loading = true;
  error = '';
  // Bar Chart Configuration
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    indexAxis: 'y',
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: false } },
    },
    plugins: {
      legend: { display: false },
    },
  };
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Votes',
        backgroundColor: '#3B82F6',
        borderRadius: 6,
      },
    ],
  };
  public barChartType: ChartType = 'bar';
  private readonly route = inject(ActivatedRoute);
  private readonly pollService = inject(PollService);
  private readonly toastService = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.pollId = this.route.snapshot.paramMap.get('id')!;
    this.fetchPollDetails();
  }

  fetchPollDetails() {
    this.loading = true;
    this.pollService.getPoll(this.pollId).subscribe({
      next: (poll) => {
        this.poll = poll;
        console.log('Poll: ', JSON.stringify(poll));

        console.log('searching for polls: ', this.poll.id);
        this.pollService.getUserVote(this.poll.id).subscribe((optionId) => {
          console.log('serching votes', optionId);
          this.poll.userVotedOptionId = optionId;
          this.cdr.detectChanges();
        });

        this.updateCharts();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load poll details. Please try again later.';
        this.loading = false;
        this.cdr.detectChanges();
        console.error(err);
      },
    });
  }

  updateCharts() {
    const labels = this.poll.options.map((o) => o.label);
    const percentages = this.poll.options.map((o) => o.percentage || 0);
    const votes = this.poll.options.map((o) => o.voteCount);

    this.pieChartData = {
      labels: labels,
      datasets: [
        {
          data: percentages,
          backgroundColor: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#6366F1'],
        },
      ],
    };

    this.barChartData = {
      labels: labels,
      datasets: [
        {
          data: votes,
          label: 'Votes',
          backgroundColor: '#3B82F6',
          borderRadius: 6,
        },
      ],
    };
  }

  vote(optionId: string) {
    if (this.isVoting()) return;

    this.isVoting.set(true);
    this.pollService.vote(this.pollId, optionId).subscribe({
      next: () => {
        this.toastService.success('Your vote has been recorded!');
        this.fetchPollDetails();
        this.isVoting.set(false);
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to record vote. Please try again.');
        this.isVoting.set(false);
      },
    });
  }

  getStatusClass(): string {
    switch (this.poll.status) {
      case 'LIVE':
        return 'bg-pink-100 text-pink-700';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  }
}
