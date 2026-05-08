import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { PollResponse, PollService } from '../../services/poll.service';
import { User, UserService } from '../../services/user.service';
import { PollComponent } from '../poll/poll.component';

interface Poll {
  id: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PollComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  polls: PollResponse[] = [];
  loading = true;
  error = '';
  user!: User;

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor(
    private readonly pollService: PollService,
    private readonly userService: UserService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  onLogout(): void {
    this.authService.logout('');
    this.router.navigate(['/login']);
  }

  openPoll(id: string): void {
    console.log('oopening poll',id);
    this.router.navigate(['/poll/' + id]);
  }

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
}
