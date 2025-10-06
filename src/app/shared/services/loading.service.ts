import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSignal = signal<boolean>(false);
  private requestsCount = 0;

  public loading = this.loadingSignal.asReadonly();

  show(): void {
    this.requestsCount++;
    this.loadingSignal.set(true);
  }

  hide(): void {
    this.requestsCount--;
    if (this.requestsCount <= 0) {
      this.requestsCount = 0;
      this.loadingSignal.set(false);
    }
  }

  forceHide(): void {
    this.requestsCount = 0;
    this.loadingSignal.set(false);
  }
}
