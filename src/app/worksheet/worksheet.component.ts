import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { AuthService } from '../auth.service';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, Validators,AbstractControl, ValidationErrors, ValidatorFn  } from '@angular/forms';
import { Console } from 'console';
import Swal from 'sweetalert2'; 
import { debounceTime, distinctUntilChanged, switchMap,catchError  } from 'rxjs/operators';
import { BehaviorSubject,Observable,of  } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { RefreshService } from '../refresh.service';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-worksheet',
 
  templateUrl: './worksheet.component.html',
  styleUrls: ['./worksheet.component.sass'],
})
export class WorksheetComponent implements OnInit {
  loggedUser: any;
  userData: any;
  myDate: any;
  isModalOpen = false;
  isSuccessModal = false;
  privileges: any = {};
  selectedIndex: number = 0;
 categories: any[] = [];
 taskAlignment:any[]=[];
 priority:any[]=[];
tasktype:any[]=[];
workPlace:any[]=[];
module:any[]=[];
outcome:any[]=[];
activities:any[]=[];
dependentPerson: string = '';
selectedActivity: string = '';  
plannedadhoc:any[]=[];
selectedCategoryId: number | null = null;
filteredActivities: string[] = [];
isConfirmationModalVisible: boolean = false;
isTaskUpdated: boolean = false;
editIndex: number | null = null; 
worksheetForm: FormGroup;
worksheetFormWithValues:FormGroup;
public getdata: any = {}; 
weeksummary:any[]=[];
teams:any[]=[];
dependents:any[]=[];
groupedTasks = [];
currentDate: Date = new Date(); 
taskDate: string = ''; 
isVisible: boolean = false;
date:any[]=[];
workDurationCalculation:string='';
isFirstModalVisible: boolean = false; 
isSecondModalVisible: boolean = false;
employeeId: any;
reportingManager : any;
employeename: any;
isLoading:boolean;
 timeBlock: string = '';
showDropdown = false; 

results: any[] = [];
authBoolean: boolean;
Ryts: any = {};
worksheet:any;
  private dependentPerson$ = new BehaviorSubject<string>(''); // Holds latest search input
 
constructor(private refreshService: RefreshService,public http: HttpClient,public authservice: AuthService, private fb:FormBuilder,public router: Router) {
    
 this.worksheetForm = this.fb.group({
   employeeId: [''], 
    taskDate: [this.currentDate, Validators.required],
    team: ['',[Validators.required, Validators.maxLength(150)]],
    name: [''],
    timeBlock: ['', [Validators.required, this.timeBlockValidator()]],
    taskDescription: ['',[Validators.required, Validators.maxLength(500)]],
    projectName: ['',[Validators.required, Validators.maxLength(150)]],
    taskAlignmentId: ['', Validators.required],
    dependentPerson: [''],
    
    categoryId: ['', Validators.required],
    activityId: ['', Validators.required],
    priorityId: ['', Validators.required],
    outcomeId: ['', Validators.required],
    taskTypeId: ['', Validators.required],
    plannedAdhocId: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
     duration: [{ value: '', disabled: true }, Validators.required],
    reportingManager:[''],
    remarks: ['',[Validators.maxLength(500)]],
    module: ['',[Validators.required, Validators.maxLength(50)]],
    workPlace: ['', Validators.required],
   workPlaceId:['']
  });
      

  // //console.log("worsheet",this.worksheetForm);

  }

//   onUpdate() {
//   if (this.worksheetForm.valid) {
//     const requestData = this.worksheetForm.value;

//     this.authservice.updateSummary(requestData)
//       .subscribe(
//         (response) => {
//           //console.log('Update successful', response);
//           alert('Worksheet updated successfully!');
//         },
//         (error) => {
//           console.error('Update failed', error);
//           alert('Error updating worksheet. Please try again.');
//         }
//       );
//   } else {
//     alert('Please fill in all required fields correctly.');
//   }
// }


onKeyDown(event: KeyboardEvent): void {
  ////console.log(`Key Down: ${event.key}`);

  // Prevent form submission on Enter key
  if (event.key === "Enter") {
    event.preventDefault();
  }
}

onKeyUp(event: KeyboardEvent): void {
  const dependentPerson = (event.target as HTMLInputElement).value.trim();
 // //console.log(`Key Up: ${event.key}, Current Text: ${dependentPerson}`);

  if (dependentPerson.length > 0) {
    this.performSearch(dependentPerson).subscribe();
  } else {
    // If input is empty, reset everything
    this.clearSearch();
  }
}

private clearSearch(): void {
  this.dependents = [];
  this.showDropdown = false;
  this.worksheetForm.get('dependentPerson')?.setValue('', { emitEvent: false });
  this.dependentPerson='';
}



