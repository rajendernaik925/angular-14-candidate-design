import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.sass']
})
export class FooterComponent implements OnInit {
  year: number;
  linkText: string = ''; // Holds the link text (Azista, Hetero, Local)
  linkHref: string = ''; // Holds the link URL

  constructor() { }

  ngOnInit(): void {
    // Get the current year dynamically
    this.year = (new Date()).getFullYear();

     
 
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      console.log('Current Hostname:', hostname);
      // Set the link based on the hostname
      if (hostname === 'azistaindustries.com' || hostname === 'www.sso.azistaindustries.com') {
        this.linkText = 'Azista Industries';
        this.linkHref = 'https://www.azistaindustries.com/';
       // console.log(this.linkHref+""+this.linkText);
      } else if (hostname === 'heterohealthcare.com' || hostname === 'sso.heterohealthcare.com') {
        this.linkText = 'Hetero Healthcare Ltd';
        this.linkHref = 'https://www.heterohealthcare.com/';
        //console.log(this.linkHref+""+this.linkText);
      } else if (hostname === 'iconnect.azistabst.com' || hostname === 'sso.azistabst.com') {
        this.linkText = 'Azista-BST';
        this.linkHref = 'https://www.azistabst.com/';
      } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
        this.linkText = 'Local Environment';
        this.linkHref = '#';
        //console.log(this.linkHref+""+this.linkText);
      }
      console.log('Link Text:', this.linkText); // Verify the value is set correctly
    }
   }
}


