import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-organogram',
  templateUrl: './organogram.component.html',
  styleUrls: ['./organogram.component.sass'],
})
export class OrganogramComponent implements OnInit {

  slideDirection = 100;
  organogramLogo:string = 'assets/img/job-code/Isolation_Mode.svg'
  hoveredCard: number | null = null;
  activeIndex: number | null = null;
  isOpen = false;
  data: any;
  isLoading: boolean = false;
  candidateInfo: any;
  activeDepartmentId: string | null = null;
  activeDepart1mentId: string | null = null;
  activeTeamLeadId: string | number | null = null;
  userData: any;
  teamData: any[] = [];
  teamLeadsData: any[] = [];
  teamEmpData: any[] = [];

  @ViewChild('teamLeadsScrollContainer', { static: false }) teamLeadsScrollContainer!: ElementRef;
  @ViewChild('departmentScrollContainer', { static: false }) departmentScrollContainer!: ElementRef;

  isDragging = false;
  startX = 0;
  scrollLeft = 0;
  empId: any;
  constructor(
    private router: Router,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    let loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(loggedUser);
    console.log("user data : ",this.userData)
    this.empId = this.userData.user.empID;
    this.listOfManagers(this.empId);
  }

  listOfManagers(EmpId: any) {
    this.isLoading = true;
    console.log("employee id : ", this.empId);
    this.isOpen = false;
    this.authService.listOfManagersforOrganogram(EmpId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        console.log("res", res);
        this.data = [...res];
        this.teamData = [];
        this.teamLeadsData = [];
        this.teamEmpData = [];
      },
      error: (err: HttpErrorResponse) => {
        console.log("error : ", err);
        this.isLoading = false
      }
    });
  }



  profileView(profile: any, event: Event): void {
    event.stopPropagation();
    this.isOpen = true;
    this.candidateInfo = profile;
    console.log("profile data : ",profile);
  }

  setActive(departmentId: string, event: Event): void {
    event.stopPropagation();
    this.activeDepartmentId = departmentId;
    this.isOpen = false;
    this.authService.listOfTeamleads(this.userData.user.empID, departmentId).subscribe({
      next: (res: any) => {
        console.log(res);
        this.teamLeadsData = res;
        this.teamData = [];
        this.teamEmpData = [];
      },
      error: (err: HttpErrorResponse) => {
        console.log("error : ", err)
      }
    })
  }

  setActive1(departmentId: string, event: Event): void {
    event.stopPropagation();
    this.isOpen = false;
    this.activeDepart1mentId = departmentId;
    this.authService.listOfTeamleads(this.empId, departmentId).subscribe({
      next: (res: any) => {
        console.log(res);
        this.teamEmpData = res;
        if(res.length === 0) {
          this.noDataFound();
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log("error : ", err)
      }
    })
  }

  setActiveTeamLead(id: string | number) {
    this.activeTeamLeadId = id;
    this.empId = id;
    this.isOpen = false;
    this.authService.listOfManagersforOrganogram(id).subscribe({
      next: (res: any) => {
        console.log(res, 'raaaaaa');
        this.teamData = res;
        if(res.length === 0) {
          this.noDataFound();
        }
        this.teamEmpData = [];
        this.activeDepart1mentId = null;
      },
      error: (err: HttpErrorResponse) => {
        console.log("error : ", err)
      }
    })
  }


  trackingPage(id: string) {
    this.router.navigate(['organogram', id]);
  }

  toggleOffcanvas(event: Event) {
    event.stopPropagation();
    this.isOpen = true;
  }

  closeOffcanvas() {
    this.isOpen = false;
  }

  onDragStart(event: MouseEvent, section: string): void {
    this.isDragging = true;
    this.startX = event.pageX;
    this.scrollLeft = section === 'teamLeads'
      ? this.teamLeadsScrollContainer.nativeElement.scrollLeft
      : this.departmentScrollContainer.nativeElement.scrollLeft;
  }

  // Drag move handler for scrollable elements
  onDragMove(event: MouseEvent, section: string): void {
    if (!this.isDragging) return;
    event.preventDefault();
    const x = event.pageX;
    const walk = (x - this.startX) * 1.5; // Adjust scroll speed
    if (section === 'teamLeads') {
      this.teamLeadsScrollContainer.nativeElement.scrollLeft = this.scrollLeft - walk;
    } else {
      this.departmentScrollContainer.nativeElement.scrollLeft = this.scrollLeft - walk;
    }
  }

  // Drag end handler to stop scrolling
  onDragEnd(): void {
    this.isDragging = false;
  }

  noDataFound() {
    console.log("swal called ")
    Swal.fire({
      title: 'Warning',
      text: 'No Data Found!',
      icon: 'warning',
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
    });
  }

}