  onKeyPress(event: KeyboardEvent): void {
  const dependentPerson = (event.target as HTMLInputElement).value.trim();
 ////console.log("call---")
  if (dependentPerson.length > 0) {
    this.performSearch(dependentPerson).subscribe();
  } else {
    // If input is empty, reset everything
    this.dependents = [];
    this.showDropdown = false;
    this.worksheetForm.get('dependentPerson')?.setValue('', { emitEvent: false });
  }
}

 onInputChange(value: string): void {
    if (value !== this.dependentPerson) {
      this.dependentPerson$.next(value); // Trigger search
    }
  }

  // 🔹 Search Function (Faster API Calls)
   private performSearch(dependentPerson: string): Observable<any> {
  if (!dependentPerson.trim()) {
    this.clearSearch();
    return of([]); // Return empty observable
  }

  return this.authservice.searchByName(dependentPerson).pipe(
    switchMap((res) => {
      ////console.log(res, "call---");

      if (res && res.length > 0) {
        this.dependents = res;
       // console.log(this.dependents);
        this.showDropdown = true;
      } else {
        this.clearSearch();
      }

      return of(res);
    }),
    catchError((error) => {
      console.error("Error fetching dependents:", error);
      this.clearSearch();
      return of([]);
    })
  );
}

  // 🔹 Handle Selection (Keep Value, Close Dropdown)
  selectDependent(dep: any): void {
    const selectedValue = `${dep.name}-${dep.id}`;
    this.dependentPerson = dep.id;
    this.worksheetForm.get('dependentPerson')?.setValue(selectedValue);
    this.showDropdown = false;
    this.dependents = [];
  }
 
  onChange(): void {
  const currentValue = this.worksheetForm.get('dependentPerson')?.value;
  if (currentValue !== this.dependentPerson) {
    this.worksheetForm.get('dependentPerson')?.setValue('');
    this.dependentPerson = ''; // Reset the selected dependent
  }
}
  

