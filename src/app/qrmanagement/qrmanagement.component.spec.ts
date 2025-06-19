import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QRManagementComponent } from './qrmanagement.component';

describe('QRManagementComponent', () => {
  let component: QRManagementComponent;
  let fixture: ComponentFixture<QRManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QRManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QRManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
