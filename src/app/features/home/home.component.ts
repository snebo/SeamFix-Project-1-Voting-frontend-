import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../core/services/auth.service';
import { PollResponse, PollService } from '../../services/poll.service';
import { User, UserService } from '../../services/user.service';
import { PollComponent } from '../poll/poll.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PollComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  polls: PollResponse[] = [];
  loading = true;
  error = '';
  user!: User;

  featuredPoll: PollResponse | null = null;
  trendingPolls: PollResponse[] = [];
  activePolls: PollResponse[] = [];

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly pollService = inject(PollService);
  private readonly userService = inject(UserService);
  private readonly cdr = inject(ChangeDetectorRef);

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
          this.polls = polls;
          console.log('Polls', polls);
          this.activePolls = polls.filter((p) => !p.isFeatured);
          this.trendingPolls = [...polls]
            .sort((a, b) => (b.totalVoteCount || 0) - (a.totalVoteCount || 0))
            .slice(0, 5);

          const featured = polls.find((p) => p.isFeatured);
          this.featuredPoll = featured || (polls.length > 0 ? polls[0] : null);

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
