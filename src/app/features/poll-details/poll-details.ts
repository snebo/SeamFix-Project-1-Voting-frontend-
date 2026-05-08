import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { PollResponse, PollService } from '../../services/poll.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-poll-details',
  templateUrl: './poll-details.html',
  styleUrl: './poll-details.css',
})
export class PollDetails implements OnInit {
  pollId!: string;
  poll!: PollResponse;
  loading = true;
  error = '';

  constructor(
    private router: ActivatedRoute,
    private pollService: PollService,
    private readonly cdr: ChangeDetectorRef,
  ) {}
  ngOnInit() {
    this.pollId = this.router.snapshot.paramMap.get('id')!;
    console.log('Poll Id: ', this.pollId);

    // fetch the poll details
    this.pollService.getPoll(this.pollId).subscribe({
      next: (poll) => {
        this.poll = poll;
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
