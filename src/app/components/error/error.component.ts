import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.sass']
})
export class ErrorComponent implements OnInit {
  errCode:any;
  isMnger:any;
  AuthrzdUser:any; 
  constructor(public router: Router, private route: ActivatedRoute) { }

  gotoLogin(){
    
  this.router.navigate(['/login']);
  }

  ngOnInit(): void {

    // this.route.snapshot.paramMap.get('errorType')
    this.errCode =this.route.snapshot.paramMap.get('errorType');

    this.isMnger =this.route.snapshot.paramMap.get('isManager');
    this.AuthrzdUser = this.route.snapshot.paramMap.get('AuthrzdUser');
  }

}
