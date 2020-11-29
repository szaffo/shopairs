import { NotificationService } from './notification.service';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: Observable<firebase.default.User | null>;

  constructor(
    private firebaseAuth: AngularFireAuth,
    private router: Router,
    private ns: NotificationService
    ) {
      this.user = firebaseAuth.authState;
    }

  signup(email: string, password: string) {
    this.firebaseAuth
      .createUserWithEmailAndPassword(email, password)
      .then(value => {
        this.router.navigate(['lists'])
      })
      .catch(err => {
        this.ns.show(this.handleErrors(err))
        console.log('Something went wrong:', err.message);
      });
  }

  login(email: string, password: string) {
    this.firebaseAuth
      .signInWithEmailAndPassword(email, password)
      .then(value => {
        this.router.navigate(['lists'])
      })
      .catch(err => {
        this.ns.show(this.handleErrors(err))
        console.log('Something went wrong:', err.message);
      });
  }

  logout() {
    this.firebaseAuth.signOut()
      .then(() => {
        this.router.navigate(['/'])
      })
      .catch((err) => {
        this.ns.show(this.handleErrors(err)) 
      })
  }

  loginGoogle() {
    this.loginWithProvider(new firebase.default.auth.GoogleAuthProvider())
  }

  loginFacebook() {
    this.loginWithProvider(new firebase.default.auth.FacebookAuthProvider())
  }

  loginWithProvider(provider: firebase.default.auth.AuthProvider): void {
    this.firebaseAuth.signInWithRedirect(provider)
      .then(value => {
        this.router.navigate(['lists'])
      })
      .catch(err => {
        this.ns.show(this.handleErrors(err))
        console.log('Something went wrong:', err.message);
      });
  }

  checkRedirect(): void {
    this.firebaseAuth.getRedirectResult().then((result: any) => {
      console.debug('User logged in')
      if (result) {
        this.router.navigate(['lists'])
      }
    })
    .catch((err) => {
      console.log(err)
      this.ns.show(this.handleErrors(err))
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
    else return 'Something went wrong' 
  }

}