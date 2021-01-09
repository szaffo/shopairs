import firebase from 'firebase/app';
import '@firebase/firestore';
import '@firebase/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireAnalytics } from '@angular/fire/analytics';

import { Router } from '@angular/router';
import { Injectable, isDevMode } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { CookieService } from 'ngx-cookie-service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  locked: boolean = false
  private userData: any = null
  private userDataChange: Observable<any>

  constructor(
    private firebaseAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
    private ns: NotificationService,
    private cookieService: CookieService,
    private analytics: AngularFireAnalytics,
    ) {
      // this.user = firebaseAuth.authState;
      
      this.userDataChange = new Observable((observer) => {
        firebaseAuth.authState.subscribe((user: any) => {
          if (user === null) {
            observer.next(null)
          } else {
            this.firestore.collection('users').doc(user.uid).get().pipe(take(1)).subscribe((userDoc: firebase.firestore.DocumentSnapshot<any>) => {
              const userData = {
                ...user,
                ...userDoc.data()
              }
              observer.next(userData)
            })
          }
        })
      })

      this.userDataChange.subscribe((userData) => {
        this.userData = userData
        if (userData === null) {
          this.router.navigate(['/login'])
        } else {
          if (this.router.url === '/register' || this.router.url === '/login' || this.router.url === '/') { this.router.navigate(['lists']) }
        }
      })
  }


  setUsername(displayName: any) {
    if (this.userData === null) { return }
    
   this.firestore.collection('users').doc(this.userData.uid).update({
      name: displayName || ''
   }).then(() => {
        this.ns.show('Settings are saved');
    }).catch((err: Error) => {
        console.log(err)
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
          if (userCredential.user === null) { return }
            
          this.firestore.collection("users").doc(userCredential.user.uid).set({
            uid: userCredential.user.uid,
            commonId: '',
            created: firebase.firestore.FieldValue.serverTimestamp(),
            email: userCredential.user.email,
            family: [],
            name: userCredential.user.displayName  || ''
          }).then(() => {
            this.cookieService.delete('loginMethod')
            if (userCredential.user !== null) {
              this.analytics.logEvent('register', { uid: userCredential.user.uid, provider: 'email' })
            }
          }).catch((err: Error) => {
            this.ns.show(this.handleErrors(err))
          })
          
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
      .catch((err) => {
        this.ns.show(this.handleErrors(err)) 
      })
  }

  loginGoogle() {
    // this.cookieService.set('loginMethod', 'googleProvider')
    this.loginWithProvider(new  firebase.auth.GoogleAuthProvider())
  }

  loginFacebook() {
    // this.cookieService.set('loginMethod', 'facebookProvider')
    this.loginWithProvider(new firebase.auth.FacebookAuthProvider())
  }

  loginWithProvider(provider: firebase.auth.AuthProvider): void {
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

  getUser(): Observable<firebase.User | null> {
    return this.firebaseAuth.user
  }
  
  getUserData() {
    return this.userData
  }

  getUserDataObservable(): Observable<any> {
    return this.userDataChange
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