import { Injectable } from '@angular/core';

@Injectable()
export class AudioService {
  private SRC = 'https://rawcdn.githack.com/JaimeStill/violet-cold-space/47389c132890595db4786e43ddc564e4d698f74f/src/assets/audio/contact.mp3';

  bufferLength: number;
  floatTimeDomainData: Float32Array;
  floatFrequencyData: Float32Array;
  byteFrequencyData: Uint8Array;
  byteTimeDomainData: Uint8Array;
  audio: HTMLAudioElement;
  context: AudioContext;
  audioNode: AudioNode;
  gainNode: GainNode;
  analyser: AnalyserNode;
  gain = 1;
  gainValue = 1;
  muted = false;
  playing = false;
  progress = 0;
  duration = 0;

  private retrieveAudio = (): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const sendReject = () => {
        reject({ status: request.status, statusText: request.statusText });
      }

      const request = new XMLHttpRequest();
      request.open('GET', this.SRC, true);
      request.responseType = "blob";
      console.log('request', request);
      request.send();

      request.onerror = () => sendReject();

      request.onload = () => {
        console.log('response', request.response);
        request.status >= 200 && request.status < 300 ?
          resolve(request.response) :
          sendReject();
      }
    });

  private configureAudio = async (audio: HTMLAudioElement) => {
    this.audio = audio;
    const blob = await this.retrieveAudio();
    console.log('blob', blob);
    this.audio.src = URL.createObjectURL(blob);
    this.audio.loop = true;
    this.audio.addEventListener('durationchange', () => this.duration = this.audio.duration);
    this.audio.addEventListener('timeupdate', () => this.progress = this.audio.currentTime);
  }

  private setupContextAndNodes = () => {
    this.context = new AudioContext();
    this.gainNode = this.context.createGain();
    this.analyser = this.context.createAnalyser();
  }

  private connectDestination = () => {
    const trackNode = this.context.createMediaElementSource(this.audio);
    trackNode.connect(this.gainNode)
             .connect(this.analyser)
             .connect(this.context.destination);
  }

  private setupAnalyserSources = () => {
    this.analyser.fftSize = 2048;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.byteTimeDomainData = new Uint8Array(this.bufferLength);
    this.byteFrequencyData = new Uint8Array(this.bufferLength);
    this.floatTimeDomainData = new Float32Array(this.bufferLength);
    this.floatFrequencyData = new Float32Array(this.bufferLength);
  }

  updateByteTimeDomainData = () =>
    this.analyser.getByteTimeDomainData(this.byteTimeDomainData);

  updateByteFrequencyData = () =>
    this.analyser.getByteFrequencyData(this.byteFrequencyData);

  updateFloatTimeDomainData = () =>
    this.analyser.getFloatTimeDomainData(this.floatTimeDomainData);

  updateFloatFrequencyData = () =>
    this.analyser.getFloatFrequencyData(this.floatFrequencyData);

  initializeAudio = (audio: HTMLAudioElement): Promise<boolean> =>
    new Promise(async (resolve, reject) => {
      try {
        await this.configureAudio(audio);
        this.setupContextAndNodes();
        this.connectDestination();
        this.setupAnalyserSources();
        resolve(true);
      } catch (err) {
        reject(err);
      }
  });

  togglePlayback = async () => {
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    if (this.playing) {
      await this.audio.pause();
      this.playing = false;
    } else {
      await this.audio.play();
      this.playing = true;
    }
  }

  updateVolume = (val: number) => {
    this.gainValue = val > 2 ?
    2 : val < 0 ? 0 : val;

    if (!this.muted) {
      this.gainNode.gain.value = this.gainValue;
      this.gain = this.gainValue;
    }
  }

  scanTrack = (val: number) => {
    this.audio.currentTime = val;
    this.progress = val;
  }

  toggleMute = () => {
    this.muted = !this.muted;
    this.muted ? this.gainNode.gain.value = 0 : this.gainNode.gain.value = this.gainValue;
    this.gain = this.gainNode.gain.value;
  }
}
