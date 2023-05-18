import { Injectable, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AskerService {
  private readonly alertController: AlertController = inject(AlertController);

  async shouldRemove(): Promise<boolean> {
    const { role } = await this.presentRemoveConfimAlert();
    return role === 'destructive';
  }

  private async presentRemoveConfimAlert(): Promise<any> {
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      message:
        'You are about to delete an audio file, this action cannot be undone.',
      buttons: [
        { role: 'cancel', text: 'Cancel' },
        { role: 'destructive', text: 'Remove' },
      ],
    });

    await alert.present();

    return alert.onDidDismiss();
  }
}
