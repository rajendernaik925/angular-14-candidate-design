import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree,Router } from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from './auth.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(public router: Router,private authService: AuthService){}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    //   if (this.authService.isAuthenticated()) {
    //     // If they do, return true and allow the user to load app
    //     return true;
    // }

    

    //check user data condition  
    if (localStorage.getItem('userData') == null || localStorage.getItem('userData') == undefined)  {
      // alert('You are not allowed to view this page');
      Swal.fire({  
        icon: 'error',  
        title: 'Please Login', 
        text: 'You are not allowed to view this page!',
        showConfirmButton: false,  
        timer: 2000  
      })  
      this.router.navigate(['/login'], { replaceUrl: true });
      //redirect to login/home page etc
      //return false to cancel the navigation
        return false;
    }     
    return true;    
  }
  
}