  ngOnInit(): void {
  
    if (this.refreshService.checkForRefresh('worksheet')) {
      this.refreshService.refreshData('worksheet');
    } else {
      //console.log('Worksheet refresh already done today');
    }

    this.loggedUser =  decodeURIComponent(window.atob(localStorage.getItem('userData')));

    this.userData = JSON.parse(this.loggedUser); 

    this.worksheet=this.userData.user.worksheet



    let x = decodeURIComponent(window.atob(localStorage.getItem('privileges')));
    this.Ryts = JSON.parse(x).Rights;
 
   // //console.log(this.Ryts);

  

    ////console.log(this.worksheet);
    this.authBoolean = false; 

      if (this.worksheet== "TRUE") {     
        this.authBoolean = true;
      }
    if (this.authBoolean == false) {
      let x = 'false';
      this.router.navigate(['/errorPage', { AuthrzdUser: x }]);
    }

    // Handle search input efficiently
    this.dependentPerson$
      .pipe(
        debounceTime(500), 
        distinctUntilChanged(), 
        switchMap((dependentPerson) => this.performSearch(dependentPerson))
      )
      .subscribe();
  

  


  //  this.worksheetForm.get('dependentPerson')?.valueChanges.subscribe(value => {
  //   if (value.trim().length > 0) {
  //     this.searchDependent(value);  
  //     this.showDropdown = true;  
  //   } else {
  //     this.dependents = [];  
  //     this.showDropdown = false;  
  //   }
  // });
 

 this.currentDate = new Date();
    
   // //console.log(this.userData);
    this.employeeId = this.userData.user.empID;
    this.reportingManager = this.userData.user.reportee;
    this.employeename=this.userData.user.name;
  this.worksheetForm.patchValue({ 
    name: this.employeename,
    employeeId: this.employeeId,
    reportee: this.reportingManager  
  });
    this.myDate = decodeURIComponent(
      window.atob(localStorage.getItem('currentDate'))
    );
    moment.locale('en');

    let privileges = decodeURIComponent(
      window.atob(localStorage.getItem('privileges'))
    );
 
    this.authservice.getTaskAlignment().subscribe((data)=>{
      this.taskAlignment=data;
    })
    this.authservice.getPriority().subscribe((data)=>{
      this.priority=data;
    })

    this.authservice.getTasktype().subscribe((data)=>{
      this.tasktype=data;
    })
    this.authservice.getWorkPlace().subscribe((data)=>{
      this.workPlace=data;
    
    })
    // this.authservice.getTeams().subscribe((data)=>{
    //   this.teams=data;
    // })
   
   //outcome
    this.authservice.getOutcome().subscribe((data)=>{
      this.outcome=data;
    })
     this.GetTasks(this.employeeId);
      this.GetSummary(this.employeeId);
    //plannedadhoc
    this.authservice.getPlannedadhoc().subscribe((data)=>{
        this.plannedadhoc=data;
    })

  this.loadCategories();
  }

selectedTaskId: number | null = null; // Track editing mode

onSubmit() {
    this.worksheetForm?.markAllAsTouched();

    if (this.worksheetForm.valid) {
      const formData = this.worksheetForm.value;
      const employeeId = this.userData.user.empID;
      const reportingManagerId = this.userData.user.reportee.split('-')[0] || "NA";

      const formattedStartTime = moment(formData.startTime, 'HH:mm').format('HH:mm:ss');
      const formattedEndTime = moment(formData.endTime, 'HH:mm').format('HH:mm:ss');

      let duration = '';
      if (formattedStartTime && formattedEndTime) {
        const start = moment(formattedStartTime, 'HH:mm:ss');
        const end = moment(formattedEndTime, 'HH:mm:ss');
        const durationObj = moment.duration(end.diff(start));
        duration = moment.utc(durationObj.asMilliseconds()).format('HH:mm:ss');
      }

      const mappedData = {
        ...formData,
        categoryId: Number(formData.categoryId),
        activityId: Number(formData.activityId),
        priorityId: Number(formData.priorityId),
        outcomeId: Number(formData.outcomeId),
        taskTypeId: Number(formData.taskTypeId),
        plannedAdhocId: Number(formData.plannedAdhocId),
        taskAlignmentId: Number(formData.taskAlignmentId),
        workPlaceId: Number(formData.workPlace),
        team: formData.team,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        duration: duration,
        reportingManager: reportingManagerId,
        dependentPerson: this.dependentPerson,
      };

      this.isLoading = true;

    if (this.selectedTaskId) {
        mappedData['sno'] = this.selectedTaskId;
        this.isTaskUpdated = true;
      } else {
        this.isTaskUpdated = false;
      }

      //console.log("mappeddata", mappedData);

      // CREATE (SAVE) API CALL
      this.authservice.saveWorksheet(mappedData).subscribe(
        (response) => {
          //console.log('Task Created:', response);
          this.taskDate = formData.taskDate ? moment(formData.taskDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
          this.resetForm();
          this.isVisible = false;
          this.isLoading = false;

          // ✅ Show confirmation modal
          setTimeout(() => {
            this.isConfirmationModalVisible = true;
          }, 100);

          this.GetTasks(employeeId);
        },
        (error) => this.handleError(error)
      );
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Form',
        text: 'Please fill out all required fields before submitting.',
      });
    }
  }



// Handle error messages
handleError(error: any) {
  this.isLoading = false;
  if (error.status === 409) {
    Swal.fire({
      icon: 'error',
      title: 'Oops!',
      text: error.error?.message,
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Submission Error',
      text: 'Error submitting the worksheet. Please try again.',
    });
  }
}
GetTasks(employeeId: any) {
  this.isLoading = true;
  this.authservice.getWorksheet(employeeId).subscribe((data: any) => {
    //console.log('API Response:', data); // Debugging step

    if (Array.isArray(data)) {
      this.getdata = { list: data, workDurationCalculation: '' }; // Ensure structure
    } else {
      this.getdata = {
        list: data.list || [],
        workDurationCalculation: data.workDurationCalculation || ''
      };
    }
    this.isLoading = false;
  }, error => {
    console.error("Error fetching tasks:", error);
    this.isLoading = false;
    this.getdata = { list: [], workDurationCalculation: '' };
  });
}

editTask(task: any) {
  this.openModal();
  this.selectedTaskId = task.sno;
// Convert time from HH:mm:ss to HH:mm
  const formattedStartTime = task.startTime ? moment(task.startTime, 'HH:mm:ss').format('HH:mm') : '';
  const formattedEndTime = task.endTime ? moment(task.endTime, 'HH:mm:ss').format('HH:mm') : '';
   const formattedDuration = task.duration ? moment(task.duration, 'HH:mm:ss').format('HH:mm') : '';

  this.worksheetForm.patchValue({
    ...task,
    sno: task.sno || null,
    workPlace: task.workPlaceId || '',
    dependentPerson: task.dependentPerson ? `${task.dependentPerson} - ${task.dependentPersonName}` : '',
    reportingManager: this.userData.user.reportee || '',
     startTime: formattedStartTime, 
    endTime: formattedEndTime, 
    duration: formattedDuration, 
  });

  //console.log('Form Values After Patch:', this.worksheetForm.value);

  // Fetch activities if categoryId exists
  if (task.categoryId) {
    this.loadActivities(task.categoryId);
  }
}


