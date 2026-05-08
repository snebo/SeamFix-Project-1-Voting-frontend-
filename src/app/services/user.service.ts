import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  sub: string;
  email: string;
  state: string;
  roles: string[];
}
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl: string = environment.apiUrl;

  constructor(private httpClient: HttpClient) {
  }

  getProfile(): Observable<any>{
    const response = this.httpClient.get(`${this.apiUrl}/auth/profile`);
    console.log('response: ', response);
    return response;
  }
}
