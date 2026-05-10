import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';

export interface PollOption {
  id: string;
  label: string;
  voteCount: number;
  percentage?: number;
}

export interface PollResponse {
  id: string;
  title: string;
  description: string;
  state: string;
  expiresAt: Date;
  options: PollOption[];
  totalVoteCount: number;
  category?: string;
  isActive?: boolean;
  status?: 'LIVE' | 'TRENDING' | 'NEW' | 'CLOSED';
  trendingCount?: string;
  isFeatured?: boolean;
  userVotedOptionId?: string | null;
}

export interface UserVote {
  id: string;
  created_at: string;
  selectedOptionId: string;
  poll: PollResponse;
  pollOption?: { id: string };
}

@Injectable({
  providedIn: 'root',
})
export class PollService {
  private readonly apiUrl: string = environment.apiUrl;

  // TOGGLE THIS FLAG TO SWITCH BETWEEN MOCK AND LIVE DATA
  private readonly useMockData = false;

  constructor(private httpClient: HttpClient) {}

  getPolls(state: string): Observable<PollResponse[]> {
    if (this.useMockData) {
      return of(this.getMockPolls());
    }
    const params = new HttpParams().set('state', state);
    return this.httpClient.get<PollResponse[]>(`${this.apiUrl}/poll`, { params });
  }

  getPoll(id: string): Observable<PollResponse> {
    if (this.useMockData) {
      const poll = this.getMockPolls().find((p) => p.id === id);
      return of(poll || this.getMockPolls()[0]);
    }
    return this.httpClient.get<PollResponse>(`${this.apiUrl}/poll/${id}`);
  }

  getUserVote(pollId: string): Observable<string | null> {
    return this.httpClient.get<any[]>(`${this.apiUrl}/vote/me`).pipe(
      map((votes) => {
        const match = votes.find((vote) => vote.poll.id === pollId);
        return match ? match.selectedOptionId || match.pollOption?.id : null;
      }),
    );
  }

  getUserVotes(): Observable<UserVote[]> {
    if (this.useMockData) {
      return of(this.getMockUserVotes());
    }
    return this.httpClient.get<UserVote[]>(`${this.apiUrl}/vote/me`);
  }

  vote(pollId: string, optionId: string): Observable<any> {
    if (this.useMockData) {
      console.log(`Mock vote cast for poll ${pollId}, option ${optionId}`);
      return of({ success: true });
    }
    return this.httpClient.post(`${this.apiUrl}/vote`, {
      pollId: pollId,
      pollOptionId: optionId,
    });
  }

  createPoll(data: any): Observable<PollResponse> {
    return this.httpClient.post<PollResponse>(`${this.apiUrl}/poll`, data);
  }

  updatePoll(id: string, data: any): Observable<PollResponse> {
    return this.httpClient.put<PollResponse>(`${this.apiUrl}/poll/${id}`, data);
  }

  deletePoll(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/poll/${id}`);
  }

  togglePollStatus(id: string, isActive: boolean): Observable<PollResponse> {
    return this.httpClient.patch<PollResponse>(`${this.apiUrl}/poll/${id}`, { isActive });
  }

  private getMockUserVotes(): UserVote[] {
    return [
      {
        id: 'v1',
        created_at: new Date().toISOString(),
        selectedOptionId: '1a',
        poll: this.getMockPolls()[0],
      },
      {
        id: 'v2',
        created_at: new Date().toISOString(),
        selectedOptionId: '2b',
        poll: this.getMockPolls()[1],
      },
    ];
  }

  private getMockPolls(): PollResponse[] {
    return [
      {
        id: '1',
        title: 'Should AI-generated art be eligible for major awards?',
        description:
          'As AI models like Midjourney and DALL-E 3 become more sophisticated, the debate over artistic merit and authorship intensifies. Should these creations compete with human-made art?',
        state: 'Lagos',
        expiresAt: new Date(Date.now() + 50000000),
        totalVoteCount: 9482,
        category: 'Technology',
        status: 'LIVE',
        trendingCount: '+830 last hr',
        isFeatured: false,
        options: [
          { id: '1a', label: 'Yes, if the criteria is met', voteCount: 4930, percentage: 52 },
          { id: '1b', label: 'No, human-only creativity', voteCount: 2939, percentage: 31 },
          { id: '1c', label: 'Needs a new category', voteCount: 1613, percentage: 17 },
        ],
      },
      {
        id: '2',
        title: 'Which renewable energy source will dominate by 2035?',
        description:
          'Global energy transition is accelerating. Which technology do you believe will lead the charge in the next decade?',
        state: 'Abuja',
        expiresAt: new Date(Date.now() + 80000000),
        totalVoteCount: 34218,
        category: 'Energy',
        status: 'TRENDING',
        isFeatured: true,
        options: [
          { id: '2a', label: 'Solar power', voteCount: 14029, percentage: 41 },
          { id: '2b', label: 'Wind energy', voteCount: 9581, percentage: 28 },
          { id: '2c', label: 'Nuclear fusion', voteCount: 6501, percentage: 19 },
          { id: '2d', label: 'Hydrogen fuel cells', voteCount: 4107, percentage: 12 },
        ],
      },
      {
        id: '3',
        title: 'Is a four-day work week realistic for most industries?',
        description:
          'Many countries are piloting shorter work weeks with promising results in productivity and employee well-being.',
        state: 'Oyo',
        expiresAt: new Date(Date.now() + 150000000),
        totalVoteCount: 21104,
        category: 'Business',
        status: 'TRENDING',
        trendingCount: '+2.1k last hr',
        options: [
          { id: '3a', label: "Yes, productivity won't suffer", voteCount: 9285, percentage: 44 },
          { id: '3b', label: 'Only for some sectors', voteCount: 8019, percentage: 38 },
          { id: '3c', label: 'No, not practical', voteCount: 3800, percentage: 18 },
        ],
      },
      {
        id: '4',
        title: 'Best streaming platform of the year?',
        description:
          'With increasing competition and rising subscription costs, which service currently offers the best value and content?',
        state: 'Rivers',
        expiresAt: new Date(Date.now() + 200000000),
        totalVoteCount: 3871,
        category: 'Entertainment',
        status: 'NEW',
        trendingCount: '+318 last hr',
        options: [
          { id: '4a', label: 'Netflix', voteCount: 1354, percentage: 35 },
          { id: '4b', label: 'Max / HBO', voteCount: 1122, percentage: 29 },
          { id: '4c', label: 'Apple TV+', voteCount: 812, percentage: 21 },
          { id: '4d', label: 'Disney+', voteCount: 583, percentage: 15 },
        ],
      },
      {
        id: '5',
        title: 'Should social media platforms enforce stricter age verification?',
        description:
          'To protect minors from harmful content, some argue for mandatory ID-based verification systems.',
        state: 'Kano',
        expiresAt: new Date(Date.now() - 10000),
        totalVoteCount: 12500,
        category: 'Society',
        status: 'CLOSED',
        options: [
          { id: '5a', label: 'Yes, mandatory age gates', voteCount: 8875, percentage: 71 },
          { id: '5b', label: 'No, too much friction', voteCount: 3625, percentage: 29 },
        ],
      },
    ];
  }
}
