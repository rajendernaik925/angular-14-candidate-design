import { Injectable } from '@angular/core';
import { User } from './user';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  // production public path 
  // new URL    
  // baseUrl: any = "https://sso.heterohcl.com/heteroiconnect/";
  baseUrl: any = "http://192.168.30.107:8000/stageheteroiconnect/";
  imgbase: any = "https://sso.heterohcl.com/";


  // test path 
  //  baseUrl: any = "http://192.168.30.223:8000/heteroiconnect/"; 
  //  imgbase:any = "http://192.168.30.223:8000/"; 

  // Local path   
  // baseUrl: any = "http://172.19.1.116:8094/";  
  // imgbase:any = "http://172.19.1.116:8094/";

  // baseUrl: any = "http://192.168.215.154:8094/"; 
  // imgbase:any = "http://192.168.215.154:8094/";

  // Bulkuplod

  //private bulkUploadUrl='http://192.168.214.167:8084/'

  private bulkUploadUrl = 'https://sso.heterohcl.com/bulkupload/'

  constructor(public router: Router, private http: HttpClient) { }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = '';
    if (error.status === 0) {
      errorMessage = error.message;
    } else {
      errorMessage = error.error;
    }
    Swal.fire({
      title: 'Server Error',
      text: error.error.message,
      icon: 'error',
      showConfirmButton: true,           // Show the confirm (close) button
      confirmButtonText: 'Close',        // Optional: change text from "OK" to "Close"
      // timer: 1000,                       // Optional: auto close after 1 second
      // timerProgressBar: true
    });

    return throwError(() => errorMessage);
  }



  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    })
  };

  public selectedCheckbox = new BehaviorSubject<any>('');
  data = this.selectedCheckbox.asObservable();


  updatedSelection(data) {
    this.selectedCheckbox.next(data);
  }

  public sendPostRequest(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'loginaction/login', data);
  }

  public panFirstverify(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'profile/pan_first_verify', data);
  }

  public panValid(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'profile/login_pan_employee_verification', data);
  }

  public correctionPAN(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'profile/login_pan_employee_upload', data);
  }
  //profile/login_pan_employee_upload

  public experience(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'loginaction/experience', data);
  }

  // public todayLogins(data: any): Observable<any> {
  //   return this.http.post<any>(this.baseUrl + 'loginaction/todaylogin', data);
  // }
  public todayLoginTime(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'loginaction/todaylogintime', data);
  }
  public announcement(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'loginaction/announcement', data);
  }

  public loginSession(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'loginaction/session', data);
  }

  public HRpolicies(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'loginaction/hrdocuments', data);
  }

  // public demo(data:any):Observable<any>{
  //   return this.http.post('http://androidapp.heterohcl.com/officesisto/iconapp/Bu_emplist',data);
  // }

  public attendance(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'loginaction/attendance', data);
  }
  public leavequota(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'loginaction/leavequota', data);
  }
  public locationsearch(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'loginaction/locationsearch', data);
  }
  public applyleave(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'leavemanagement/applyleave', data);
  }

  public holidaylist(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'loginaction/holidaylist', data);
  }
  public department(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'loginaction/department', data);
  }

  public birthdaylist(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'loginaction/birthdaylist', data);
  }

  public leavesummary(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'loginaction/leavesummary', data);
  }

  public cancleLeaveReq(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'loginaction/LeaveSelfCancel', data);
  }
  public attrequest(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'loginaction/attrequest', data);
  }
  public transactiondates(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'loginaction/transactiondates', data);
  }

  public changepassword(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'loginaction/changepassword', data);
  }
  public profilepicview(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'loginaction/profilepicview', data);
  }
  // public profilepic(data:any): Observable<any> {   
  //   return this.http.post<any>(this.baseUrl + 'loginaction/profilepic', data);
  // }
  public empverify(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'forgot/empverify', data);
  }
  public getOtp(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'forgot/getotp', data);
  }
  public otpverify(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'forgot/otpverify', data);
  }
  public forgotpassword(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'forgot/forgotpassword', data);
  }
  public Leavetypes(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'leavemanagement/Leavetypes', data);
  }
  public eligibleleaves(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'leavemanagement/eligibleleaves', data);
  }


  addFileUplaodService(model: any) {
    return this.http.post(this.baseUrl + 'loginaction/profilepic', model, { responseType: 'text' })
      .toPromise()
      .then(response => response.toString())
    // .catch(this.handleError);
  }

  public removeProPic(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'profile/remove_profilepic', data);
  }
  public itsDocs(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'employeeflexi/ITS', data);
  }

  public empPayslips(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'employeeflexi/payslips', data);
  }

  public empAppraisal(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'loginaction/appraisal', data);
  }
  public empCtc_view(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ctcinfo/ctcview', data);
  }
  public editProfile_statesList(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'location/states', data);
  }
  public editProfile_citiesList(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'location/cities', data);
  }
  public emp_EditProfileRequest(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'profile/employee_request', data);
  }
  public emp_EditRequest_Status(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'profile/Request_Status', data);
  }
  public empRelationshipList(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'location/Relations', data);
  }
  public bankNamesList(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'location/BankDetails', data);
  }

  public empAccntFileUpload(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'profile/fileupload', data);
  }
  public panverify(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'profile/panverify', data);
  }
  public empVaccineDetails(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'vaccine/empvaccinedetails', data);
  }
  public FmlyVaccineDetails(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'vaccine/Family', data);
  }
  public vaccinetypes(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'vaccine/vaccinetypes', data);
  }
  public vaccine_entry(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'vaccine/vaccine_entry', data);
  }

  public family_vaccine(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'vaccine/familyrequest', data);
  }
  //vaccine/familyrequest
  public getJDPdf(emp: string) {
    return this.http.get<any>(`${this.baseUrl}/Job/JobDescription/${emp}`, { responseType: 'arraybuffer' as 'json' });
  }
  public getPdf(emp: string, pwd: string, payperiod: string, bu: string) {
    return this.http.get<any>(`${this.baseUrl}/employeeflexi/get/pdf/${emp}/${pwd}/${payperiod}/${bu}`, { responseType: 'arraybuffer' as 'json' });
  }
  public getITPdf(emp: string, pwd: string, type: string) {
    return this.http.get<any>(`${this.baseUrl}/employeeflexi/get/ITpdf/${emp}/${pwd}/${type}`, { responseType: 'arraybuffer' as 'json' });
  }

  public getAppointmentPdf(emp: string, pwd: string, type: string) {
    return this.http.get<any>(`${this.baseUrl}/employeeflexi/get/letter/${emp}`, { responseType: 'arraybuffer' as 'json' });
  }

  public getIncrementPdf(emp: string, pwd: string, type: string) {
    return this.http.get<any>(`${this.baseUrl}/employeeflexi/get/incrementletter/${emp}`, { responseType: 'arraybuffer' as 'json' });
  }


  public getConfirmationPDF(emp: string, type: string) {
    console.log(emp);
    return this.http.get<any>(`${this.baseUrl}/employeeflexi/get/confirmationletter/${emp}`, { responseType: 'arraybuffer' as 'json' });
  }

  public CheckJDFILE(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Job/JobDescription/checkJD', data);
  }

  public NoticeModel(emp: string): Observable<any> {

    return this.http.get<any>(`${this.baseUrl}/Job/Notice/${emp}`);
  }




  // ++++++++++ Manager APIs ++++++++++++++
  public managersummary(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'loginaction/managersummary', data);
  }
  public Leaveaccept(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'loginaction/Leaveaccept', data);
  }
  public manager_DeptAttendance(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'department_attendance/manager_attendance', data);
  }
  // public managerattendancereq(data:any): Observable<any> {
  //   return this.http.post<any>(this.baseUrl + 'loginaction/managerattendancereq', data);
  // }
  public assessmentformlist(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'assesment/assessmentformlist ', data);
  }
  public assessment_accesslink(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'assesment/assessmentaccesslink ', data);
  }


  // +++++++++++++ HR APIs +++++++++
  public privileges(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'employeerights/privileges', data);
  }
  public assesment_initiate(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'assesment/initiate', data);
  }
  public assesment_apprvlreport(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'assesment/assesementapprovalreport', data);
  }
  public assesment_permanentreport(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'assesment/permanentreport', data);
  }
  public assesment_hrprocess(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'assesment/hrprocess', data);
  }
  public assesment_extendreport(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'assesment/assesementextendreport', data);
  }
  public assesment_fromview(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'assesment/assesmentfromview', data);
  }
  public assmnt_emp_profiledata(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'assesment/assementemployeeprofiledata', data);
  }
  public assmnt_feedback(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'assesment/assessmentfeedback', data);
  }
  public assmnt_nextApproval(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'assesment/nextApproval', data);
  }
  public assmnt_submit(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'assesment/assessmentsubmit', data);
  }

  public saturdaypolicycheck(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'employeeflexi/saturdaypolicycheck', data);
  }
  public unfreeze_empinfo(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'leavemanagement/empinfo', data);
  }
  public unfreeze_empTransctnDate(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'leavemanagement/emptransaction', data);
  }
  public unfreeze_empshowleavetypes(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'leavemanagement/empshowleavetypes', data);
  }
  public unfreeze_empReq(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'leavemanagement/unfreezrequest', data);
  }
  public unfreezAttendanceReq(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'leavemanagement/unfreezAttendanceReq', data);
  }

  public unfreez_Att_Req_add(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'leavemanagement/unfreez_Att_Req_add', data);
  }


  public empFlexiPolcy_BU(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'employeeflexi/employeebusinessunit', data);
  }

  public empFlexiGetList(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'employeeflexi/flexilist', data);
  }
  public empFlexiAssignRemove(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'employeeflexi/AssignRemove', data);
  }
  public empProfileEditReqsts(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'profile/employee_view', data);
  }
  public saturdayflexilist(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'employeeflexi/saturdayflexilist', data);
  }

  public saturdayAssignRemove(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'employeeflexi/saturdayAssign', data);
  }

  public empHR_view(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'profile/hr_view', data);
  }
  public empProfileEditReqstsApprove(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'profile/Employee_Requests_Approve', data);
  }
  public empProfileEditReqstsCount(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'profile/dashboard', data);
  }

  public reviewletter(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'reviewletter/letter', data);
  }

  public Genrateletter(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'reviewletter/Genrateletter', data);
  }

  public letterprivileges(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'reviewletter/Appointmentlink', data);
  }

  public hikereviewletter(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'increment/letter', data);
  }
  public incrementletterprivileges(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'increment/incrementlink', data);
  }

  public confirmationletterprivileges(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'promotionletters/confirmationlink', data);
  }

  public empPayPeriod(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Payslips/GetPayperiod', data);
  }

  public PayslipUploadCSVFILE(data: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}Payslips/upload`, data).pipe(
      tap(response => {
        // Handle success here if needed
      }),
      catchError(error => {
        // Handle error here
        return throwError(error);
      })
    );
  }


  empSubmit(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}sindhuridetails/empsubmit`, formData);
  }

  getEmpData(formData: FormData): Observable<Blob> {
    return this.http.post<Blob>(`${this.baseUrl}sindhuridetails/emptotaldata`, formData);
  }

  deleteEmployee(sno: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}sindhuridetails/deletefamilymember/${sno}`, {});
  }

  updateEmployee(data: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}sindhuridetails/empupdate`, data);
  }

  insertFamilyMember(data: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}sindhuridetails/insertfamilymembers`, data);
  }


  getDepartments(): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'master/departments', {});
  }

  getDesignations(): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'master/designations', {});
  }

  getUniversitys(): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'master/universitys', {});
  }

  insertUniversity(formData: FormData): Observable<string> {
    return this.http.post<string>(this.baseUrl + 'master/insertUniversity', formData);
  }

  insertDepartment(formData: FormData): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'master/insertdepartment', formData);
  }

  insertDesignation(formData: FormData): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'master/insertdesignation', formData);
  }

  updateUniversity(universityid: any, name: any, createdby: any, type: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}master/updateUniversity/${universityid}/${name}/${createdby}/${type}`, {});
  }

  updateDesignation(designationid: any, name: any, code: any, status: any, modifiedby: any, type: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}master/updateDesignation/${designationid}/${name}/${code}/${status}/${modifiedby}/${type}`, {});
  }

  updateDepartment(departmentid: any, name: any, code: any, status: any, modifiedby: any, type: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}master/updateDepartment/${departmentid}/${name}/${code}/${status}/${modifiedby}/${type}`, {});
  }

  getBusinessunit(formData: FormData): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'master/businessunit', formData);
  }

  assignDepartments(formData: FormData): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'master/assignDepartment', formData);
  }

  assignDesignations(formData: FormData): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'master/assignDesignation', formData);
  }

  assignDepartmentinsert(data: any[]): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'master/insertassigndepartment', data);
  }

  assignDesignationinsert(data: any[]): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'master/insertassigndesignation', data);
  }


  getEduationLevel(): Observable<any> {
    return this.http.post(this.baseUrl + 'master/educationlevel', {})
  }
  getEducationqualification(formData: FormData): Observable<any> {
    return this.http.post(this.baseUrl + 'master/educationqualifiaction', formData)
  }
  getEducationbranch(formData: FormData): Observable<any> {
    return this.http.post(this.baseUrl + 'master/branch', formData)
  }
  insertQualification(formData: FormData): Observable<any> {
    return this.http.post(this.baseUrl + 'master/insertqualificationlevel', formData)
  }
  insertbranch(formData: FormData): Observable<any> {
    return this.http.post(this.baseUrl + 'master/insertbranch', formData)
  }
  getqualification(): Observable<any> {
    return this.http.post(this.baseUrl + 'master/getqualification', {})
  }
  getbranch(): Observable<any> {
    return this.http.post(this.baseUrl + 'master/getbranch', {})
  }
  editqualification(formData: FormData): Observable<any> {
    return this.http.post(this.baseUrl + 'master/editqualificationlevel', formData)
  }
  editbranch(formData: FormData): Observable<any> {
    return this.http.post(this.baseUrl + 'master/editbranch', formData)
  }
  ////Leave Quota for HR

  getEligibleleaveEmployees(formData: FormData): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'master/employeedata', formData);
  }
  //leaves
  getleavedata(formData: FormData): Observable<any> {
    return this.http.post(this.baseUrl + 'master/assignedleaves', formData)
  }
  editleavdata(employeeLeaveDto: any) {
    return this.http.post(this.baseUrl + 'master/editleaves', employeeLeaveDto)
  }
  getunassigneddata(formData: FormData): Observable<any> {
    return this.http.post(this.baseUrl + 'master/unassignedleaves', formData)
  }
  getleavesByAction(formData: FormData): Observable<any> {
    return this.http.post(this.baseUrl + 'master/action', formData)
  }
  ///ID card

  getAddresses(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl + 'idcard/address');
  }

  getBloodgroup(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl + 'idcard/bloodgroup');
  }
  getEmployeeDetails(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl + 'idcard/employeedetails');
  }
  insertEmployeeImage(formData: FormData): Observable<any> {
    return this.http.post(this.baseUrl + 'idcard/insertempimage', formData);
  }
  generateIdcard(FormData: FormData): Observable<Blob> {
    return this.http.post<Blob>(this.baseUrl + 'idcard/generatecard', FormData, {
      responseType: 'blob' as 'json'  // Ensure response is treated as a Blob
    });
  }

  eCard(empId: string, password: string): Observable<any> {
    const url = `http://apps.heterohealthcare.com/api/SapPsEmployee/GetEmployeeDataAndHqMapping?empId=${empId}&password=${password}`;
    return this.http.get<any>(url);
  }

  /// work sheet 

  //worksheet
  //private workUrl='http://192.168.215.146:8094';
  getCategory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/worksheet/category`);
  }
  getTaskAlignment(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/worksheet/taskalignment`);
  }
  getPriority(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/worksheet/priority`);
  }
  getTasktype(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/worksheet/tasktype`);
  }

  getOutcome(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/worksheet/outcome`);
  }
  getPlannedadhoc(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/worksheet/plannedadhoc`);
  }
  getActivity(categoryId: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/worksheet/activity/${categoryId}`);

  }
  saveWorksheet(data: any): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/user/worksheetupload`, data);
  }
  getWorksheet(employeeId: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/user/dailyworksheet/${employeeId}`);
  }

  userApproval(employeeId: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/user/approval/${employeeId}`, {}, { responseType: 'text' });
  }

  getWeekSummary(employeeId: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/user/weeksummary/${employeeId}`);
  }
  deleteTask(sno: any): Observable<any[]> {
    return this.http.delete<any[]>(`${this.baseUrl}/user/deletetask/${sno}`);
  }

  getWorkPlace(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/worksheet/workplace`);
  }

  // getTeams():Observable<any[]>{
  //   return this.http.get<any[]>(`${this.baseUrl}/worksheet/team`);
  // }
  searchByName(searchText: string): Observable<any> {
    const formData = new FormData();
    formData.append('name', searchText);
    return this.http.post<any[]>(`${this.baseUrl}/worksheet/dependent`, formData);
  }

  // TeamsDisplay(reportingId:any,loginby:any):Observable<any[]>{
  //   return this.http.post<any[]>(`${this.baseUrl}/worksheet/team`)
  //  }

  TeamsDisplay(reportingId: any, loginby: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/worksheet/team/${reportingId}/${loginby}`);
  }

  /// Bulk Upload




  getFileType(type: any): Observable<any> {
    return this.http.get(`${this.bulkUploadUrl}Bulk/fetch/${type}`)

  }
  uploadedFile(formData: FormData): Observable<any> {
    return this.http.post(`${this.bulkUploadUrl}Bulk/upload`, formData, { responseType: 'json' })
  }
  getDownLoadFormat(type: any, p0: { responseType: string; }) {
    return this.http.get(`${this.bulkUploadUrl}Bulk/format/${type}`, { responseType: 'blob' });
  }

  getBulkMove(formdata: any, type: any) {
    return this.http.post(`${this.bulkUploadUrl}Bulk/move/${type}`, formdata, { responseType: 'text' });
  }
  //// Asseset 


  private asserturl: string = "https://vendorapp.heterohealthcare.com/AssetManagement/";
  //get assert Types
  getAssetType(): Observable<any> {
    return this.http.get(this.asserturl + "master/userassettypes");
  }

  getRaiseRequest(requestBody: any): Observable<any> {
    return this.http.post(this.asserturl + "assetrequests/raiserequest", requestBody, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      responseType: 'text'
    });
  }
  getRmAssetHistory(empid: any): Observable<any> {
    return this.http.get(this.asserturl + "assetrequests/rmrequesthistory/" + empid);
  }
  getRmHistorystatus(): Observable<any> {
    return this.http.get(this.asserturl + "master/parentrequestcodes");
  }
  getRmHistoryItemStatus(): Observable<any> {
    return this.http.get(this.asserturl + "master/childrequestcodes");
  }
  getEmployeeData(empid: any): Observable<any> {
    return this.http.get(this.asserturl + "assetrequests/rmemp/" + empid);
  }
  //Employee Module
  getManagerData(empid: any): Observable<any> {
    return this.http.get(this.asserturl + "assetrequests/emprequesthistory/" + empid);
  }

  acknowledgeEmployee(ack: any): Observable<any> {
    return this.http.post(this.asserturl + "assetrequests/handleongoingrequest", ack, { responseType: 'text' });
  }
  getEmailDomains(): Observable<any> {
    return this.http.get(this.asserturl + "master/maildomains");
  }
  getAssignedAssets(empid: any): Observable<any> {
    return this.http.get(this.asserturl + "assetrequests/assignedassets/" + empid);
  }
  getAssignedAssetData(assetTypeId: any, empid: any): Observable<any> {
    return this.http.get(`${this.asserturl}assetrequests/assetsdata/${assetTypeId}/${empid}`);
  }

  ///// Asset Requset 

  getBu(loginId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/asset/bu/${loginId}`);
  }

  getDepartment(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/asset/department`);
  }
  getDesignation(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/asset/designation`);
  }
  getManagers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/asset/manager`);
  }
  getAssetTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/asset/assettype`);
  }
  getRaiseAssets(formdata: FormData): Observable<string> {
    return this.http.post(`${this.baseUrl}/asset/raiseassets`, formdata, { responseType: 'text' })
      .pipe(
        map(response => {
          return response;
        })
      );
  }

  // getRaiseAssets(formdata:FormData):Observable<any[]>{
  //   return this.http.post<any>(`${this.assetUrl}/raiseassets`,formdata);
  // }


  getAssetList(params: {
    loginId: any;
    pageSize: any,
    pageNo: any,
    status?: any,
    bu?: any;
    department?: any;
    reportingManager?: any;
    assetType?: any;
    tentativeFromDate?: any;
    tentativeToDate?: any
  }): Observable<any[]> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<any[]>(`${this.baseUrl}/asset/list`, params, { headers });
  }
  getDomain(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/asset/domain`);
  }
  /////IT admin Asset

  //  acknowledge(formData: FormData): Observable<any> {
  //   return this.http.put(`${this.baseUrl}/asset/acknowledge`, formData, {
  //     responseType: 'text',
  //     observe: 'response'
  //   });
  // }
  acknowledge(formData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/asset/acknowledge`, formData, {
      observe: 'response',
      responseType: 'text'
    });
  }


  getItApprovalList(requestBody: any): Observable<any> {
    const url = `${this.baseUrl}/asset/approvallist`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, requestBody, { headers });
  }
  getItApprovedList(requestBody: any): Observable<any> {
    const url = `${this.baseUrl}/asset/approvedlist`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, requestBody, { headers });
  }
  //// Promotion Letters
  getPromotionEmployees(): Observable<any> {
    return this.http.post(this.baseUrl + 'promotionletters/fetchemployee', {});
  }

  getTransferTypes(): Observable<any> {
    return this.http.get(this.baseUrl + 'promotionletters/transfertypes');
  }

  getTransferDetails(): Observable<any> {
    return this.http.get(this.baseUrl + 'promotionletters/transferdetails');
  }

  getBusinessUnit(): Observable<any> {
    return this.http.get(this.baseUrl + 'promotionletters/businessunit');
  }

  getDepartmentAndSection(): Observable<any> {
    return this.http.get(this.baseUrl + 'promotionletters/departments');
  }

  getPromotionDesignation(): Observable<any> {
    return this.http.get(this.baseUrl + 'promotionletters/designation');
  }

  getPromotionbyempid(formData: FormData): Observable<any> {
    return this.http.post(this.baseUrl + 'promotionletters/fetchbyempid', formData);
  }

  getSearchReporties(formData: FormData): Observable<any> {
    return this.http.post(this.baseUrl + 'promotionletters/reporties', formData);
  }

  promotionRegistation(data: any): Observable<any> {
    return this.http.post(this.baseUrl + 'promotionletters/registration', data);
  }

  updatepromotion(transactionid: any, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}promotionletters/update/${transactionid}`, data);
  }

  deletepromotion(transactionid: any): Observable<any> {
    return this.http.get(`${this.baseUrl}promotionletters/delete/${transactionid}`, { responseType: 'text' });
  }
  //// Confirmation Letters

  getstatus(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/promotionletters/confirmation/status`);
  }
  getdepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/promotionletters/departments`);
  }

  getconfirmationbyempid(empid: number): Observable<any> {
    const formData = new FormData();
    formData.append('employeeseq', empid.toString()); // Ensure it's a string

    console.log('Sending API Request:', formData.get('employeeseq'));

    return this.http.post<any>(`${this.baseUrl}/promotionletters/fetchbyempid`, formData);
  }


  getconfirmationregistation(data: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/promotionletters/confirmation/registation`, data);
  }
  displayData(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/promotionletters/confirmation/data`);
  }
  updateConfirmation(employeeid: any, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/promotionletters/updateconfirmation/${employeeid}`, data);
  }

  deleteConfirmation(employeeid: any, employmenttypeid: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/promotionletters/deleteconfirmation/${employeeid}/${employmenttypeid}`, { responseType: 'text' })
  }

  ///
  public getPromotionPdf(emp: any, Transactionid: any) {
    return this.http.get<any>(`${this.baseUrl}/promotionletters/get/letter/${emp}/${Transactionid}`, { responseType: 'arraybuffer' as 'json' });
  }


  getCurrentDate(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/loginaction/currentdate`);
  }
  ////Notifications Letter

  getNotifications(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/notifications`, formData);
  }



  private getDefaultHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }),
      observe: 'response' as 'response'
    };
  }


  private jobCodeUrls: string = "http://192.168.214.63:2025/";
  createJobCode(formData: any): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.jobCodeUrls}jobcode/create`, formData, this.getDefaultHttpOptions()).pipe(
      catchError(this.handleError)
    );
  }

  getTotalJobCodes(pageNo: number, pageSize: number, searchData: string) {
    const params = new HttpParams()
      .set('pageNo', pageNo.toString())
      .set('pageSize', pageSize.toString())
      .set('search', searchData.toString());

    return this.http.get(`${this.jobCodeUrls}jobcode/jobcodedata`, { params }).pipe(
      catchError(this.handleError)
    );
  }


  getDataByJobCode(id: any): Observable<any> {
    return this.http.get(`${this.jobCodeUrls}jobcode/singlejobcode/${id}`, this.getDefaultHttpOptions()).pipe(
      catchError(this.handleError)
    );
  }

  listOfmanagers(): Observable<any> {
    return this.http.get(this.jobCodeUrls + 'master/managers', this.getDefaultHttpOptions()).pipe(
      catchError(this.handleError)
    )
  }

  getJobCodeListData(id: any): Observable<any> {
    return this.http.get(`${this.jobCodeUrls}jobcode/getcandidates/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  CreateJobCandidate(formData: FormData): Observable<HttpResponse<any>> {
    return this.http.post(`${this.jobCodeUrls}jobcode/addcandidate`, formData, { observe: 'response' });

  }
  masterBu() {
    return this.http.get(`${this.jobCodeUrls}master/bu`).pipe(
      catchError(this.handleError)
    );
  }

  jobTitle(): Observable<any> {
    return this.http.get(`${this.jobCodeUrls}master/title`).pipe(
      catchError(this.handleError)
    )
  }

  listofTeams(): Observable<any> {
    return this.http.get(`${this.jobCodeUrls}master/department`).pipe(
      catchError(this.handleError)
    )
  }

  ReportingManagers(): Observable<any> {
    return this.http.get(`${this.jobCodeUrls}master/reportingmanager`).pipe(
      catchError(this.handleError)
    )
  }

  trackingData(id: any): Observable<any> {
    return this.http.get(`${this.jobCodeUrls}hiring/candidatedata/${id}`);
  }

  publishMode(formData: any): Observable<any> {
    return this.http.put(`${this.jobCodeUrls}jobcode/publish`, formData).pipe(
      catchError(this.handleError)
    )
  }

  hiringLogin(payload): Observable<HttpResponse<any>> {
    console.log("type: ", payload)
    return this.http.post(`${this.jobCodeUrls}jobcode/login`, payload, { observe: 'response' })
  }

  hiringRegister(data: FormData): Observable<HttpResponse<any>> {
    return this.http.post(`${this.jobCodeUrls}hiring/employeedetails`, data, { observe: 'response' }).pipe(
      catchError(this.handleError)
    )
  }

  title() {
    return this.http.get(`${this.jobCodeUrls}master/mstitle`)
  }

  gender() {
    return this.http.get(`${this.jobCodeUrls}master/gender`)
  }

  marriageStatus() {
    return this.http.get(`${this.jobCodeUrls}master/maritalstatus`)
  }
  university() {
    return this.http.get(`${this.jobCodeUrls}master/university`)
  }

  qualification() {
    return this.http.get(`${this.jobCodeUrls}master/qualification`)
  }

  joiningTime() {
    return this.http.get(`${this.jobCodeUrls}master/noticeperiodindays`)
  }

  states() {
    return this.http.get(`${this.jobCodeUrls}master/states`).pipe(
      catchError(this.handleError)
    )
  }

  bloodGroup() {
    return this.http.get(`${this.jobCodeUrls}master/bloodgroup`).pipe(
      catchError(this.handleError)
    )
  }

  cities(id: any) {
    return this.http.get(`${this.jobCodeUrls}master/cities/${id}`).pipe(
      catchError(this.handleError)
    )
  }

  registeredData(id: any) {
    return this.http.get(`${this.jobCodeUrls}hiring/candidatedata/${id}`)
  }

  deleteEducation(id: any): Observable<any> {
    return this.http.delete(`${this.jobCodeUrls}hiring/deleteeducation/${id}`).pipe(
      catchError(this.handleError)
    )
  }

  deleteFile(candidateId: any, fileId: any): Observable<HttpResponse<any>> {
    return this.http.delete(`${this.jobCodeUrls}hiring/deletedocument/${candidateId}/${fileId}`, { observe: 'response' }).pipe(
      catchError(this.handleError)
    )
  }

  deleteExperience(candidateId: any): Observable<HttpResponse<any>> {
    return this.http.delete(`${this.jobCodeUrls}hiring/deleteexperience/${candidateId}`, { observe: 'response' }).pipe(
      catchError(this.handleError)
    )
  }

  shortlistedCandidates(pageNo: number, pageSize: number, searchData: string) {
    const params = new HttpParams()
      .set('pageNo', pageNo.toString())
      .set('pageSize', pageSize.toString())
      .set('search', searchData.toString());
    return this.http.get(`${this.jobCodeUrls}hiring/shortlisted`, { params }).pipe(
      catchError(this.handleError)
    )
  }

  processCandidates(pageNo: number, pageSize: number, searchData: string, loginId: number) {
    const params = new HttpParams()
      .set('pageNo', pageNo.toString())
      .set('pageSize', pageSize.toString())
      .set('search', searchData.toString())
      .set('loginId', loginId.toString());
    return this.http.get(`${this.jobCodeUrls}hiring/process`, { params }).pipe(
      catchError(this.handleError)
    )
  }

  processedCandidates(pageNo: number, pageSize: number, searchData: string, loginId: number) {
    const params = new HttpParams()
      .set('pageNo', pageNo.toString())
      .set('pageSize', pageSize.toString())
      .set('search', searchData.toString())
      .set('loginId', loginId.toString());
    return this.http.get(`${this.jobCodeUrls}hiring/processedlist`, { params }).pipe(
      catchError(this.handleError)
    )
  }

  scheduleCandidates(pageNo: number, pageSize: number, searchData: string) {
    const params = new HttpParams()
      .set('pageNo', pageNo.toString())
      .set('pageSize', pageSize.toString())
      .set('search', searchData.toString());
    return this.http.get(`${this.jobCodeUrls}hiring/schedule`, { params }).pipe(
      catchError(this.handleError)
    )
  }

  cancelInterview(id: any): Observable<HttpResponse<any>> {
    return this.http.delete(`${this.jobCodeUrls}hiring/cancleinterview/${id}`, { observe: 'response' }).pipe(
      catchError(this.handleError)
    )
  }

  modeOfInterview() {
    return this.http.get(`${this.jobCodeUrls}master/interviewmode`).pipe(
      catchError(this.handleError)
    )
  }


  interviewRounds() {
    return this.http.get(`${this.jobCodeUrls}master/interviewrounds`).pipe(
      catchError(this.handleError)
    )
  }

  addInterviewRound(payload: any): Observable<HttpResponse<any>> {
    return this.http.post(`${this.jobCodeUrls}hiring/interviewschedule`, payload, { observe: 'response' }).pipe(
      catchError(this.handleError)
    )
  }

  interviewedBy(payload: FormData): Observable<any> {
    return this.http.post(`${this.jobCodeUrls}master/interviewby`, payload).pipe(
      catchError(this.handleError)
    )
  }


  interviewLocation() {
    return this.http.get(`${this.jobCodeUrls}master/address`).pipe(
      catchError(this.handleError)
    )
  }

  interviewstatus() {
    return this.http.get(`${this.jobCodeUrls}master/finalstatus`).pipe(
      catchError(this.handleError)
    )
  }

  feedbackFactors() {
    return this.http.get(`${this.jobCodeUrls}master/factors`).pipe(
      catchError(this.handleError)
    )
  }

  feedbackSubmitForm(payload: any): Observable<any> {
    return this.http.post(`${this.jobCodeUrls}hiring/interviewfeedback`, payload, {
      responseType: 'text'
    }).pipe(
      catchError(this.handleError)
    );
  }

  holdCandidates() {
    return this.http.get(`${this.jobCodeUrls}hiring/hold`).pipe(
      catchError(this.handleError)
    )
  }

  unScheduledCandidates() {
    return this.http.get(`${this.jobCodeUrls}hiring/unscheduled`).pipe(
      catchError(this.handleError)
    )
  }

  sendRemainder(candidateId: any, employeeId: any) {
    return this.http.post(`${this.jobCodeUrls}hiring/remainder/${candidateId}/${employeeId}`, {}).pipe(
      catchError(this.handleError)
    )
  }

  updateJoingDate(formData: FormData) {
    return this.http.put(`${this.jobCodeUrls}hiring/updatedoj`, formData)
  }

  offerCandidates() {
    return this.http.get(`${this.jobCodeUrls}hiring/offerletter`).pipe(
      catchError(this.handleError)
    )
  }

  employeeOnboarding() {
    return this.http.get(`${this.jobCodeUrls}hiring/employeeonboarding`).pipe(
      catchError(this.handleError)
    )
  }

  onBoardingCandidates() {
    return this.http.get(`${this.jobCodeUrls}hiring/employeeonboarding`).pipe(
      catchError(this.handleError)
    )
  }

  rejectedCandidates() {
    return this.http.get(`${this.jobCodeUrls}hiring/rejectedcandidates`).pipe(
      catchError(this.handleError)
    )
  }

  dashboardCandidatesCount() {
    return this.http.get(`${this.jobCodeUrls}hiring/dashboardcount`).pipe(
      catchError(this.handleError)
    )
  }

  totalDepartments() {
    return this.http.get(`${this.jobCodeUrls}master/department`)
  }
  totalRegions() {
    return this.http.get(`${this.jobCodeUrls}master/region`)
  }

  /// Departments List

  listOfManagersforOrganogram(empId: any) {
    return this.http.get(`${this.jobCodeUrls}organogram/departments/${empId}`).pipe(
      catchError(this.handleError)
    )
  }

  // Deparment Under Leads
  listOfTeamleads(loginId: any, id: any) {
    return this.http.get(`${this.jobCodeUrls}organogram/empdata/${loginId}/${id}`).pipe(
      catchError(this.handleError)
    )
  }

  roles() {
    return this.http.get(`${this.jobCodeUrls}organogram/roles`).pipe(
      catchError(this.handleError)
    )
  }

  GenerateOffer(id: any): Observable<HttpResponse<any>> {
    return this.http.get(`${this.jobCodeUrls}report/generate/${id}`, {
      observe: 'response',
      responseType: 'text' as 'json' // Forces Angular to treat text as JSON
    });
  }

}

