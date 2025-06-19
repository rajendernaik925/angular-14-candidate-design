import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-assetmain',
  templateUrl: './assetmain.component.html',
  styleUrls: ['./assetmain.component.sass']
})
export class AssetmainComponent implements OnInit {
  userData: any;
  myDate:any;
  IsManager:any;
  constructor() { }

  ngOnInit(): void {
    let loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(loggedUser);
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));

    let mngr =  this.userData.Manger[0].is_MANAGER 
    this.IsManager = mngr 
  }

}
