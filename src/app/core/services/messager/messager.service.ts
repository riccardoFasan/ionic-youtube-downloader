import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class MessagerService {
  private readonly toastController: ToastController = inject(ToastController);

  async downloadSuccess(title: string): Promise<void> {
    await this.presentToast(`${title} has been saved.`, 'success');
  }

  async downloadError(url: string): Promise<void> {
    await this.presentToast(
      `There was an error downloading a video with url ${url}`,
      'danger'
    );
  }

  private async presentToast(
    message: string,
    color: 'danger' | 'success'
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 1500,
      position: 'top',
    });
    toast.present();
  }
}