// Reset form after Save/Update
resetForm() {
  this.onReset();
  this.selectedTaskId = null; // Exit edit mode
}



  // Inside your component class (WorksheetComponent)
  // GetTasks(employeeId:any)
  // {
  //     this.isLoading=true;
  //   this.authservice.getWorksheet(employeeId).subscribe((data)=>{
  //     this.getdata=data;
  //      this.isLoading=false;
  //     ////console.log(this.getdata);
  //   })
  // }
  GetSummary(employeeId:any){
      this.authservice.getWeekSummary(employeeId).subscribe((data)=>{
      this.weeksummary=data;
     this.groupTasksByDate();
    })
  }
  loadActivities(categoryId: number): void {
  if (categoryId) {
    this.authservice.getActivity(categoryId).subscribe(
      (data) => {
        this.activities = data || [];
        //console.log('Fetched Activities:', this.activities);

        if (this.activities.length === 0) {
          console.warn('No activities found for categoryId:', categoryId);
        }

        // Set activityId only if activities are fetched
        setTimeout(() => {
          this.worksheetForm.patchValue({
            activityId: this.selectedTaskId ? this.worksheetForm.value.activityId : null,
          });
          this.worksheetForm.get('activityId')?.updateValueAndValidity();
        });
      },
      (error) => {
        console.error('Error fetching activities', error);
        this.activities = [];
      }
    );
  }
}

 loadCategories(){
  // category api
    this.authservice.getCategory().subscribe(
      (data)=>{
        this.categories=data;
      }
    )
 }
//  onCategoryChange() {
//   const selectedCategoryId = this.worksheetForm.get('categoryId')?.value;

//   if (selectedCategoryId) {
//     this.authservice.getActivity(selectedCategoryId).subscribe(
//       (data) => {
//         this.activities = [...data]; // ✅ Update activities list

//         // ✅ Reset the selected activity when category changes
//         this.worksheetForm.patchValue({ activityId: null });
//       },
//       (error) => {
//         console.error('Error fetching activities', error);
//       }
//     );
//   } else {
//     this.activities = [];
//   }
// }
onCategoryChange() {
  const selectedCategoryId = this.worksheetForm.get('categoryId')?.value;

  if (selectedCategoryId) {
    this.authservice.getActivity(selectedCategoryId).subscribe(
      (data) => {
        this.activities = [...data]; // Update activities list

        // If there are activities available, automatically select the first one
        if (this.activities.length > 0) {
          this.worksheetForm.patchValue({ activityId: this.activities[0].id });
        } else {
          this.worksheetForm.patchValue({ activityId: null });
        }
      },
      (error) => {
        console.error('Error fetching activities', error);
      }
    );
  } else {
    this.activities = [];
    this.worksheetForm.patchValue({ activityId: null });
  }
}

 selectTab(index: number): void {
    this.selectedIndex = index;
     ////console.log('Selected index:', this.selectedIndex); 
     this.GetTasks(this.employeeId);
     this.GetSummary(this.employeeId);
  }
 onReset(): void {
  this.showDropdown = false;
  ////console.log('Resetting the form...');
  this.worksheetForm.reset({
    taskDate: this.currentDate = new Date(),
    team: '',
    timeBlock: '',
    taskDescription: '',
    projectName: '',
    taskAlignmentId: '',
    dependentPerson: '',
    categoryId: '',
    activityId: '',
    priorityId: '',
    outcomeId: '',
    taskTypeId: '',
    plannedAdhocId: '',
    startTime: '',
    endTime: '',
    duration: '',
    reportingManager: '',
    remarks: '',
    workPlace: '',
    module: ''
  });

  ////console.log('Form after reset:', this.worksheetForm.value);

  // Then, patch the necessary values
  this.worksheetForm.patchValue({
    name: this.employeename,
    employeeId: this.employeeId,
    reportee: this.reportingManager
  });

  ////console.log('Form after patch:', this.worksheetForm.value);
}

