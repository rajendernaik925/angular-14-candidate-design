import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-organogram-tracking',
  templateUrl: './organogram-tracking.component.html',
  styleUrls: ['./organogram-tracking.component.sass']
})
export class OrganogramTrackingComponent implements OnInit {

  @ViewChild('jobDialog', { static: true }) jobDialog!: TemplateRef<unknown>;
  @ViewChild('publishDialog', { static: true }) publishDialog!: TemplateRef<unknown>;

  private dialogRef: DialogRef<unknown> | null = null;

  teams = [
    { id: '3', name: 'Cyber Security' },
    { id: '5', name: 'DevOps' },
    { id: '7', name: 'Quality Assurance' },
    { id: '8', name: 'IT Support' }
  ];

  selectedTeamIndex: number = 0;

  constructor(private dialog: Dialog) {}

  ngOnInit(): void {}

  trackingPage(index: number): void {
    this.selectedTeamIndex = index;

    if (this.dialogRef) {
      return; 
    }

    this.dialogRef = this.dialog.open(this.jobDialog, {
      width: '300px',
      height: '300px',
      panelClass: 'card'
    });

    this.dialogRef.closed.subscribe(() => {
      this.dialogRef = null;
    });
  }
}
