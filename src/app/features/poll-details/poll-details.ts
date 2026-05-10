import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PollResponse, PollService } from '../../services/poll.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ToastService } from '../../core/services/toast.service';
import { calculateRemainingTime } from '../poll/poll.component';
import { switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-poll-details',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective],
  templateUrl: './poll-details.html',
  styleUrl: './poll-details.css',
})
export class PollDetails implements OnInit {
  pollId!: string;
  poll = signal<PollResponse | null>(null);
  loading = signal(true);
  error = signal('');
  // Computed Chart Data for Pie Chart
  pieChartData = computed<ChartData<'pie'>>(() => {
    const p = this.poll();
    if (!p) return { labels: [], datasets: [] };

    return {
      labels: p.options.map((o) => o.label),
      datasets: [
        {
          data: p.options.map((o) => o.percentage || 0),
          backgroundColor: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#6366F1'],
        },
      ],
    };
  });
  // Computed Chart Data for Bar Chart
  barChartData = computed<ChartData<'bar'>>(() => {
    const p = this.poll();
    if (!p) return { labels: [], datasets: [] };

    return {
      labels: p.options.map((o) => o.label),
      datasets: [
        {
          data: p.options.map((o) => o.voteCount),
          label: 'Votes',
          backgroundColor: '#3B82F6',
          borderRadius: 6,
        },
      ],
    };
  });
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'bottom' },
    },
  };
  isVoting = signal(false);
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
  private readonly route = inject(ActivatedRoute);
  private readonly pollService = inject(PollService);
  public pieChartType: ChartType = 'pie';
  private readonly toastService = inject(ToastService);
  public barChartType: ChartType = 'bar';

  ngOnInit() {
    this.pollId = this.route.snapshot.paramMap.get('id')!;
    this.fetchPollDetails(true);
  }

  fetchPollDetails(isInitial: boolean = false) {
    if (isInitial) this.loading.set(true);

    this.pollService
      .getPoll(this.pollId)
      .pipe(
        switchMap((poll: PollResponse) => {
          // First set the basic poll data
          const enrichedPoll = {
            ...poll,
            options: poll.options.map((o) => ({
              ...o,
              percentage:
                o.percentage ||
                (poll.totalVoteCount > 0
                  ? Math.round((o.voteCount / poll.totalVoteCount) * 100)
                  : 0),
            })),
          };
          this.poll.set(enrichedPoll);

          // Then fetch the user's vote
          return this.pollService.getUserVote(poll.id).pipe(
            tap((optionId) => {
              if (this.poll()) {
                this.poll.update((current) =>
                  current ? { ...current, userVotedOptionId: optionId } : null,
                );
              }
            }),
          );
        }),
      )
      .subscribe({
        next: () => {
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Failed to load poll details. Please try again later.');
          this.loading.set(false);
          console.error(err);
        },
      });
  }

  vote(optionId: string) {
    const currentPoll = this.poll();
    if (!currentPoll) return;

    if (currentPoll.status === 'CLOSED') {
      this.toastService.error('This poll is closed');
      return;
    }

    if (this.isVoting()) return;

    this.isVoting.set(true);
    this.pollService.vote(this.pollId, optionId).subscribe({
      next: () => {
        this.toastService.success('Your vote has been recorded!');
        this.fetchPollDetails(false); // Silent refresh
        this.isVoting.set(false);
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to record vote. Please try again.');
        this.isVoting.set(false);
      },
    });
  }

  getStatusClass(): string {
    const status = this.poll()?.status;
    switch (status) {
      case 'LIVE':
        return 'bg-pink-100 text-pink-700';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  }

  getRemainingTime(poll_exp: Date | string): string {
    return calculateRemainingTime(poll_exp);
  }
}
