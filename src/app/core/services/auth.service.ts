import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SignUpRequest, AuthResponse, LoginRequest } from '../interfaces/auth.interface';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly apiUrl = environment.apiUrl;

  private readonly _isAuthenticated = signal<boolean>(!!this.tokenService.getAccessToken());
  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  signUp(data: SignUpRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/sign-up`, data).pipe(
      tap(() => this._isAuthenticated.set(true))
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, data).pipe(
      tap(() => this._isAuthenticated.set(true))
    );
  }

  // does not take any data value
  logout(data: any): void {
    this.tokenService.clearTokens();
    // clear the refresh token
    this.http.post<void>(`${this.apiUrl}/auth/sign-out`, data).pipe()
    this._isAuthenticated.set(false);
  }
}