onTimeChange(): void {
  const startTime = this.worksheetForm.get('startTime')?.value;
  let endTime = this.worksheetForm.get('endTime')?.value;

  if (!startTime) return;

  const start = moment(startTime, 'HH:mm');
  const end = moment(endTime, 'HH:mm');
if (!startTime || !endTime) {
    this.worksheetForm.patchValue({ duration: '' }); 
    return;
  }
  const minDuration = moment.duration(1, 'minute');
  if (end.isBefore(start) || end.diff(start) < minDuration.asMilliseconds()) {
    
    Swal.fire({
      icon: 'error',
      title: 'Oops!',
      text: `The end time (${endTime}) must be greater than the start time (${startTime}).`,
    });
    
    this.worksheetForm.patchValue({ duration: '' });
    this.worksheetForm.patchValue({ endTime: '' }); 
    return;
  }
  const duration = moment.duration(end.diff(start));
  const formattedDuration = moment.utc(duration.asMilliseconds()).format('HH:mm');
  this.worksheetForm.patchValue({ duration: formattedDuration });
}


   
//  onSubmit() {

//  //alert(this.validateInput());
//   // this.showerrorvalidateInput();

//   // const result = this.validateInput();
//    //alert(result);

//  this.worksheetForm?.markAllAsTouched();

// if (this.worksheetForm.valid) {
//   const formData = this.worksheetForm.value;
 
// const employeeId=this.userData.user.empID;
//   const formattedStartTime = moment(formData.startTime, 'HH:mm').format('HH:mm:ss');
//   const formattedEndTime = moment(formData.endTime, 'HH:mm').format('HH:mm:ss');
//  const reportingManagerId =  this.userData.user.reportee.split('-')[0] || "NA";
//    let duration = '';
//     if (formattedStartTime && formattedEndTime) {
//       const start = moment(formattedStartTime, 'HH:mm:ss');
//       const end = moment(formattedEndTime, 'HH:mm:ss');
//       const durationObj = moment.duration(end.diff(start));
//       duration = moment.utc(durationObj.asMilliseconds()).format('HH:mm:ss'); 
//     }
   
//   const mappedData = {
//     ...formData,
//     categoryId: Number(formData.categoryId),     
//     activityId: Number(formData.activityId),     
//     priorityId: Number(formData.priorityId),      // Convert to number
//     outcomeId: Number(formData.outcomeId),        // Convert to number
//     taskTypeId: Number(formData.taskTypeId),      // Convert to number
//     plannedAdhocId: Number(formData.plannedAdhocId), // Convert to number
//     taskAlignmentId: Number(formData.taskAlignmentId), // Convert to number
//     workplaceId: Number(formData.workplaceId),
//     team:formData.team,
//     startTime: formattedStartTime,
//     endTime: formattedEndTime,
//     duration: duration,
//     reportingManager: reportingManagerId,
//     dependentPerson: this.dependentPerson, 
//   };
//    ////console.log("formData", mappedData);

//   // return;
// this.isLoading=true;
//   this.authservice.saveWorksheet(mappedData).subscribe(
//     (response) => {
//       ////console.log('Form submitted successfully:', response);
//       this.taskDate = formData.taskDate;
//       this.onReset();
//        this.isVisible = false;
//       this.isConfirmationModalVisible = true;
//       this.GetTasks(employeeId);
//       this.isLoading=false;
//     },
//     (error) => {
//     if (error.status === 409) {
//           const errorMessage = error.error?.message;
          
//           Swal.fire({
//             icon: 'error',
//             title: 'Oops!',
//             text: errorMessage,
//           });
//         } else {
//           Swal.fire({
//             icon: 'error',
//             title: 'Submission Error',
//             text: 'Error submitting the worksheet. Please try again.',
//           });
//         }
//           this.isLoading=false;
//       }
//     );
//   } else {
//     Swal.fire({
//       icon: 'warning',
//       title: 'Invalid Form',
//       text: 'Please fill out all required fields before submitting.',
//     });
//     }
  
// }
openModal() {
  const reportingManagerId = this.userData.user.reportee.split('-')[0] || "NA";

  this.authservice.TeamsDisplay(reportingManagerId,this.userData.user.empID).subscribe(
    (teamData) => {
      this.teams = teamData; // Store team data
      this.isVisible = true; // Open modal after fetching data
    },
    (error) => {
      console.error('Error fetching team data:', error);
      Swal.fire('Error', 'Failed to fetch team data', 'error');
    }
  );
}
closeModal() {
  this.isVisible = false;
  this.resetForm(); 
  this.selectedTaskId = null; 
}

