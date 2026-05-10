import { ChangeDetectorRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PollResponse, PollService } from '../../services/poll.service';
import { UserService } from '../../services/user.service';
import { SearchService } from '../../services/search.service';
import { PollComponent } from '../poll/poll.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-all-polls',
  standalone: true,
  imports: [CommonModule, PollComponent, RouterLink],
  templateUrl: './all-polls.component.html',
  styleUrls: ['./all-polls.component.css'],
})
export class AllPollsComponent implements OnInit {
  polls = signal<PollResponse[]>([]);
  loading = signal(true);
  error = signal('');
  pageSize = 10;
  totalPolls = signal(0);

  private readonly pollService = inject(PollService);
  protected readonly userService = inject(UserService);
  private readonly searchService = inject(SearchService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly toastService = inject(ToastService);

  filteredPolls = computed(() => {
    const term = this.searchService.searchTerm().toLowerCase();
    if (!term) return this.polls();
    return this.polls().filter((p) => p.title.toLowerCase().includes(term));
  });

  ngOnInit(): void {
    this.loadPolls();
  }

  loadPolls(): void {
    const user = this.userService.currentUser();
    if (!user) return;

    this.loading.set(true);
    this.pollService.getPolls(user.state).subscribe({
      next: (polls) => {
        this.polls.set(polls);
        this.totalPolls.set(polls.length);
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error.set('Failed to load polls. Please try again later.');
        this.loading.set(false);
        this.cdr.detectChanges();
        console.error(err);
      },
    });
  }

  openPoll(id: string): void {
    this.router.navigate(['/poll/' + id]);
  }

  deletePoll(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      this.pollService.deletePoll(id).subscribe({
        next: () => {
          this.toastService.success('Poll deleted successfully');
          this.loadPolls();
        },
        error: () => this.toastService.error('Failed to delete poll'),
      });
    }
  }

  toggleStatus(poll: PollResponse, event: Event): void {
    event.stopPropagation();
    const newActiveState = poll.status === 'CLOSED';
    this.pollService.togglePollStatus(poll.id, newActiveState).subscribe({
      next: () => {
        this.toastService.success(`Poll status updated`);
        this.loadPolls();
      },
      error: () => this.toastService.error('Failed to update status'),
    });
  }

  editPoll(id: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/polls', id, 'edit']);
  }
}
