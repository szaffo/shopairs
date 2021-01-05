import { SocketService } from './socket-service.service';
import { NotificationService } from './notification.service';
import { Router } from '@angular/router';
import { Injectable, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import * as firebase from 'firebase/app';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: Observable<firebase.default.User | null>;

  constructor(
    private firebaseAuth: AngularFireAuth,
    private router: Router,
    private ns: NotificationService,
    private cookieService: CookieService,
    private socketService: SocketService
    ) {
      this.user = firebaseAuth.authState;
      
      this.socketService.listen('register').subscribe((data: any) => {
        if (data == null) {console.log("NULLNLUNL")} // TODO delete line
        if (data.success) {
          this.router.navigate(['lists'])
        } else {
          this.ns.showSocketError(data)
          this.cookieService.delete('loginMethod')
        }
      })
  }

  signup(email: string, password: string) {
    this.cookieService.set('loginMethod', 'email')
    this.firebaseAuth
      .createUserWithEmailAndPassword(email, password)
      .then(value => { // TODO maybe the value contains the token
        this.getUserToken().subscribe((token: any) => {
          const data = { token }
          console.log(data)
          this.socketService.send('register', data)
        })
      })
      .catch(err => {
        this.ns.show(this.handleErrors(err))
        this.cookieService.delete('loginMethod')
        console.log('Something went wrong:', err.message);
      });
  }

  login(email: string, password: string) {
    this.cookieService.set('loginMethod', 'email')
    this.firebaseAuth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        this.router.navigate(['lists'])
      })
      .catch(err => {
        this.ns.show(this.handleErrors(err))
        this.cookieService.delete('loginMethod')
        console.log('Something went wrong:', err.message);
      });
  }

  logout() {
    this.cookieService.delete('loginMethod')
    this.firebaseAuth.signOut()
      .then(() => {
        this.router.navigate(['/'])
      })
      .catch((err) => {
        this.ns.show(this.handleErrors(err)) 
      })
  }

  loginGoogle() {
    this.cookieService.set('loginMethod', 'googleProvider')
    this.loginWithProvider(new  firebase.default.auth.GoogleAuthProvider())
  }

  loginFacebook() {
    this.cookieService.set('loginMethod', 'facebookProvider')
    this.loginWithProvider(new firebase.default.auth.FacebookAuthProvider())
  }

  loginWithProvider(provider: firebase.default.auth.AuthProvider): void {
    this.firebaseAuth.signInWithRedirect(provider)
      .then(value => {
        this.router.navigate(['lists'])
      })
      .catch(err => {
        this.ns.show(this.handleErrors(err))
        this.cookieService.delete('loginMethod')
        console.log('Something went wrong:', err.message);
      });
  }

  checkRedirect(): void {
    this.firebaseAuth.getRedirectResult().then((result: any) => {
      if (result) {
        console.debug('User logged in')
        this.router.navigate(['lists'])
      } else {
        this.cookieService.delete('loginMethod')
      }
    })
    .catch((err) => {
      console.log(err)
      this.cookieService.delete('loginMethod')
      this.ns.show(this.handleErrors(err))
    })
  }

  checkLogin(): void {
    this.user.subscribe((user:any) => {
      console.log(user) // TODO delete console log
      if (user) {
        console.debug('User logged in')
        this.router.navigate(['lists'])
      } else {
        this.cookieService.delete('loginMethod')
      }
    })
          
  }

  handleErrors(error: any): string {
    if (!error || !error.code) { return 'Something went wrong' }
    else if (error.code === 'auth/user-not-found') { return 'No user found corresponding with this sign in method' }
    else if (error.code === 'auth/session-cookie-expired') { return 'The session os expired' }
    else if (error.code === 'auth/invalid-email') { return 'The email format is wrong' }
    else if (error.code === 'auth/email-already-exists') { return 'This email is already used' }
    else if (error.code === 'auth/wrong-password') { return 'The email or password is invalid or you don\'t have a password. Try other sign in methods' }
    else if (error.code === 'auth/account-exists-with-different-credential') { return 'Your account registered with a different sign in method' }
    else if (error.code === 'auth/email-already-in-use') { return 'Email address already in use' }
    else if (error.code === 'auth/weak-password') { return 'Password should be at least 6 characters' }
    else return 'Something went wrong' 
  }

  getUserToken(): any {
    return this.firebaseAuth.idToken
  }

  getUser(): any {
    return this.firebaseAuth.user
  }

}