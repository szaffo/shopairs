import { NotificationService } from '../core/services/notification.service';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(private ns: NotificationService) { }

  ngOnInit(): void {
  }
  hide = true;

  openSnackBar() {
    this.ns.show('Settings are saved', 'Close', {
      duration: 1500,
    });
  }
}