closeConfirmationModal() {
  this.isConfirmationModalVisible = false;
}
openSubmitModal() {
  this.isFirstModalVisible = true;
}
closeModal1() {
  this.isFirstModalVisible = false;
  this.isSecondModalVisible = false;
  this.isConfirmationModalVisible = false;
}
proceedToNextModal() {
  this.isFirstModalVisible = false;
  this.isSecondModalVisible = true; 
  this.isLoading=true;
  if (this.userData.user.empID) {
    
    this.authservice.userApproval(this.userData.user.empID).subscribe({
  next: (response:any) => {
     // //console.log('Approval submitted successfully:', response);
      //this.GetTasks(this.userData.user.empID); // Fetch updated tasks
    this.selectTab(1);
    this.isLoading=false;
   // this.GetSummary(this.userData.user.empID);   
    
  },
  error: (error) => {
    //console.error(`Approval submission returned an unexpected status: ${error.status}`);
  }
});

  } else {
    //console.warn('No employeeId provided for approval.');
  }
  }
    groupTasksByDate(): void {
    const grouped = {};
    for (let task of this.weeksummary) {
      if (!grouped[task.taskDate]) {
        grouped[task.taskDate] = [];
      }
      grouped[task.taskDate].push(task);
    }

   this.groupedTasks = Object.keys(grouped)
    .sort((a, b) => moment(b, 'YYYY-MM-DD').valueOf() - moment(a, 'YYYY-MM-DD').valueOf()) // Sort by date in descending order
    .map(date => ({
      taskDate: date,
      tasks: grouped[date],
    }));
  }
  
  preventFutureDates(event: any) {
    const selectedDate = new Date(event.target.value);
    const today = new Date();
    if (selectedDate > today) {
      event.target.value = this.currentDate;  // Reset the input to today's date
       Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: 'Future dates are not allowed!',
        confirmButtonText: 'OK'
      });
    }
  }

deleteTask(sno: number): void {
    
Swal.fire({
  title: 'Are you sure?',
  text: 'Do you want to delete this task?',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#d33',
  cancelButtonColor: '#3085d6',
  confirmButtonText: 'Yes, delete it!',
  cancelButtonText: 'Cancel',
 reverseButtons: true,
}).then((result) => {
      
    if (result.isConfirmed) {
      this.isLoading=true;
      this.authservice.deleteTask(sno).subscribe({
        next: (response) => {
          Swal.fire('Deleted!', 'Your task has been deleted.', 'success');
          this.isLoading=false;
        },
    error: (error) => {
    if (error.status === 200) {
    //   //console.log("Error condition met!");  // Confirm condition is met
    Swal.fire('success', 'Task deleted successfully.', 'success');
      this.GetTasks(this.userData.user.empID); 
        this.isLoading=false;
    } else {
      //console.warn(`Approval submission returned an unexpected status: ${error.status}`);
        this.isLoading=false;
    }
  }
  });
}
});
}

bsConfig = {
    dateInputFormat: 'YYYY-MM-DD',
    isAnimated: true,
    adaptivePosition: true,
    showWeekNumbers: false,
    containerClass: 'theme-blue',
    minDate: new Date(2024, 0, 1), // Minimum allowed date (e.g., 1900)
    maxDate: new Date() // Prevents selecting future dates
  };

  onDateChange(selectedDate: Date) {
    const today = new Date();

    if (selectedDate > today) {
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: 'Future dates are not allowed!',
        confirmButtonText: 'OK'
      });
      this.currentDate = new Date();
    }
  
  }restrictInvalidCharacters(event: KeyboardEvent): void {
  // Allow only digits (0-9) and dash ('-')
  const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  if (!allowedKeys.includes(event.key)) {
    event.preventDefault(); 
  }
}
KeyPress(event: KeyboardEvent): void {
  const inputChar = event.key;
  if (!/^[0-9]$/.test(inputChar)) {
    event.preventDefault();
  }
}
 generateTimeOptions(): void {
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 5) { // Change step if needed
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        this.allTimes.push(`${formattedHour}:${formattedMinute}`);
      }
    }
  }
 allTimes: string[] = [];
  selectedTime: string = '';
  selectTime(time: string): void {
    this.selectedTime = time;
    this.showDropdown = false;
  }
validateTimeBlock(event: Event): void {
  const input = event.target as HTMLInputElement;
  let value = input.value;
  if (value.length > 2) {
    input.value = value.slice(0, 2);
  }
  const numValue = Number(input.value);
  if (!input.value || numValue < 1 || numValue > 24) {
     Swal.fire({
      icon: 'error',
      title: 'Invalid Input!',
      text: 'Please enter a TimeBlock between 1 and 24 only.',
    });
    input.value = ''; 
  }
}


KeyValidation(event: KeyboardEvent): void {
  const charCode = event.charCode;
  // Allow only digits, a single dot for decimals, colon for time format, and control keys (Backspace, Tab, etc.)
  if (
    (charCode >= 48 && charCode <= 57) ||  // Digits
    charCode === 46 ||  // Period (.)
    charCode === 58 ||  // Colon (:)
    charCode === 8 ||   // Backspace
    charCode === 9      // Tab
  ) {
    return;
  } else {
    event.preventDefault(); // Block invalid input
  }
}  

