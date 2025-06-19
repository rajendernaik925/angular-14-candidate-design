import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Observable, interval, BehaviorSubject } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

const STORE_KEY =  'userLastAction';

@Injectable()
export class NgIdleService implements OnDestroy {
  public static runTimer: boolean;
  public static runSecondTimer: boolean;
  public USER_IDLE_TIMER_VALUE_IN_MIN: number;
  public FINAL_LEVEL_TIMER_VALUE_IN_MIN: number;
  public userIdlenessChecker: BehaviorSubject<string>;
  public secondLevelUserIdleChecker: BehaviorSubject<string>;

  private sessionForIdle: Observable<number>;
  private userActivityChangeCallback: ($event) => void;

  public clockForIdle: Observable<number>;

  constructor(private zone: NgZone) {
    if (!this.userIdlenessChecker) {
      this.userIdlenessChecker = new BehaviorSubject<string>('INITIATE_TIMER');
    }

    if (!this.secondLevelUserIdleChecker) {
      this.secondLevelUserIdleChecker = new BehaviorSubject<string>('INITIATE_SECOND_TIMER');
    }
  }

  public initilizeSessionTimeout(): void {
    NgIdleService.runTimer = true;

    if (this.USER_IDLE_TIMER_VALUE_IN_MIN === 0) {
      this.userIdlenessChecker.thrownError('Please provide USER_IDLE_TIMER_VALUE in minuite');
      return;
    }

    this.reset();
    this.initListener();
    this.initInterval();
  }

  get lastAction(): number {
    return parseInt(localStorage.getItem(STORE_KEY), 10);
  }

  set lastAction(value) {
    localStorage.setItem(STORE_KEY, value.toString());
  }

  private initListener(): void {
    this.zone.runOutsideAngular(() => {
      this.userActivityChangeCallback = ($event) => this.handleUserActiveState($event);
      window.document.addEventListener('click', this.userActivityChangeCallback.bind(this), true);
    });
  }

  handleUserActiveState(event): void {
    this.reset();
  }

  public reset(): void {
    this.lastAction = Date.now();
    if (this.userIdlenessChecker) {
      this.userIdlenessChecker.next('RESET_TIMER');
    }
  }

  private initInterval(): void {
    const intervalDuration = 1000;
    this.sessionForIdle = interval(intervalDuration).pipe(
      map((tick: number) => {
        return tick;
      }),
      takeWhile(() => NgIdleService.runTimer)
    );

    this.check();
  }

  private check(): void {
    this.sessionForIdle
    .subscribe(() => {
      const now = Date.now();
      const timeleft = this.lastAction + this.USER_IDLE_TIMER_VALUE_IN_MIN * 60 * 1000;
      const diff = timeleft - now;
      const isTimeout = diff < 0;

      this.userIdlenessChecker.next(`${diff}`);

      if (isTimeout) {
        window.document.removeEventListener('click', this.userActivityChangeCallback, true);
        this.zone.run(() => {
          if (this.userIdlenessChecker) {
            this.userIdlenessChecker.next('STOPPED_TIMER');

            if (this.FINAL_LEVEL_TIMER_VALUE_IN_MIN > 0) {
              this.secondLevelUserIdleChecker.next('SECOND_TIMER_STARTED');
              this.executeFinalTimer();
            }
          }
          NgIdleService.runTimer = false;
        });
      }
    });
  }

  public removeActionFromStore(): void {
    localStorage.removeItem(STORE_KEY);
  }

  private executeFinalTimer = () => {
    NgIdleService.runSecondTimer = true;
    this.initializeFinalTimer();
  }

  private initializeFinalTimer(): void {
    const intervalDuration = 1000;
    this.clockForIdle = interval(intervalDuration).pipe(
      map((tick: number) => {
        return tick;
      }),
      takeWhile(() => NgIdleService.runSecondTimer)
    );

    this.checkUserActionTime();
  }

  private checkUserActionTime(): void {
    let timeInSecond = 60;
    let timeInMin = this.FINAL_LEVEL_TIMER_VALUE_IN_MIN - 1;
    this.clockForIdle.subscribe(() => {
      if (--timeInSecond === 0) {
        if (--timeInMin === 0) {
          timeInMin = (timeInMin > 0) ? (timeInMin - 1) : 0;
        }
        if (timeInMin === -1 && timeInSecond === 0) {
          NgIdleService.runSecondTimer = false;

          if (this.secondLevelUserIdleChecker) {
            this.secondLevelUserIdleChecker.next('SECOND_TIMER_STOPPED');
          }
        }
        if (timeInMin < 0) {
          timeInMin = 0;
          setTimeout(() => {
            timeInSecond = 60;
          }, 800);
        } else {
          timeInSecond = 60;
        }
      }

      this.secondLevelUserIdleChecker.next(`${timeInMin}:${timeInSecond}`);
    });
  }

  ngOnDestroy(): void {
    if (this.userIdlenessChecker) {
      this.userIdlenessChecker.unsubscribe();
      this.userIdlenessChecker = undefined;
    }

    if (this.secondLevelUserIdleChecker) {
      this.secondLevelUserIdleChecker.unsubscribe();
      this.secondLevelUserIdleChecker = undefined;
    }
  }

}
