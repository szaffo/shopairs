import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from './../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  hide = true;
  user: any = {
    displayName: '',
    email: ''
  }

  constructor(private ns: NotificationService, private authService: AuthService, private afu: AngularFireAuth) {
    
  }

  ngOnInit(): void {
    this.authService.getUser().subscribe((user) => {
      if (user) {
        this.user.displayName = user.displayName
        this.user.email = user.email
      }
    })
  }

  openSnackBar() {
    console.log(this.user.displayName)
    this.authService.setUsername(this.user.displayName)
  }
}