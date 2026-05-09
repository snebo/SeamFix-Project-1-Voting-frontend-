import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../features/navbar/navbar.component';
import { SidebarComponent } from '../../features/sidebar/sidebar.component';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex overflow-x-hidden">
      <app-sidebar [isOpen]="isSidebarOpen()" (toggleSidebar)="toggleSidebar()"> </app-sidebar>

      <div class="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-64">
        <app-navbar (toggleSidebar)="toggleSidebar()"></app-navbar>

        <main class="mt-16 p-4 sm:p-6 lg:p-8 overflow-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [],
})
export class MainLayoutComponent implements OnInit {
  private readonly userService = inject(UserService);
  isSidebarOpen = signal(false);

  ngOnInit(): void {
    this.userService.getProfile().subscribe();
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update((value) => !value);
  }
}
