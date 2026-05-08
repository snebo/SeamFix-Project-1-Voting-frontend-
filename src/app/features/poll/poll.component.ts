import { Component, Input } from '@angular/core';
import { PollResponse } from '../../services/poll.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-poll',
  imports: [],
  templateUrl: './poll.component.html',
  styleUrl: './poll.component.css',
})
export class PollComponent {
  constructor(private router: Router) {}
  @Input()
  poll!: PollResponse;

  selectPoll() {
    this.router.navigate(['/poll', this.poll.id])
    console.log('Selected poll:', this.poll.id);
  }
}
