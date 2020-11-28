import { AuthService } from './../core/services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email: string = ''
  password: string = ''
  disabled = false
  hide = true

  constructor(public authService: AuthService) { }

  ngOnInit(): void {
  }

  signup() {
    if (!this.email || !this.password) {return}
    this.disabled = true
    this.authService.signup(this.email, this.password);
    this.disabled = false
    this.password = '';
  }

  login() {
    if (!this.email || !this.password) {return}
    this.disabled = true
    this.authService.login(this.email, this.password);
    this.disabled = false
    this.password = '';
  }

  logout() {
    this.authService.logout();
  }

  loginWithGoogle() {
    this.disabled = true
    this.authService.loginGoogle();
    this.disabled = false
    this.password = '';
  }

}
