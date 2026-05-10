import { ChangeDetectorRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../core/services/auth.service';
import { PollResponse, PollService } from '../../services/poll.service';
import { User, UserService } from '../../services/user.service';
import { SearchService } from '../../services/search.service';
import { PollComponent } from '../poll/poll.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PollComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  polls = signal<PollResponse[]>([]);
  loading = true;
  error = '';
  user!: User;

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly pollService = inject(PollService);
  private readonly userService = inject(UserService);
  staticTrendingPolls = computed(() => {
    return [...this.polls()]
      .sort((a, b) => (b.totalVoteCount || 0) - (a.totalVoteCount || 0))
      .slice(0, 5);
  });
  private readonly cdr = inject(ChangeDetectorRef);
  featuredPoll = computed(() => {
    const featured = this.polls().find((p) => p.isFeatured);
    return featured || (this.polls().length > 0 ? this.polls()[0] : null);
  });
  private readonly searchService = inject(SearchService);
  filteredActivePolls = computed(() => {
    const term = this.searchService.searchTerm().toLowerCase();
    const active = this.polls().filter((p) => !p.isFeatured);
    if (!term) return active.slice(0, 5);
    return active.filter((p) => p.title.toLowerCase().includes(term)).slice(0, 5);
  });

  ngOnInit(): void {
    this.userService
      .getProfile()
      .pipe(
        switchMap((user) => {
          this.user = user;
          return this.pollService.getPolls(user.state);
        }),
      )
      .subscribe({
        next: (polls) => {
          this.polls.set(polls);
          console.log('Polls', polls);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Failed to load data';
          this.loading = false;
          this.cdr.detectChanges();
          console.error(err);
        },
      });
  }

  openPoll(id: string): void {
    this.router.navigate(['/poll/' + id]);
  }
}
