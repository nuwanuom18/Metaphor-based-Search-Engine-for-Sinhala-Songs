import { Component, OnInit, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {

  @Input() searchResult: EventEmitter<any> = new EventEmitter();
  results = [];

  constructor() { }

  ngOnInit() {
    this.searchResult.subscribe(data => {
      console.log(data)
      this.results = data;
      console.log(this.results)
    });
  }

}
