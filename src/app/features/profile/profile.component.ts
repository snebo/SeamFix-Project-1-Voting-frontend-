import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfile, UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-2xl mx-auto p-6 sm:p-12 lg:p-20">
      @if (loading()) {
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      } @else if (error()) {
        <div class="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium text-center">
          {{ error() }}
        </div>
      } @else if (userProfile(); as profile) {
        <!-- Header Section -->
        <header class="mb-16">
          <h1 class="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6">
            User Account
          </h1>
          <div class="flex items-center gap-8">
            <div
              class="h-24 w-24 rounded-full bg-slate-900 flex items-center justify-center text-3xl font-light text-white"
            >
              {{ profile.name[0].toUpperCase() }}
            </div>
            <div>
              <h2 class="text-4xl font-black text-slate-900 tracking-tight mb-1">
                {{ profile.name }}
              </h2>
              <p class="text-lg text-slate-500 font-medium lowercase">{{ profile.email }}</p>
            </div>
          </div>
        </header>

        <!-- Information Grid -->
        <div class="space-y-12">
          <!-- Attributes -->
          <section class="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                Location
              </h3>
              <p class="text-xl font-bold text-slate-900">{{ profile.state }}</p>
            </div>
            <div>
              <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                Account Type
              </h3>
              <div class="flex flex-wrap gap-2">
                @for (role of profile.roles; track role) {
                  <span
                    class="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-600"
                  >
                    {{ role }}
                  </span>
                }
              </div>
            </div>
          </section>

          <hr class="border-slate-100" />

          <!-- Activity Summary -->
          <section>
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
              Voting Activity
            </h3>
            <div class="flex items-baseline gap-3">
              <span class="text-6xl font-black text-slate-900 tabular-nums leading-none">{{
                profile.votes.length
              }}</span>
              <span class="text-lg font-bold text-slate-500 uppercase tracking-widest"
                >Total Polls Participated</span
              >
            </div>
          </section>

          <hr class="border-slate-100" />

          <!-- Meta -->
          <footer class="pt-4">
            <p class="text-[10px] text-slate-400 font-medium">
              Member since {{ profile.created_at | date: 'MMMM yyyy' }}
            </p>
          </footer>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        background: white;
        min-height: 100%;
      }
    `,
  ],
})
export class MyProfileComponent implements OnInit {
  userProfile = signal<UserProfile | null>(null);
  loading = signal(true);
  error = signal('');
  private readonly userService = inject(UserService);

  ngOnInit(): void {
    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        this.userProfile.set(profile);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load profile information.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }
}
