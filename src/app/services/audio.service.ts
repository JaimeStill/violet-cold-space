import { Injectable } from '@angular/core';

@Injectable()
export class AudioService {
  private SRC = '../../assets/audio/contact.mp3';

  bufferLength: number;
  floatTimeDomainData: Float32Array;
  floatFrequencyData: Float32Array;
  byteFrequencyData: Uint8Array;
  byteTimeDomainData: Uint8Array;
  source: AudioBufferSourceNode;
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

  private configureBuffer = async () => {
    this.context = new AudioContext();
    const source = this.context.createBufferSource();
    const res = await fetch(this.SRC);
    const buffer = await res.arrayBuffer();
    const blob = await this.context.decodeAudioData(buffer);
    source.buffer = blob;
    source.loop = true;
  }

  private setupContextAndNodes = () => {
    this.gainNode = this.context.createGain();
    this.analyser = this.context.createAnalyser();
  }

  private connectDestination = () => {
    this.source.connect(this.gainNode)
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

  initializeAudio = (): Promise<boolean> =>
    new Promise(async (resolve, reject) => {
      try {
        await this.configureBuffer();
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
      await this.source.stop();
      this.playing = false;
    } else {
      await this.source.start();
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

  toggleMute = () => {
    this.muted = !this.muted;
    this.muted ? this.gainNode.gain.value = 0 : this.gainNode.gain.value = this.gainValue;
    this.gain = this.gainNode.gain.value;
  }
}
