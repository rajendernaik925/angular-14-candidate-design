import { Pipe, PipeTransform,Injectable  } from '@angular/core';
import * as moment from 'moment';
import 'moment/locale/pt-br';
@Pipe({
  name: 'momentDate'
}) 
@Injectable()
export class MomentDatePipe implements PipeTransform {

  transform(date: any, format: string): any {
    if (date) {
     return moment(date).format(format);
    }
  }
}
