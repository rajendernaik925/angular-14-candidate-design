import { Directive,HostListener, ElementRef, Input  } from '@angular/core';

@Directive({
  selector: '[appRestrictWhiteSpace]'
})
export class RestrictWhiteSpaceDirective {
  regexStr = '^[a-zA-Z0-9_ ]*$';
  @Input() isAlphaNumeric: boolean;
  constructor(private el: ElementRef) { }
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {  

   if ( this.el.nativeElement.selectionStart === 0 && event.key === ' ' ) {
     event.preventDefault();
   }

    if (!RegExp(this.regexStr).test(event.key)) {
      event.preventDefault();
    }
  }
  // validateFields(event) {
  //   setTimeout(() => {

  //     this.el.nativeElement.value = this.el.nativeElement.value.replace(/[^A-Za-z ]/g, '').replace(/\s/g, '');
  //     event.preventDefault();

  //   }, 100)
  // }
}
