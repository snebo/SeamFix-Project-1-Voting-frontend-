import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface User {
  sub: string;
  email: string;
  state: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
}
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl: string = environment.apiUrl;

  readonly currentUser = signal<User | null>(null);

  constructor(private httpClient: HttpClient) {}

  getProfile(): Observable<User> {
    return this.httpClient
      .get<User>(`${this.apiUrl}/auth/profile`)
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  clearUser(): void {
    this.currentUser.set(null);
  }
}
