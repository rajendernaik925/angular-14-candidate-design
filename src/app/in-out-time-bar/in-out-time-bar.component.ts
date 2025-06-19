import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-in-out-time-bar',
  templateUrl: './in-out-time-bar.component.html',
  styleUrls: ['./in-out-time-bar.component.sass']
})
export class InOutTimeBarComponent implements OnInit {
  @Input() progress: number;
  @Input() total: number;
  color: string;
  constructor() { }

  ngOnInit(): void {
    if (!this.progress) {
      this.progress = 0;
    }
    //if we don't have a total aka no requirement, it's 100%.
    if (this.total === 0) {
      this.total = this.progress;
    } else if (!this.total) {
      this.total = 100;
    }
    //if the progress is greater than the total, it's also 100%.
    if (this.progress > this.total) {
      this.progress = 100;
      this.total = 100;
    }
    this.progress = (this.progress / this.total) * 100;
    if (this.progress < 55) {
      this.color = 'red';
    } else if (this.progress < 75) {
      this.color = 'yellow';
    } else {
      this.color = 'green';
    }
  } 
}
