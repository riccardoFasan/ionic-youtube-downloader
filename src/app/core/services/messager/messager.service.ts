import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class MessagerService {
  private readonly toastController: ToastController = inject(ToastController);

  async duplicateWarning(): Promise<void> {
    await this.presentToast(
      'This video has already been downloaded or is in progress.',
      'warning'
    );
  }

  async downloadError(url: string): Promise<void> {
    await this.presentToast(
      `There was an error downloading a video with url ${url}`,
      'danger'
    );
  }

  private async presentToast(
    message: string,
    color: 'danger' | 'success' | 'warning'
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 1500,
      position: 'bottom',
    });
    toast.present();
  }
}
