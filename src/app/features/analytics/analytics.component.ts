import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PollService, UserVote } from '../../services/poll.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective],
  template: `
    <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div class="mb-10">
        <h1 class="text-4xl font-black text-gray-900 leading-tight">Voting Analytics</h1>
        <p class="mt-4 text-lg text-gray-600 max-w-2xl">
          Track your participation history and impact across the platform.
        </p>
      </div>

      @if (loading()) {
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      } @else if (error()) {
        <div class="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium text-center">
          {{ error() }}
        </div>
      } @else {
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div
            class="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50"
          >
            <h3 class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              Total Votes Cast
            </h3>
            <p class="text-5xl font-black text-slate-900 leading-none">{{ userVotes().length }}</p>
          </div>

          <div class="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-200">
            <h3 class="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">
              Active Participations
            </h3>
            <p class="text-5xl font-black leading-none">{{ activeVotesCount() }}</p>
          </div>

          <div
            class="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 flex items-center justify-center"
          >
            <div class="h-24 w-full">
              <canvas
                baseChart
                [data]="statusChartData()"
                [options]="statusChartOptions"
                [type]="'doughnut'"
              >
              </canvas>
            </div>
          </div>
        </div>

        <!-- Voting History Table -->
        <div
          class="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden"
        >
          <div class="p-8 border-b border-gray-50 flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-900">Participation History</h2>
            <span class="text-xs font-bold text-gray-400 uppercase tracking-widest"
              >{{ userVotes().length }} Records Found</span
            >
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/50">
                  <th
                    class="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400"
                  >
                    Poll Information
                  </th>
                  <th
                    class="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400"
                  >
                    Your Selection
                  </th>
                  <th
                    class="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400"
                  >
                    Voted Date
                  </th>
                  <th
                    class="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400"
                  >
                    Poll Status
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (vote of userVotes(); track vote.id) {
                  <tr
                    class="group hover:bg-gray-50/50 transition-all cursor-pointer"
                    [routerLink]="['/poll', vote.poll.id]"
                  >
                    <td class="px-8 py-6">
                      <p
                        class="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1"
                      >
                        {{ vote.poll.title }}
                      </p>
                      <p class="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                        {{ vote.poll.category || 'General' }}
                      </p>
                    </td>
                    <td class="px-8 py-6">
                      <div
                        class="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-black border border-blue-100"
                      >
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="3"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {{ getSelectedOptionLabel(vote) }}
                      </div>
                    </td>
                    <td class="px-8 py-6">
                      <p class="text-sm font-bold text-gray-700">
                        {{ vote.created_at | date: 'MMM d, yyyy' }}
                      </p>
                      <p class="text-[10px] text-gray-400">
                        {{ vote.created_at | date: 'hh:mm a' }}
                      </p>
                    </td>
                    <td class="px-8 py-6">
                      <span
                        [ngClass]="
                          vote.poll.isActive
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                        "
                        class="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border"
                      >
                        {{ vote.poll.isActive ? 'Live' : 'Closed' }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (userVotes().length === 0) {
            <div class="py-20 text-center">
              <div
                class="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg
                  class="w-8 h-8 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900">No activity yet</h3>
              <p class="text-gray-500 text-sm">
                Start participating in polls to see your analytics here.
              </p>
              <a
                routerLink="/polls"
                class="mt-6 inline-block text-sm font-black text-blue-600 hover:underline tracking-widest uppercase"
                >Browse Polls →</a
              >
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        background: #fafafa;
        min-height: 100%;
      }
    `,
  ],
})
export class AnalyticsComponent implements OnInit {
  userVotes = signal<UserVote[]>([]);
  loading = signal(true);
  error = signal('');
  activeVotesCount = computed(() => {
    return this.userVotes().filter((v) => v.poll.isActive).length;
  });
  statusChartData = computed<ChartData<'doughnut'>>(() => {
    const active = this.activeVotesCount();
    const closed = this.userVotes().length - active;

    return {
      labels: ['Live', 'Closed'],
      datasets: [
        {
          data: [active, closed],
          backgroundColor: ['#3B82F6', '#E5E7EB'],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    };
  });
  public statusChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    cutout: '70%',
  };
  private readonly pollService = inject(PollService);

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading.set(true);
    this.pollService.getUserVotes().subscribe({
      next: (votes) => {
        this.userVotes.set(votes);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load your voting history.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  getSelectedOptionLabel(vote: UserVote): string {
    const option = vote.poll.options.find((o) => o.id === vote.pollOption!.id);
    return option ? option.label : 'Unknown Option';
  }
}
