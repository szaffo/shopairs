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
        this.ns.show('Something went wrong. We are sorry :c')
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
        this.ns.show('Something went wrong. We are sorry :c')
        console.log('Something went wrong:', err.message);
      });
  }

  logout() {
    this.firebaseAuth.signOut()
      .then(() => {
        this.router.navigate(['/'])
      })
      .catch(() => {
        this.ns.show('There was an error while loggig out') // TODO detailed errors
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
        this.ns.show('Something went wrong. We are sorry :c')
        console.log('Something went wrong:', err.message);
      });
  }

  checkRedirect(): void {
    this.firebaseAuth.getRedirectResult().then((result: any) => {
      if (result) {
        this.router.navigate(['lists'])
      }
    })
    .catch((err) => {
      console.log(err)
      this.ns.show('Something went wrong :(')
    })
  }

}