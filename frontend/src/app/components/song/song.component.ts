import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-song',
  templateUrl: './song.component.html',
  styleUrls: ['./song.component.css']
})
export class SongComponent implements OnInit {

  @Input() result: any[];
  isClicked = false;

  constructor() { }

  ngOnInit() {
  }

  clicked() {
    this.isClicked = !this.isClicked;
    console.log(this.result)
  }

}
