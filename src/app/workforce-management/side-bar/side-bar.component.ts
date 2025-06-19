import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-fieldwork-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.sass']
})
export class FieldWorkSideBarComponent implements OnInit {

 
   activeTab: string | null = null;
   isSidebarOpen: boolean = false; 
 
   sidebarItems = [
     {
       label: 'Dashboard',
       route: '/fieldwork-dashboard',
       // icon:'bi bi-bullseye',
     },
     {
       label: 'Registered',
       route: '/field-employees',
       // icon:'bi bi-bullseye',
     },
     {
       label: 'Registration',
       route: '/abcd',
       // icon:'bi bi-calendar2-check-fill',
     },
     {
       label: 'Confirmed',
       route: '/abcd',
       // icon:'bi bi-flower1',
     },
     {
       label: 'fieldwork Report',
       route: '/abcd',
       // icon:'bi bi-flower1',
     },
     {
       label: 'User Rights',
       route: '/abcd',
       // icon:'bi bi-flower1',
     },
     {
      label: 'HQ/Region Creation',
      route: '/abcd',
      // icon:'bi bi-flower1',
    },
    {
      label: 'Move to HRMS',
      route: '/fieldwork-hrms',
      // icon:'bi bi-flower1',
    },
   ];
 
   constructor(private router: Router) {}
 
   ngOnInit(): void {
     this.updateActiveTab(this.router.url);
     this.router.events
       .pipe(filter(event => event instanceof NavigationEnd))
       .subscribe((event: NavigationEnd) => {
         this.updateActiveTab(event.url);
       });
   }
 
   updateActiveTab(url: string): void {
       this.activeTab = url;
   }
 
   toggleSidebar(): void {
     this.isSidebarOpen = !this.isSidebarOpen;
   }
 
 }
 