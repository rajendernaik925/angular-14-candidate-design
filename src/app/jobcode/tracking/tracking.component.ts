import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.sass']
})
export class TrackingComponent implements OnInit {

  myDate: any;
  rows:any
  candidateId:any;
  jobCodeId:any;
  email:any;
  candidateData:any[] = [];
  private dialogRef: any;
  isLoading: boolean = false;
  submitted:boolean = false;
  @ViewChild('newRoundDialog', { static: true }) newRoundDialog!: TemplateRef<any>;
  @ViewChild('feedbackform', { static: true }) feedbackform!: TemplateRef<any>;
  @ViewChild('selectedDialog', { static: true }) selectedDialog!: TemplateRef<any>;
  @ViewChild('interviewRound', { static: true }) interviewRound!: TemplateRef<any>;
  @ViewChild('reShedule', { static: true }) reShedule!: TemplateRef<any>;
  addNewRoundForm: FormGroup;
  feedbackForm: FormGroup;
  @Input() feedback = {
    candidateName: 'Kiran',
    level: 'Technical Round 1',
    interviewer: 'Bharath',
    rating: 4,
    comments: 'Strong technical knowledge but needs improvement in communication.'
  };

  stars = Array(5).fill(0);

  options1 = [
    { id: 1, name: 'Option 1' },
    { id: 2, name: 'Option 2' },
    { id: 3, name: 'Option 3' }
  ];

  options2 = [
    { id: 'a', name: 'Choice A' },
    { id: 'b', name: 'Choice B' },
    { id: 'c', name: 'Choice C' }
  ];

  selectedOption1: number | null = null; // Stores the selected value for the first dropdown
  selectedOption2: string | null = null;
  idBasedSubmit: number | null = null;



  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private router: Router,
    private authService:AuthService,
     private route: ActivatedRoute,
  ) {
    this.addNewRoundForm = this.fb.group({
      roundTitle: ['', Validators.required],
      interviewerName: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
    });

    this.feedbackForm = this.fb.group({
      q1: ['', Validators.required],
      q2: ['', Validators.required],
      q3: ['', Validators.required],
      q4: ['', Validators.required],
      q5: ['', Validators.required],
      q6: ['', Validators.required],
      q7: ['', Validators.required],
      q8: ['', Validators.required],
      feedbackText: ['', Validators.required],
      status: ['', Validators.required],
      nextRound: ['', Validators.required],
      employeeName: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));

    this.route.paramMap.subscribe(params => {
      this.jobCodeId = Number(params.get('id')) || null;
      this.idBasedSubmit = Number(params.get('id')) || null;
      console.log('Job Code ID:', this.idBasedSubmit);
    });

    this.candidateDetailData();
  }

  candidateDetailData(): void {
    this.isLoading = true;
    if (!this.jobCodeId) {
      this.isLoading = false;
      console.error('Email is required but not provided.');
      return;
    }
    this.authService.trackingData(this.jobCodeId).subscribe({
      next: (res: any[]) => {
        console.log("Response:", res);
        this.candidateData = res;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Error!',
          text: `Failed to fetch candidate data: ${err.message}`,
          icon: 'error',
          confirmButtonText: 'OK',
        });
        console.error('Error fetching candidate data:', err.message);
      },
    });
  }




  downloadResume(base64Data: string, fileName: string) {
    // Convert Base64 to a Blob
    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/octet-stream' });

    // Create a link element and trigger the download
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName || 'resume.pdf'; // Fallback file name
    link.click();
  }

  onSubmit(): void {
    console.log('Form Data:', this.addNewRoundForm.value);
    if (this.addNewRoundForm.valid) {
      console.log('Form Data:', this.addNewRoundForm.value);
    } else {
      console.log('Form is invalid');
    }
  }

  newRoundSubmit() {
    this.submitted = true;
    console.log("form data : ",this.feedbackForm.value)
  }

  startInterview() {
    this.submitted = false;
    this.dialogRef = this.dialog.open(this.interviewRound, {
      width: 'auto',
      height: '650px',
      hasBackdrop: true,
    });
  }

  reSheduleInterview() {
    this.submitted = false;
    this.dialogRef = this.dialog.open(this.reShedule, {
      width: 'auto',
      height: 'auto',
      hasBackdrop: true,
    });
  }

  newRound() {
    this.dialogRef = this.dialog.open(this.newRoundDialog, {
      width: 'auto',
      height: 'auto',
      hasBackdrop: true,
    });
  }

  close() {
    this.dialog.closeAll();
  }

  openFeedbackForm() {
    this.dialogRef = this.dialog.open(this.feedbackform, {
      width: 'auto',
      height: 'auto',
      hasBackdrop: true,
    });
  }

  selected() {
    this.dialogRef = this.dialog.open(this.selectedDialog, {
      width: 'auto',
      height: 'auto',
      hasBackdrop: true,
    });
  }

  back(){
    this.router.navigate(['/vacancy'])
  }

}

