import { Directive, HostListener  } from '@angular/core';

@Directive({
  selector: '[appNoDoubleClickBtn]'
})
export class NoDoubleClickBtnDirective {

  constructor() { }
  @HostListener('click', ['$event'])
  clickEvent(event) {
    event.srcElement.setAttribute('disabled', true);
    // setTimeout(function(){ 
    //   event.srcElement.removeAttribute('disabled');
    // }, 3000);
  }
}