// DecimalInput(event: KeyboardEvent): void {
//   const inputChar = event.key;
//   const currentValue = (event.target as HTMLInputElement).value;
 
//   // Allow numbers (0-9), period (.), and colon (:)
//   if (!/[\d\.\:]/.test(inputChar)) {
//     event.preventDefault(); // Prevent anything other than numbers, period, or colon.
//   }
 
//   // Prevent period (.) or colon (:) at the start of the input.
//   if ((inputChar === '.' || inputChar === ':') && currentValue === '') {
//     event.preventDefault(); // Prevent period or colon at the start.
//     return;
//   }
 
//   // Prevent entering '00' before or after the decimal or colon.
//   const parts = currentValue.split(/[\.:]/); // Split on period (.) or colon (:)
 
//   // Prevent more than two digits before the decimal or colon.
//   if (parts[0].length >= 2 && /\d/.test(inputChar) && !currentValue.includes('.') && !currentValue.includes(':')) {
//     event.preventDefault(); // Prevent entering more than 2 digits before the decimal or colon.
//     return;
//   }
 
//   // Prevent entering more than two digits after the decimal or colon.
//   if (parts.length === 2 && parts[1].length >= 2 && /\d/.test(inputChar)) {
//     event.preventDefault(); // Prevent entering more than 2 digits after the decimal or colon.
//     return;
//   }
//  if ((currentValue === '00.0' || currentValue === '00:0') && inputChar === '0') {
//     event.preventDefault(); // Prevent entering "0" after "00.0" or "00:0"
//     return;
//   }
//   // Prevent "00.00" or "00:00"
//    if ((currentValue === '00.0' || currentValue === '00:0') && /[1-9]/.test(inputChar)) {
//     // Let digits from 1 to 9 pass through.
//     return;
//   }
//   // Prevent second period (.) or colon (:) in the input.
//   if ((inputChar === '.' || inputChar === ':') && currentValue.includes(inputChar)) {
//     event.preventDefault(); // Prevent second period or colon.
//     return;
//   }
 
//   // Clear input if just a period (.) or colon (:) is entered alone
//   if (currentValue === '.' || currentValue === ':') {
//     (event.target as HTMLInputElement).value = ''; // Clear the input field
//     return;
//   }
// }

DecimalInput(event: KeyboardEvent): void {
  const inputChar = event.key;
  const currentValue = (event.target as HTMLInputElement).value;

  // Allow numbers (0-9) and period (.)
  if (!/[\d\.]/.test(inputChar)) {
    event.preventDefault(); // Prevent anything other than numbers or period.
  }

  // Prevent period (.) at the start of the input.
  if (inputChar === '.' && currentValue === '') {
    event.preventDefault(); // Prevent period at the start.
    return;
  }

  // Prevent entering '00' before or after the decimal.
  const parts = currentValue.split('.'); // Split on period (.)

  // Prevent more than two digits before the decimal.
  if (parts[0].length >= 2 && /\d/.test(inputChar) && !currentValue.includes('.')) {
    event.preventDefault(); // Prevent entering more than 2 digits before the decimal.
    return;
  }

  // Prevent entering more than two digits after the decimal.
  if (parts.length === 2 && parts[1].length >= 2 && /\d/.test(inputChar)) {
    event.preventDefault(); // Prevent entering more than 2 digits after the decimal.
    return;
  }

  // Prevent "00.00"
  if ((currentValue === '00.0') && inputChar === '0') {
    event.preventDefault(); // Prevent entering "0" after "00.0"
    return;
  }

  // Prevent second period (.) in the input.
  if (inputChar === '.' && currentValue.includes('.')) {
    event.preventDefault(); // Prevent second period.
    return;
  }

  // Clear input if just a period (.) is entered alone
  if (currentValue === '.') {
    (event.target as HTMLInputElement).value = ''; // Clear the input field
    return;
  }
}

 
preventPaste(event: ClipboardEvent): void {
  event.preventDefault(); // Disable paste action.
 // alert("Pasting is not allowed!");
}

