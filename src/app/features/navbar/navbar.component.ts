import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header
      class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 fixed top-0 right-0 left-0 lg:left-64 z-40 transition-all duration-300"
    >
      <div class="flex items-center gap-4">
        <!-- Hamburger Menu Button -->
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
          Welcome back, <span class="font-semibold text-gray-900">Jane!</span>
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
            placeholder="Search"
            class="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
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

        <div class="flex items-center gap-2 sm:gap-3 sm:pl-6 sm:border-l border-gray-200">
          <div class="text-right hidden md:block">
            <p class="text-sm font-bold text-gray-900 leading-none">Jane Cooper</p>
            <p class="text-xs text-gray-500 mt-1">Admin</p>
          </div>
          <div
            class="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white cursor-pointer"
          >
            <img
              src="https://ui-avatars.com/api/?name=Jane+Cooper&background=random"
              alt="User avatar"
            />
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [],
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  currentTime: Date = new Date();
  private timer: any;

  ngOnInit(): void {
    this.timer = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
