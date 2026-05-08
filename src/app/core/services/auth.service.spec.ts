import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { SignUpRequest, LoginRequest } from '../interfaces/auth.interface';
import { TokenService } from './token.service';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenService: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, TokenService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(TokenService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call sign-up API and update auth state', () => {
    const signupData: SignUpRequest = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      state: 'Lagos',
      password: 'password123'
    };

    const mockResponse = { accessToken: 'at', refreshToken: 'rt' };

    service.signUp(signupData).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/sign-up`);
    req.flush(mockResponse);

    expect(service.isAuthenticated()).toBe(true);
  });

  it('should call login API and update auth state', () => {
    const loginData: LoginRequest = {
      email: 'john@example.com',
      password: 'password123'
    };

    const mockResponse = { accessToken: 'at', refreshToken: 'rt' };

    service.login(loginData).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(mockResponse);

    expect(service.isAuthenticated()).toBe(true);
  });

  it('should logout and clear auth state', () => {
    const clearSpy = vi.spyOn(tokenService, 'clearTokens');
    service.logout();
    expect(clearSpy).toHaveBeenCalled();
    expect(service.isAuthenticated()).toBe(false);
  });
});
