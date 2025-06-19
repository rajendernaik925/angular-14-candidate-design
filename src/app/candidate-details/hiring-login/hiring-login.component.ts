import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-hiring-login',
  templateUrl: './hiring-login.component.html',
  styleUrls: ['./hiring-login.component.sass']
})
export class HiringLoginComponent implements OnInit {

  loginForm: FormGroup;
  companyImage: string = 'assets/img/icons/company-name.png'
  submitted: boolean = false;
  isLoading: boolean = false;
  logginStatus: boolean = true;
  jobCodeData: any;
  loggedInData: any;
  isLoginExpired: boolean = false;
  logo: string = 'https://sso.heterohealthcare.com/iconnect/assets/img/logo.svg';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {
    this.loginForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],

      // password: ['',[Validators.required, Validators.minLength(6),Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/)]],
    });
  }

  ngOnInit(): void {
    // localStorage.removeItem('hiringLoginData');
    const loginData = JSON.parse(localStorage.getItem('hiringLoginData') || '{}');
    this.jobCodeData = loginData;
    console.log("loacl sto :", this.jobCodeData)
    const createdDateStr = this.jobCodeData?.createdDateTime;
    if (this.jobCodeData.status === '1001') {
      this.router.navigate(['/personal-info']);
    }
  }

  onlyNumbers(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (!/[0-9]/.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.isLoading = true;

    if (this.loginForm.valid) {
      const payload = {
        email: String(this.loginForm.get('email')?.value).trim(),
        password: this.loginForm.get('password')?.value?.trim() || ''
      };

      console.log("Form data to be sent:", payload);

      this.authService.hiringLogin(payload).subscribe({
        next: (res: HttpResponse<any>) => {
          this.isLoading = false;
          this.logginStatus = false;
          this.loggedInData = res.body;
          console.log("login time : ", this.loggedInData?.createdDateTime)

          // ✅ Check expiration and return early if expired
          // if (this.checkIfLoginExpired(this.loggedInData?.createdDateTime)) {
          //   this.isLoginExpired = true;
          //   return false; 
          // }



          if (res.status === 200) {
            localStorage.setItem('hiringLoginData', JSON.stringify(res.body));

            // Optional: clear login data after 5 days
            // const fiveDays = 5 * 24 * 60 * 60 * 1000;
            // setTimeout(() => {
            //   localStorage.removeItem('hiringLoginData');
            // }, fiveDays);

            Swal.fire({
              title: 'Success',
              text: 'Login successful!',
              icon: 'success',
              showConfirmButton: false,
              timer: 1000,
              timerProgressBar: true,
            });

            setTimeout(() => {
              this.router.navigate(['/personal-info']);
            }, 1000);
          } else {
            Swal.fire({
              title: 'Warning',
              text: res.statusText || 'Unexpected response from server.',
              icon: 'warning',
              confirmButtonText: 'OK',
            });
          }
        },

        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          console.error("Error Response: ", err);

          let errorMessage = 'Something went wrong. Please try again!';
          if (err.status === 400) {
            errorMessage = err.error?.message || 'Invalid credentials!';
          } else if (err.status === 401) {
            errorMessage = 'Unauthorized access!';
          } else if (err.status === 500) {
            errorMessage = 'Server error. Please try again later!';
          }

          Swal.fire({
            title: 'Error',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      });
    } else {
      this.isLoading = false; // Ensure loading state is reset
      this.loginForm.markAllAsTouched();
    }
  }

  checkIfLoginExpired(createdDateStr: string): boolean {
    if (!createdDateStr) return true; // If no date, consider it expired

    const createdDate = new Date(createdDateStr);
    const now = new Date();

    const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;
    return now.getTime() - createdDate.getTime() > fiveDaysInMs;
  }



  featureCards = [
  {
    title: 'Appointment',
    img: 'https://www.heterohealthcare.com/assets/img/Discover-insightsdesk.jpg?Version=4.68',
    description: 'Easily schedule, manage, and track your medical appointments'
  },
  {
    title: 'Reports',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQno_MwOp___Iv6ynEvwDRHeq9cTXIFqqlmgw&s',
    description: 'Get access to diagnostic reports securely and quickly'
  },
  {
    title: 'Doctors',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTV5I7p75joxiIGRH_ji8bXmU6atXP39RLt6g&s',
    description: 'Connect with healthcare professionals anytime'
  },
  {
    title: 'Updates',
    img: 'https://static.vecteezy.com/system/resources/thumbnails/050/539/230/small/chinese-teenage-girl-resting-in-a-hospital-bed-recovering-from-illness-in-a-medical-facility-for-health-and-wellness-posters-cards-and-brochures-photo.jpg',
    description: 'Stay updated with the latest health insights'
  }
];








}

