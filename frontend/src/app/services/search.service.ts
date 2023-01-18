import { Injectable, Input, OnInit, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private http: HttpClient) { }

  search(query: string) {
    return this.http.post<any>('http://localhost:3000/search', { query });
    // return this.http.get('http://localhost:3000/search');
  }
}