validationsTimeBlock(event: Event): void {
  const input = (event.target as HTMLInputElement).value;

  // Regular expression for:
  // 1. Preventing leading zeroes or improper decimal input like "0.00", "00.00"
  // 2. Preventing invalid time-like input formats such as "00:00", "0:00", "00:0"
  const regex = /^(?!0(\.0{1,2})?$|\d{1,2}(:\d{2})?$)\d{1,2}(\.\d{1,2})?$/;

  if (input && !regex.test(input)) {
    // If invalid input, provide feedback and set a custom validity message
    (event.target as HTMLInputElement).setCustomValidity('Please enter a valid number or time format (1-24 hours, e.g., 2.5 or 2:30)');
  } else {
    // Reset custom validity if the input is valid
    (event.target as HTMLInputElement).setCustomValidity('');
  }
}
 
 
validateDecimalInput(event: KeyboardEvent): void {
  const inputChar = event.key;
  const currentValue = (event.target as HTMLInputElement).value;
 
  // Allow numbers (0-9), period (.), and colon (:)
  if (!/[\d\.\:]/.test(inputChar)) {
    event.preventDefault(); // Prevent anything other than numbers, period, or colon.
  }
 
  // Prevent period (.) or colon (:) at the start of the input.
  if ((inputChar === '.' || inputChar === ':') && currentValue === '') {
    event.preventDefault(); // Prevent period or colon at the start.
    return;
  }
 
  // Prevent entering '00' before or after the decimal or colon.
  const parts = currentValue.split(/[\.:]/); // Split on period (.) or colon (:)
 
  // Prevent more than two digits before the decimal or colon.
  if (parts[0].length >= 2 && /\d/.test(inputChar) && !currentValue.includes('.') && !currentValue.includes(':')) {
    event.preventDefault(); // Prevent entering more than 2 digits before the decimal or colon.
    return;
  }
 
  // Prevent entering more than two digits after the decimal or colon.
  if (parts.length === 2 && parts[1].length >= 2 && /\d/.test(inputChar)) {
    event.preventDefault(); // Prevent entering more than 2 digits after the decimal or colon.
    return;
  }
 if ((currentValue === '00.0' || currentValue === '00:0') && inputChar === '0') {
    event.preventDefault(); // Prevent entering "0" after "00.0" or "00:0"
    return;
  }
  // Prevent "00.00" or "00:00"
   if ((currentValue === '00.0' || currentValue === '00:0') && /[1-9]/.test(inputChar)) {
    // Let digits from 1 to 9 pass through.
    return;
  }
  // Prevent second period (.) or colon (:) in the input.
  if ((inputChar === '.' || inputChar === ':') && currentValue.includes(inputChar)) {
    event.preventDefault(); // Prevent second period or colon.
    return;
  }
 
  // Clear input if just a period (.) or colon (:) is entered alone
  if (currentValue === '.' || currentValue === ':') {
    (event.target as HTMLInputElement).value = ''; // Clear the input field
    return;
  }
}

  
   
  validateInput(): boolean  {
  const input = <HTMLInputElement>document.getElementById('timeblock');
  
  // Regular expression to reject invalid formats and allow time-like input like 0:01:
  // Disallows:
  // Numeric formats like 0.00, 00.0, 00., 0., .00, .0, 00.00, 00, etc.
  // Time-like formats such as 0:00, 00:0, 00:00, 0:, :00, etc.
  const regex = /^(?!0(\.0+)?$)(?!00(\.0+)?$)(?!0:|:0|00:|0:0|00:0|00:00$)(?!\.0$)(?!\.00$)(\d+(\.\d+)?|\.\d+|(\d{1,2}:\d{2}))$/;

  // Check the input against the regex pattern
  if (!regex.test(input.value)) {
      //alert('Invalid input. Please enter a valid number or time (no leading zeros, invalid decimals, or time-like formats).');
  
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input!',
        text: 'Time Block (Duration)* Invalid input. Please enter a valid number or time (no leading zeros, invalid decimals, or time-like formats).',
      });
      return false; // Return false for invalid input
    }

    return true; 
}
 

// To use this function:
  // Output: true or false based on validation

      timeBlockValidator(): ValidatorFn {
    const regex = /^(?!0(\.0+)?$)(?!00(\.0+)?$)(?!0:|:0|00:|0:0|00:0|00:00$)(?!\.0$)(?!\.00$)(\d+(\.\d+)?|\.\d+|(\d{1,2}:\d{2}))$/;
  
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && !regex.test(control.value)) {
        return { invalidTimeBlock: 'Time Block (Duration) format should be valid(hh.mm). Please enter a valid number or time (e.g., 1:30, 0.5, or 2.00) without leading zeros, invalid decimals, or time-like formats like 00.00, 0.00' };
      }
      return null; // return null if validation passes
    };
  }
  getOutcomeClass(outcomeName: string): string {
    switch (outcomeName) {
      case 'InProgress':
        return 'in-progress';
      case 'Completed':
        return 'completed';
      case 'Issues':
        return 'issues';
      case 'Need Guidance':
        return 'need-guidance';
      case 'Hold':
        return 'hold';
      default:
        return '';
    }
}
}
