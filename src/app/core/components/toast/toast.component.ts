import { Component, inject } from '@angular/core';

import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  template: `
    <div class="toast-container">
      @for (toast of toastService.activeToasts(); track toast.id) {
        <div class="toast" [class]="toast.type">
          {{ toast.message }}
          <button (click)="toastService.remove(toast.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .toast {
        padding: 12px 20px;
        border-radius: 4px;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-width: 200px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .success {
        background-color: #4caf50;
      }
      .error {
        background-color: #f44336;
      }
      .info {
        background-color: #2196f3;
      }
      button {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: 10px;
      }
    `,
  ],
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);
}
