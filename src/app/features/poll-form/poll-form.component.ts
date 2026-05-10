import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PollService } from '../../services/poll.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-poll-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './poll-form.component.html',
  styleUrls: ['./poll-form.component.css'],
})
export class PollFormComponent implements OnInit {
  pollId = signal<string | null>(null);
  isEditMode = signal(false);
  loading = signal(false);
  readonly nigerianStates = [
    'Abia',
    'Adamawa',
    'Akwa Ibom',
    'Anambra',
    'Bauchi',
    'Bayelsa',
    'Benue',
    'Borno',
    'Cross River',
    'Delta',
    'Ebonyi',
    'Edo',
    'Ekiti',
    'Enugu',
    'Gombe',
    'Imo',
    'Jigawa',
    'Kaduna',
    'Kano',
    'Katsina',
    'Kebbi',
    'Kogi',
    'Kwara',
    'Lagos',
    'Nasarawa',
    'Niger',
    'Ogun',
    'Ondo',
    'Osun',
    'Oyo',
    'Plateau',
    'Rivers',
    'Sokoto',
    'Taraba',
    'Yobe',
    'Zamfara',
    'FCT',
  ];
  private readonly fb = inject(FormBuilder);
  pollForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required]],
    state: ['', [Validators.required]],
    expiresAt: ['', [Validators.required]],
    options: this.fb.array([], [Validators.required, Validators.minLength(2)]),
  });
  private readonly pollService = inject(PollService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  get options() {
    return this.pollForm.get('options') as FormArray;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pollId.set(id);
      this.isEditMode.set(true);
      this.loadPollData(id);
    } else {
      // Add two empty options by default for new polls
      this.addOption();
      this.addOption();
    }
  }

  loadPollData(id: string): void {
    this.loading.set(true);
    this.pollService.getPoll(id).subscribe({
      next: (poll) => {
        this.pollForm.patchValue({
          title: poll.title,
          description: poll.description,
          state: poll.state,
          expiresAt: new Date(poll.expiresAt).toISOString().split('T')[0],
        });

        // Clear and populate options
        while (this.options.length) {
          this.options.removeAt(0);
        }
        poll.options.forEach((opt) => this.addOption(opt.label));
        this.loading.set(false);
      },
      error: (err) => {
        this.toastService.error('Failed to load poll data');
        this.router.navigate(['/polls']);
      },
    });
  }

  addOption(label: string = ''): void {
    this.options.push(
      this.fb.group({
        label: [label, [Validators.required]],
      }),
    );
  }

  removeOption(index: number): void {
    if (this.options.length > 2) {
      this.options.removeAt(index);
    } else {
      this.toastService.error('A poll must have at least 2 options');
    }
  }

  onSubmit(): void {
    if (this.pollForm.invalid) {
      this.pollForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formData = this.pollForm.value;
    const requestData = {
      ...formData,
      expiresAt: new Date(formData.expiresAt!).toISOString(),
    };

    const action = this.isEditMode()
      ? this.pollService.updatePoll(this.pollId()!, requestData)
      : this.pollService.createPoll(requestData);

    action.subscribe({
      next: () => {
        this.toastService.success(`Poll ${this.isEditMode() ? 'updated' : 'created'} successfully`);
        this.router.navigate(['/polls']);
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to save poll');
        this.loading.set(false);
      },
    });
  }
}
