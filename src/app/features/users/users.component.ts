import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, UserService } from '../../services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div class="mb-10">
        <h1 class="text-4xl font-black text-gray-900 leading-tight">User Management</h1>
        <p class="mt-4 text-lg text-gray-600 max-w-3xl">
          Manage and view all registered users on the platform.
        </p>
      </div>

      @if (loading()) {
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      } @else if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {{ error() }}
        </div>
      } @else {
        <div
          class="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden"
        >
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/50 border-b border-gray-100">
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                    User
                  </th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                    State
                  </th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                    Roles
                  </th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (user of users(); track user.email) {
                  <tr class="hover:bg-gray-50/50 transition-colors group">
                    <td class="px-6 py-5">
                      <div class="flex items-center gap-3">
                        <div
                          class="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 group-hover:scale-110 transition-transform"
                        >
                          {{ user.firstName?.[0] || user.email[0].toUpperCase() }}
                        </div>
                        <div>
                          <p class="text-sm font-bold text-gray-900 leading-none mb-1">
                            {{ user.firstName }} {{ user.lastName }}
                          </p>
                          <p class="text-xs text-gray-500 font-medium">{{ user.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-5">
                      <span class="text-sm font-bold text-gray-700">{{ user.state }}</span>
                    </td>
                    <td class="px-6 py-5">
                      <div class="flex flex-wrap gap-1">
                        @for (role of user.roles; track role) {
                          <span
                            [class]="getRoleClass(role)"
                            class="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border"
                          >
                            {{ role }}
                          </span>
                        }
                      </div>
                    </td>
                    <td class="px-6 py-5">
                      <div
                        class="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-widest"
                      >
                        <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        Active
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class UsersComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal(true);
  error = signal('');
  private readonly userService = inject(UserService);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load users. You might not have permission.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  getRoleClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'candidate':
        return 'bg-orange-50 text-orange-600 border-orange-100';
      default:
        return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  }
}
