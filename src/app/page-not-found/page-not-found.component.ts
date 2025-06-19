import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { inject } from '@angular/core/testing';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.sass']
})
export class PageNotFoundComponent implements OnInit {

  childData:string = null;
  parentData:string = null;

  constructor(
    private location:Location
  ) { }

  ngOnInit(): void { }

  back() {
    this.location.back();
  }

  child(event:Event){
    event.stopPropagation();
    this.childData = 'child clicked'
  }
  parent(event:Event) {
    event.stopPropagation()
    this.parentData = 'parent clicked'
  }

}
