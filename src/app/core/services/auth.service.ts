import 'firebase/firestore';
import { NotificationService } from './notification.service';
import { Router } from '@angular/router';
import { Injectable, isDevMode } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: Observable<firebase.default.User | null>;
  locked: boolean = false

  constructor(
    private firebaseAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
    private ns: NotificationService,
    private cookieService: CookieService,
    private analytics: AngularFireAnalytics,
    ) {
      this.user = firebaseAuth.authState;

      this.user.subscribe((user: any) => {
        if (user === null) {
          this.cookieService.set('commonId', '')
        } else {
          this.firestore.collection('users').doc(user.uid).get().subscribe((doc: firebase.default.firestore.DocumentSnapshot<any>) => {
            const commonId = doc.data().commonId
            this.cookieService.set('commonId', commonId)
            if (this.router.url === '/register' || this.router.url === '/login') { this.router.navigate(['lists']) }
          })
        }
      })
    }

  setUsername(displayName: any) {
    this.firebaseAuth.currentUser.then((user) => {
      if (user != null) {
        user.updateProfile({
          displayName : displayName
        }).then(() => {
          this.ns.show('Settings are saved');
        }).catch((err) => {
          console.log(err)
        })
      }
    })
  }

  signup(email: string, password: string) {
    if (this.locked) {
      this.ns.show('Can not login now')
      return
    }
    
    this.cookieService.set('loginMethod', 'email')
    
    this.firebaseAuth
      .createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
          if (userCredential.user !== null) {
            this.firestore.collection("users").doc(userCredential.user.uid).set({
              uid: userCredential.user.uid,
              commonId: '',
              created: firebase.default.firestore.FieldValue.serverTimestamp(),
              email: userCredential.user.email
            }).then(() => {
              this.cookieService.delete('loginMethod')
              if (userCredential.user !== null) {
                this.analytics.logEvent('emailRegister', { uid: userCredential.user.uid })
              }
              this.router.navigate(['/lists'])
            })
          }
        })
        .catch(err => {
          this.ns.show(this.handleErrors(err))
          this.cookieService.delete('loginMethod')
          console.log('Something went wrong:', err.message);
        });
  }

  login(email: string, password: string) {
    if (this.locked) {
      this.ns.show('Can not login now')
      return
    }

    this.cookieService.set('loginMethod', 'email')
    this.firebaseAuth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        // this.router.navigate(['lists'])
      })
      .catch(err => {
        this.ns.show(this.handleErrors(err))
        this.cookieService.delete('loginMethod')
        console.log('Something went wrong:', err.message);
      });
  }

  logout() {
    this.cookieService.delete('loginMethod')
    this.cookieService.set('commonId', '')
    this.firebaseAuth.signOut()
      .then(() => {
        this.router.navigate(['/'])
      })
      .catch((err) => {
        this.ns.show(this.handleErrors(err)) 
      })
  }

  loginGoogle() {
    // this.cookieService.set('loginMethod', 'googleProvider')
    this.loginWithProvider(new  firebase.default.auth.GoogleAuthProvider())
  }

  loginFacebook() {
    // this.cookieService.set('loginMethod', 'facebookProvider')
    this.loginWithProvider(new firebase.default.auth.FacebookAuthProvider())
  }

  loginWithProvider(provider: firebase.default.auth.AuthProvider): void {
    this.ns.show('This login method is unavailable now')
    return
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
      if (user) {
        console.debug('User logged in')
        this.router.navigate(['lists'])
      } else {
        this.cookieService.delete('loginMethod')
        this.cookieService.set('commonId', '')
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

  getUserToken(): Observable<string | null> {
    return this.firebaseAuth.idToken
  }

  getUser(): Observable<firebase.default.User | null> {
    return this.firebaseAuth.user
  }

  maintanceMode() {
    if (!isDevMode()) {
      this.logout()
    }
  }

  lock() {
    this.locked = true
  }

  unlock() {
    this.locked = false
  }


}