
import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private snackBar: MatSnackBar) { }

  public show(message: any, action: string | undefined = 'close', config?: MatSnackBarConfig | null): void {
    if (!config) {
      config = new MatSnackBarConfig();
      config.duration = 3000;

    }
    this.snackBar.open(message, action, config);
  }

}