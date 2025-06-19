import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/auth.service';
import { ActiveUrlPipe } from '../active-url.pipe';

@Component({
  selector: 'app-asset-manager-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.sass']
})
export class assetManagerSideBarComponent implements OnInit {
  activeTab: string | null = null;
  isSidebarOpen: boolean = false;
  userData: any;
  employeeId: string = '';
  sidebarItems: any[] = [];

  private allSidebarItems = [
    {
      label: 'Dashboard',
      route: '/hiring-dashboard',
      matchRoutes: ['/hiring-dashboard', '/rejected', '/hold'],
    },
    {
      label: 'Candidate Shortlisted',
      route: '/shortlisted',
    },
    {
      label: 'Interview Scheduling',
      route: '/schedule',
    },
    {
      label: 'Interview Process',
      route: '/process',
    },
    {
      label: 'Offer Management',
      route: '/offer-letter',
    },
    {
      label: 'Employee Onboarding',
      route: '/employee-code',
    },
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.updateActiveTab(this.router.url);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateActiveTab((event as NavigationEnd).urlAfterRedirects);
      });

    const loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData') || ''));
    this.userData = JSON.parse(loggedUser);
    this.employeeId = this.userData.user.empID;

    this.loadUserRole();
  }

  loadUserRole(): void {
    this.authService.roles().subscribe({
      next: (res: any[]) => {
        const matchedUser = res.find(user => user.employeeId === this.employeeId && user.role === 'admin');
        const isAdmin = !!matchedUser;

        if (isAdmin) {
          this.sidebarItems = [...this.allSidebarItems];
        } else {
          this.sidebarItems = this.allSidebarItems.filter(item => item.label === 'Interview Process');
          if (this.router.url !== '/process') {
            this.router.navigate(['/process']);
          }
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching roles:', err);
        this.sidebarItems = this.allSidebarItems.filter(item => item.label === 'Interview Process');
        if (this.router.url !== '/process') {
          this.router.navigate(['/process']);
        }
      }
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


