import {
  Component,
  ViewChild,
  ElementRef
} from '@angular/core';

import {
  MatSliderChange,
  MatIconRegistry
} from '@angular/material';

import {
  AudioService,
  VisualService
} from './services';

import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [
    AudioService,
    VisualService
  ]
})
export class AppComponent {
  isOscillator = true;

  constructor(
    public audio: AudioService,
    public visual: VisualService,
    private icons: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {
    this.registerIcon('facebook');
    this.registerIcon('instagram');
    this.registerIcon('bandcamp');
    this.registerIcon('twitter');
    this.registerIcon('spotify');
    this.registerIcon('patreon');
  }

  private registerIcon = (icon: string) => this.icons.addSvgIcon(
    `${icon}`,
    this.sanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${icon}.svg`)
  );

  @ViewChild('player')
  set player(player: ElementRef<HTMLAudioElement>) {
    if (player) {
      this.audio.initializeAudio(player.nativeElement)
        .then(() => this.initVisual());
    }
  }

  @ViewChild('visuals')
  set visuals(visuals: ElementRef<HTMLCanvasElement>) {
    if (visuals) {
      this.visual.initialize(visuals.nativeElement);
    }
  }

  private initVisual = () => this.isOscillator ?
    this.setOscillator() : this.setSpectrum();

  scanTrack = (event: MatSliderChange) => this.audio.scanTrack(event.value);

  toggleVisual = () => {
    this.isOscillator = !this.isOscillator;
    this.initVisual();
  }

  setOscillator = () => this.visual.oscillator(
    this.audio.floatTimeDomainData,
    this.audio.updateFloatTimeDomainData
  );

  setSpectrum = () => this.visual.spectrum(
    this.audio.byteFrequencyData,
    this.audio.updateByteFrequencyData
  );
}
