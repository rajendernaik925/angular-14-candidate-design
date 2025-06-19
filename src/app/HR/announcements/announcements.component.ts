import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.sass']
})
export class AnnouncementsComponent implements OnInit {
  blogForm:FormGroup;
  
  constructor( private fb: FormBuilder) { }

  ngOnInit(): void {
   this.blogForm=this.fb.group({
     title: ['', Validators.required],
     data: ['', Validators.required],
     date: ['',Validators.required]
   })
  }

  postBlog(){
    console.log(this.blogForm.value)
  }

}
