import { Component } from '@angular/core';

@Component({
  selector: 'app-use-case',
  templateUrl: './use-case.component.html',
  styleUrls: ['./use-case.component.sass']
})
export class UseCaseComponent {
  title = 'Resume Checker';
  message = 'Upload your resume and compare it with a job description.';

  jobDescription: string = '';
resumeFile: File | null = null;
result: string = '';

onResumeUpload(event: any): void {
  const file: File = event.target.files[0];
  if (file) {
    this.resumeFile = file;
  }
}

compare(): void {
  if (!this.resumeFile || !this.jobDescription.trim()) {
    this.result = 'Please upload resume and enter job description.';
    return;
  }

  // Placeholder logic
  this.result = `Comparing "${this.resumeFile.name}" with job description... (integration pending)`;
}

}
