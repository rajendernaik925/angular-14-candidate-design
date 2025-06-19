import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-assethistory',
  templateUrl: './assethistory.component.html',
  styleUrls: ['./assethistory.component.sass']
})
export class AssethistoryComponent implements OnInit {
  loggedUser: any = {};
  userData: any;
  myDate: any;
  employeeid: any;
  rmEmployeelist: any[] = [];
  searchText: string = '';
  search: any[] = [];
  isLoading: boolean = false; // To show loading indicator
  statusCode: any = [];
  ItemstatusCode: any = [];

  constructor(private service: AuthService) { }

  ngOnInit(): void {
    let loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(loggedUser);
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    this.employeeid = this.userData.user.empID;

    this.rmBasedEmployees();
  }

  rmBasedEmployees() {
    this.isLoading = true; 
    this.service.getRmAssetHistory(this.employeeid).subscribe((res: any) => {
      this.rmEmployeelist = res;
      this.search = res;
      this.service.getRmHistorystatus().subscribe((statusRes: any) => {
        this.statusCode = statusRes;
      });
      this.service.getRmHistoryItemStatus().subscribe((itemStatusRes: any) => {
        this.ItemstatusCode = itemStatusRes;
      });

      this.isLoading = false; 
    }, () => {
      this.isLoading = false; 
    });
  }

  getStatus(requestStatus: number): string {
    const status = this.statusCode.find((item) => item.code === requestStatus);
    return status ? status.status : 'Unknown';
  }
  getItemStatus(ItemStatus: number): string {
    const status = this.ItemstatusCode.find((item) => item.code === ItemStatus);
    return status ? status.status : 'Unknown';
  }

  selectedRequest: any = null;

  toggleViewMore(data: any) {
    if (this.selectedRequest === data) {
      this.selectedRequest = null;
    } else {
      this.selectedRequest = data;
    }
  }

  applySearchFilter() {
    if (!this.searchText) {
      this.rmEmployeelist = this.search;
      return;
    }
    this.rmEmployeelist = this.search.filter(item => {
      const employeeId = item.Id ? item.Id.toString().toLowerCase() : '';
      const callName = item.Name ? item.Name.toLowerCase() : '';
      return (
        employeeId.includes(this.searchText.toLowerCase()) ||
        callName.includes(this.searchText.toLowerCase())
      );
    });
    this.searchText = '';
  }

  goBack() {
    this.selectedRequest = '';
    this.rmBasedEmployees();
  }
}
