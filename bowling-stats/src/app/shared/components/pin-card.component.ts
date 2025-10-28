import { Component, input } from '@angular/core';

@Component({
  selector: 'pin-card',
  templateUrl: './pin-card.component.html',
})
export class PinCard {
  value = input.required<number>();
  pinData: PinDisplayData[] = [];
  width = 0;
  height = 0;

  ngOnInit() {
    const val = this.value();
    // console.log(this.value());
    // Units are cm
    const radius = 12.1 / 2;
    let columnSpacing = 30.5;
    let rowSpacing = 52.7 / 2;
    let xOffset = radius;
    let yOffset = radius;
    let columnCount = 4;
    let pin = 7;
    while (columnCount > 0) {
      xOffset = radius + (4 - columnCount) * (columnSpacing / 2);
      for (let column = 0; column < columnCount; column++) {
        const filled = ((val >> (pin - 1)) & 1) == 1;
        this.pinData.push({
          x: xOffset,
          y: yOffset,
          fill: filled ? 'green' : 'gray',
          radius: radius,
        });
        xOffset += columnSpacing;
        pin++;
      }
      pin -= columnCount;
      yOffset += rowSpacing;
      columnCount--;
      pin -= columnCount;
    }
    this.width = this.pinData.reduce((max, v) => Math.max(max, v.x), 0) + radius;
    this.height = this.pinData.reduce((max, v) => Math.max(max, v.y), 0) + radius;
  }
}

export interface PinDisplayData {
  x: number;
  y: number;
  radius: number;
  fill: string;
}
