import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from './../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';
import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/internal/operators/take';

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
    this.authService.getUserDataObservable().pipe(take(1)).subscribe((user) => {
      if (user) {
        this.user.displayName = user.name
        this.user.email = user.email
      }
    })
  }

  openSnackBar() {
    this.authService.setUsername(this.user.displayName)
  }
}