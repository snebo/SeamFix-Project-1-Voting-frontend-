import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div class="text-center">
        <h1 class="text-9xl font-bold text-slate-900">404</h1>
        <p class="text-2xl font-semibold text-slate-700 mt-4">Oops! Page not found</p>
        <p class="text-slate-500 mt-2 mb-8">
          The page you are looking for might have been removed or is temporarily unavailable.
        </p>
        <a
          routerLink="/"
          class="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          Go Back Home
        </a>
      </div>
    </div>
  `,
  styles: [],
})
export class NotFoundComponent {}
