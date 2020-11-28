import { NotificationService } from './notification.service';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

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
    this.firebaseAuth.signOut();
    this.router.navigate(['/'])
  }

}