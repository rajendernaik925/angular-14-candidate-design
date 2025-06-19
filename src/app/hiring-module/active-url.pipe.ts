import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'activeUrl'
})
export class ActiveUrlPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // Remove leading slash if present
    value = value.startsWith('/') ? value.substring(1) : value;

    // Get first part of the URL
    const firstPart = value.split('/')[0];

    // Capitalize first letter
    return firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
  }
}
