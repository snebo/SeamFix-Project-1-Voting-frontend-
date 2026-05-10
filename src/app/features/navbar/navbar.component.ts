import {
  Component,
  computed,
  EventEmitter,
  inject,
  OnDestroy,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../services/user.service';
import { SearchService } from '../../services/search.service';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header
      class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 fixed top-0 right-0 left-0 lg:left-64 z-40 transition-all duration-300"
    >
      <div class="flex items-center gap-4">
        <!-- Hamburger Menu -->
        <button
          (click)="toggleSidebar.emit()"
          class="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <span class="text-xs sm:text-sm text-gray-600 hidden sm:block">
          Welcome back, <span class="font-semibold text-gray-900">{{ welcomeName() }}!</span>
          <span class="mx-2 text-gray-300">|</span>
          <span class="text-gray-500 font-medium">{{
            currentTime | date: 'MMM d, y, hh:mm a'
          }}</span>
        </span>
      </div>

      <div class="flex-1 max-w-xs sm:max-w-xl mx-4 sm:mx-8">
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              class="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search polls by title..."
            (input)="onSearch($event)"
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
          />
        </div>
      </div>

      <div class="flex items-center gap-3 sm:gap-6">
        <button
          class="relative text-gray-500 hover:text-gray-700 transition-colors hidden xs:block"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span
            class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
            >5</span
          >
        </button>

        <div class="relative">
          <button
            (click)="toggleProfileMenu($event)"
            class="flex items-center gap-2 sm:gap-3 sm:pl-6 sm:border-l border-gray-200 group focus:outline-none"
          >
            <div class="text-right hidden md:block">
              <p
                class="text-sm font-bold text-gray-900 leading-none group-hover:text-blue-600 transition-colors"
              >
                {{ userService.currentUser()?.email || 'User' }}
              </p>
              <p class="text-xs text-gray-500 mt-1">{{ displayRole() }}</p>
            </div>
            <div
              class="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white cursor-pointer group-hover:ring-blue-100 transition-all"
            >
              <img
                src="https://ui-avatars.com/api/?name={{ welcomeName() }}&background=random"
                alt="User avatar"
              />
            </div>
          </button>

          <!-- Profile Dropdown Menu -->
          <div
            *ngIf="isProfileMenuOpen()"
            class="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-md shadow-gray-300 border border-gray-100 py-2 z-50 transform origin-top-right transition-all"
          >
            <a
              href="#"
              class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              My Profile
            </a>
            <button
              (click)="logout()"
              class="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Invisible Backdrop to close menu -->
    <div
      *ngIf="isProfileMenuOpen()"
      (click)="isProfileMenuOpen.set(false)"
      class="fixed inset-0 z-30"
    ></div>
  `,
  styles: [],
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();

  isProfileMenuOpen = signal(false);
  protected readonly userService = inject(UserService);
  private readonly searchService = inject(SearchService);

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  welcomeName = computed(() => {
    const email = this.userService.currentUser()?.email;
    if (!email) return 'User';
    const firstPart = email.split('@')[0].split('.')[0].split('_')[0];
    return firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
  });
  displayRole = computed(() => {
    const roles = this.userService.currentUser()?.roles || [];
    if (roles.includes('admin')) return 'Admin';
    if (roles.includes('candidate')) return 'Candidate';
    return 'User';
  });
  currentTime: Date = new Date();
  private timer: any;
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.timer = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.searchService.setSearchTerm(term);
      });
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.isProfileMenuOpen.update((v) => !v);
  }

  logout(): void {
    this.isProfileMenuOpen.set(false);
    this.authService.logout('');
    this.userService.clearUser();
    this.searchService.clearSearch();
    this.router.navigate(['/login']);
  }
}
