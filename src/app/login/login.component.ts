import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { AuthService } from './../core/services/auth.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = ''
  password: string = ''
  disabled = false
  hide = true
  register = false
  sub: any

  constructor(
    public authService: AuthService,
    public router: Router,
    private cookiService: CookieService
    ) {
    this.register = this.router.url == '/register'
  }

  ngOnInit(): void {}

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

  loginWithFacebook() {
    this.disabled = true
    this.authService.loginFacebook();
    this.disabled = false
    this.password = '';
  }

  inProgress(): boolean {
    return this.cookiService.check('loginMethod')
  }

}
