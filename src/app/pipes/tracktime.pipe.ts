import {
  Pipe,
  PipeTransform
} from '@angular/core';

@Pipe({
  name: 'tracktime'
})
export class TracktimePipe implements PipeTransform {
  transform(value: number) {
    if (!value) { return '00:00' }
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value - (minutes * 60));
    return `${this.pad(minutes.toString())}:${this.pad(seconds.toString())}`;
  }

  pad = (val: string) => {
    while (val.length < 2) {
      val = `0${val}`;
    }

    return val;
  }
}
