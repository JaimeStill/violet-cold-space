import { Injectable } from '@angular/core';

@Injectable()
export class VisualService {
  private animationFrameId: number;
  canvas: HTMLCanvasElement;

  private updateCanvas = (
    context: CanvasRenderingContext2D,
    i: number,
    x: number,
    y: number
  ) => i === 0 ?
      context.moveTo(x, y) :
      context.lineTo(x, y);

  spectrum = (data: Uint8Array, update: () => void) => {
    this.clearAnimation();
    let offset = 0;
    const context = this.canvas.getContext('2d');
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const draw = () => {
      this.animationFrameId = requestAnimationFrame(draw);
      update();
      const slice = context.getImageData(0, offset, this.canvas.width, 1);
      for (let i = 0; i < data.length; i++) {
        slice.data[4 * i + 0] = data[i];
        slice.data[4 * i + 1] = data[i];
        slice.data[4 * i + 2] = data[i];
        slice.data[4 * i + 3] = data[i] > 0 ? 255 : 120;
      }
      context.putImageData(slice, 0, offset);
      offset += 1;
      offset %= this.canvas.height;
    }
    draw();
  }

  oscillator = (data: Float32Array, update: () => void) => {
    this.clearAnimation();
    const context = this.canvas.getContext('2d');

    const draw = () => {
      this.animationFrameId = requestAnimationFrame(draw);
      update();
      context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      context.fillStyle = 'rgba(0, 0, 0, .47)';
      context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      context.strokeStyle = '#f7f7f7';
      context.beginPath();
      for (let i = 0; i < data.length; i++) {
        const x = i;
        const y = (0.5 + data[i] / 2) * this.canvas.height;
        this.updateCanvas(context, i, x, y);
      }
      context.stroke();
    }
    draw();
  }

  initialize = (canvas: HTMLCanvasElement) => this.canvas = canvas;

  clearAnimation = () =>
    this.animationFrameId && cancelAnimationFrame(this.animationFrameId);
}
