import { AuthService } from './../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  token = ''

  constructor(private ns: NotificationService, private auth: AuthService) {
    this.auth.getUserToken().subscribe((_token: any) => {
      this.token = _token
    })
  }

  ngOnInit(): void {
  }
  hide = true;

  openSnackBar() {
    this.ns.show('Settings are saved', 'Close', {
      duration: 1500,
    });
  }
}