import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.sass']
})
export class SideBarComponent implements OnInit {

  // activeTab: string = '';
  // isFunctionalOpen: boolean = true;
  // homeIcon: string = 'fa fa-chevron-up';
  // isSidebarOpen: boolean = false;  // Track sidebar visibility

  // sidebarItems = [
  //   {
  //     label: 'Functional Requirements',
  //     icon:'bi bi-browser-edge',
  //     route: '',
  //     isDropdown: true,
  //     subItems: [
  //       { label: 'Job Registry', route: '/jobcode', icon:'bi bi-app-indicator' },
  //       { label: 'Vacancy Management', route: '/vacancy', icon:'bi bi-award' }
  //     ]
  //   },
  //   // {
  //   //   label: 'Non Functional Requirements',
  //   //   route: '/nonfunctional',
  //   //   icon:'bi bi-bullseye',
  //   //   isDropdown: false,
  //   //   subItems: []
  //   // },
  //   // {
  //   //   label: 'Use Case Scenarios',
  //   //   route: '/use-case',
  //   //   icon:'bi bi-calendar2-check-fill',
  //   //   isDropdown: false,
  //   //   subItems: []
  //   // },
  //   // {
  //   //   label: 'Appendices',
  //   //   route: '/appendices',
  //   //   icon:'bi bi-flower1',
  //   //   isDropdown: false,
  //   //   subItems: []
  //   // }
  // ];

  // constructor(private router: Router) {}

  // ngOnInit(): void {
  //   this.updateActiveTab(this.router.url);
  //   this.router.events
  //     .pipe(filter(event => event instanceof NavigationEnd))
  //     .subscribe((event: NavigationEnd) => {
  //       this.updateActiveTab(event.url);
  //     });
  // }

  // updateActiveTab(url: string): void {
  //   if (url.includes('/tracking')) {
  //     this.activeTab = '/vacancy';
  //   } else if (url.includes('/job-details')) {
  //     this.activeTab = '/jobcode';
  //   } else {
  //     this.activeTab = url;
  //   }
  // }

  // toggleSidebar(): void {
  //   this.isSidebarOpen = !this.isSidebarOpen;

  // }

  // toggleFunctionalRequirements(): void {
  //   this.isFunctionalOpen = !this.isFunctionalOpen;
  //   this.homeIcon = this.isFunctionalOpen ? 'fa fa-chevron-up' : 'fa fa-chevron-down';
  // }

  // setActive(item: string): void {
  //   if (item === '/tracking') {
  //     this.activeTab = '/vacancy';
  //   } else if (item === '/job-details') {
  //     this.activeTab = '/jobcode';
  //   } else {
  //     this.activeTab = item;
  //   }
  // }

  activeTab: string | null = null;
  isSidebarOpen: boolean = false;
  sidebarItems = [
    {
      label: 'Job Registry',
      route: '/jobcode',
    },
    {
      label: 'Vacancy Management',
      route: '/vacancy',
    },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateActiveTab(this.router.url);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateActiveTab((event as NavigationEnd).urlAfterRedirects);
      });
  }

  updateActiveTab(url: string): void {
    this.activeTab = url;
  }

  isRouteActive(item: any): boolean {
    if (item.matchRoutes && Array.isArray(item.matchRoutes)) {
      return item.matchRoutes.some(route => this.activeTab?.startsWith(route));
    }
    return this.activeTab?.startsWith(item.route);
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

}

