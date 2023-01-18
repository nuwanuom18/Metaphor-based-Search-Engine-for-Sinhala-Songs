import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit {
  @Output() resultEvent: EventEmitter<any> = new EventEmitter();
  aggregations: any[];
  hits: any[];

  query: string;
  searched: boolean;

  constructor(private searchService: SearchService, private http: HttpClient) {}

  ngOnInit() {}

  search() {
    this.searchService.search(this.query).subscribe({
      next: (result) => {
        this.resultEvent.emit(result.hits);
        this.aggregations = result.aggs;
        this.hits = result.hits;
        this.searched = true;
        console.log(result);
      },
    });
  }

  clear() {
    this.query = '';
    this.resultEvent.emit([]);
    this.searched = false;
  }

  filterByArtist(key: any) {
    const newArr: any[] = [];
    this.hits.forEach((hit) => {
      if (hit._source.artist) {
        if (hit._source.artist === key) {
          newArr.push(hit);
        }
      }
    });
    this.resultEvent.emit(newArr);
  }

  filterByYear(key: any) {
    const newArr: any[] = [];
    this.hits.forEach((hit) => {
      if (hit._source.year) {
        if (hit._source.year === key) {
          newArr.push(hit);
        }
      }
    });
    this.resultEvent.emit(newArr);
  }

  filterByLy(key: any) {
    const newArr: any[] = [];
    this.hits.forEach((hit) => {
      if (hit._source.lyricist) {
        if (hit._source.lyricist === key) {
          newArr.push(hit);
        }
      }
    });
    this.resultEvent.emit(newArr);
  }

  filterByMetaphor(key: any) {
    const newArr: any[] = [];
    var x = 0;
    this.hits.forEach((hit) => {
      hit._source['metaphors'].forEach((metaphor) => {
        //console.log(hit._source['metaphors'][x]['source_domain']);
        if (metaphor['source_domain']) {
          if (metaphor['source_domain'] === key) {
            newArr.push(hit);
          }
        }
      });

      x = x + 1;
    });
    this.resultEvent.emit(newArr);
  }
  filterByMetaphorTraget(key: any) {
    const newArr: any[] = [];
    var x = 0;
    this.hits.forEach((hit) => {
      hit._source['metaphors'].forEach((metaphor) => {
        //console.log(hit._source['metaphors'][x]['source_domain']);
        if (metaphor['target_domain']) {
          if (metaphor['target_domain'] === key) {
            newArr.push(hit);
          }
        }
      });

      x = x + 1;
    });
    this.resultEvent.emit(newArr);
  }
}
