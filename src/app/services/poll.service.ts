import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Options{
//TODO: interface for options
}
interface Vote{
// TODO: interface for votes
}
export interface PollResponse {
  id: string;
  title: string;
  description: string;
  state: string;
  expiresAt: Date;
  options: Options[];
  Votes: Vote[];
}

@Injectable({
  providedIn: 'root',
})
export class PollService {
  private readonly apiUrl: string  = environment.apiUrl;

  constructor(private httpClient: HttpClient) {
  }

  getPolls(state: string): Observable<any>{
    const params = new HttpParams().set('state', state)
    return this.httpClient.get(`${this.apiUrl}/poll`, { params });
  }

  getPoll(id: string): Observable<any>{
    return this.httpClient.get(`${this.apiUrl}/poll/${id}`);
  }
}
