import { Component, input } from '@angular/core';

@Component({
  selector: 'pin-card',
  templateUrl: './pin-card.component.html',
})
export class PinCard {
  value = input.required<number>();
  pinData: PinDisplayData[] = [];

  ngOnInit(){
    // console.log(this.value());
    let xOffset = 10;
    // let yOffset = 0;
    for(let pin = 0; pin < 10; pin++){
    this.pinData.push({
        x: xOffset,
        y: 10,
       fill: 'green'
      });
      xOffset += 30;
    }
  }
}

export interface PinDisplayData {
  x: number;
  y : number;
  fill : string;
}
