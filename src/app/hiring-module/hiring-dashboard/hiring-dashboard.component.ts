import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import * as echarts from 'echarts';
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { error } from 'console';


@Component({
  selector: 'app-hiring-dashboard',
  templateUrl: './hiring-dashboard.component.html',
  styleUrls: ['./hiring-dashboard.component.sass']
})
export class HiringDashboardComponent implements OnInit, AfterViewInit, AfterViewChecked {

  @ViewChild('pieChart', { static: false }) pieChart!: ElementRef;
  @ViewChild('scrollMe') private chatContainer!: ElementRef;
  candidatesCount: any;
  isLoading: boolean = false;
  graphImageUrl: string = 'assets/img/job-code/graph.png';
  statusList: string[] = ['Compare', 'Shortlisted', 'Selected', 'Process', 'Scheduled', 'Offer', 'Onboarding'];
  statusOne: string = this.statusList[0];
  statusTwo: string = this.statusList[0];
  isOpen = false;
  isSidebarOpen = true;
  differenceResult: any;
  isChatOpen = false;
  userMessage = '';
  messages: { text: string, sender: 'user' | 'bot' }[] = []; // distinguish who sent the message
  isTyping = false;
  organogramLogo:string = 'assets/img/job-code/Isolation_Mode.svg';
  userData: any;



  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        // Stop speech when route changes
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          console.log('Speech synthesis canceled on route change.');
        }
      }
    });
  }

  ngOnInit(): void {
    let loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(loggedUser);
    this.candidateCount();
    // this.speakRemainder();
  }

  ngAfterViewInit(): void {
    // this.speakRemainder();
    setTimeout(() => {
      this.initPieChart();
    }, 0);
  }

  compareStatuses() {
    const list1 = this.getApplicantsByStatus(this.statusOne);
    const list2 = this.getApplicantsByStatus(this.statusTwo);

    this.differenceResult = list1.filter(x => !list2.includes(x));
    Swal.fire({
      title: 'Difference Result',
      text: 'Here is the difference between the selected statuses.',
      html: `<pre>${JSON.stringify(this.differenceResult, null, 2)}</pre>`,
      icon: 'info',
      confirmButtonText: 'Close'
    });
  }

  getApplicantsByStatus(status: string): string[] {
    const data = {
      'Shortlisted': ['John', 'Ayesha', 'Kunal'],
      'Selected': ['John', 'Priya'],
      'Process': ['Kunal', 'Priya', 'Ravi'],
      'Scheduled': ['Ravi'],
      'Offer': ['Priya'],
      'Onboarding': ['Ayesha']
    };
    return data[status] || [];
  }


  candidateCount() {
    this.isLoading = true;
    console.log("loadibg value : ", this.isLoading)
    this.authService.dashboardCandidatesCount().subscribe({
      next: (res: HttpResponse<any>) => {
        this.isLoading = false;
        console.log("candidates : ", res);
        this.candidatesCount = res;
        // this.speakRemainder();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        console.log(err);
      }
    })
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  initPieChart() {
    if (!this.pieChart?.nativeElement) return;

    const myChart = echarts.init(this.pieChart.nativeElement);

    const year = 2024;
    const startDate = new Date(year, 0, 1).getTime();
    const oneDay = 24 * 3600 * 1000;
    const daysInYear = 365;

    let data: [number, number][] = [];

    let baseValue = 500;

    for (let i = 0; i < daysInYear; i++) {
      const date = startDate + i * oneDay;

      // Create a smooth up-and-down wave pattern
      const seasonalFactor = Math.sin((i / daysInYear) * 2 * Math.PI); // sine wave
      const randomNoise = (Math.random() - 0.5) * 100; // small randomness

      const value = Math.max(0, baseValue + seasonalFactor * 400 + randomNoise); // ensure non-negative
      data.push([date, Math.round(value)]);
    }

    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: function (params: any) {
          const date = new Date(params[0].data[0]);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `Date: ${day}-${month}-${year}<br/>Total Count: ${params[0].data[1]}`;
        }
      },
      title: {
        left: 'center',
        text: 'Hiring Module Candidate Data'
      },
      toolbox: {
        feature: {
          restore: {},
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
        axisLabel: {
          formatter: function (value: number) {
            const date = new Date(value);
            return date.toLocaleString('default', { month: 'short' }); // Jan, Feb, ...
          }
        },
        splitNumber: 12
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '10%']
      },
      series: [
        {
          name: 'Total Count',
          type: 'line',
          smooth: true,
          symbol: 'none',
          areaStyle: {},
          data: data
        }
      ]
    };

    myChart.setOption(option);
  }

  private utterance: SpeechSynthesisUtterance | null = null;
  speakRemainder(): void {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const isScheduledPresent = this.candidatesCount?.scheduled && this.candidatesCount.scheduled > 0;

    const message = `Today's activities by the HR team includes: 
    shortlisting ${this.candidatesCount?.shortlisted || 0} candidates, 
    interview process to ${this.candidatesCount?.onGoing || 0} candidates, 
    scheduling interviews for ${this.candidatesCount?.scheduled || 0} candidates,
    holding interviews for ${this.candidatesCount?.hold || 0} candidates,
    offer initiation for ${this.candidatesCount?.offerLetterInitiated || 0} candidates,
    interview approval for ${this.candidatesCount?.approved || 0} candidates,
    and employee onboarding pending for ${this.candidatesCount?.employeeOnboarding || 0} candidates.
    If you have any questions or need assistance, feel free to type your message in the chat box on the bottom right. We're here to help!
    Moving to the ${isScheduledPresent ? 'schedule' : 'shortlisted'} tab ${isScheduledPresent ? 'to schedule interviews for candidates.' : 'as there are no candidates to schedule interviews.'}`;

    this.utterance = new SpeechSynthesisUtterance(message);

    this.utterance.onend = () => {
      this.router.navigate([isScheduledPresent ? '/schedule' : '/shortlisted']);
    };

    window.speechSynthesis.speak(this.utterance);
  }



  botReplies: string[] = [
    "Sure, I can help with that!",
    "Can you please provide more details?",
    "That's interesting!",
    "Let me check that for you.",
    "Thank you for your message!",
    "I'm here to assist you.",
    "Could you clarify that?",
    "Sounds good!"
  ];

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
    this.messages = {} = [];
  }

  sendMessage(): void {
    const trimmedMessage = this.userMessage.trim();
    if (trimmedMessage) {
      const userMsg = trimmedMessage;
      this.userMessage = '';
      this.messages.push({ text: userMsg, sender: 'user' });

      this.isTyping = true;

      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * this.botReplies.length);
        const botReply = this.botReplies[randomIndex];
        this.messages.push({ text: botReply, sender: 'bot' });
        this.isTyping = false;
      }, 2000);
    }
  }


  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.warn('Scroll error:', err);
    }
  }
}

