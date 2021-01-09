import { Subscription } from 'rxjs/internal/Subscription';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { NotificationService } from './../core/services/notification.service';
import { CookieService } from 'ngx-cookie-service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { take } from 'rxjs/internal/operators/take';

@Component({
  selector: 'app-pair',
  templateUrl: './pair.component.html',
  styleUrls: ['./pair.component.scss']
})
export class PairComponent implements OnInit, OnDestroy {

  public inputValue: any = ''
  private sub: Subscription | null = null
  public family: any[] = []
  public displayedColumns = ['name', 'email', 'delete']

  constructor(
    private authService: AuthService,
    private firestore: AngularFirestore,
    private ns: NotificationService,
    private analytics: AngularFireAnalytics
    ) {
    
    
  }

  ngOnInit(): void {
    this.analytics.logEvent('viewFamily')
    this.authService.getUserDataObservable().pipe(take(1)).subscribe((user: any) => {
      this.sub = this.firestore.collection('users').doc(user.uid).snapshotChanges().subscribe((userDoc: any) => {
        // if (userDoc.payload.data().family.length <= 0) {return}
        this.firestore.collection('users').ref.where('email', 'in', [...userDoc.payload.data().family, '']).get().then((users) => {
          const data: any[] = []
          users.docs.forEach((user: any) => {
            data.push({
              name: user.data().name,
              email: user.data().email,
              uid: user.data().uid
            })
          })
          this.family = data
        })
      })     
    })
    
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe()
  }

  addMember() {
    if (this.inputValue.trim().length === 0) { return }
    
    this.analytics.logEvent('addingFamilyMember')
    
    const email = this.inputValue.trim()
    if (this.family.filter((x) => x.email === email).length > 0) {
      this.ns.show('User already added to the family')
      this.analytics.logEvent('failedMemberAdd', { reason: 'alreadyAdded' })
      this.inputValue = ''
      return  
    }
    
    
    
    this.firestore.collection("users").ref.where('email', '==', this.inputValue).limit(1).get().then((users: any) => {
      if (users.empty) {
        this.ns.show('User not found with the given email address')
        this.analytics.logEvent('failedMemberAdd', { reason: 'notFound' })
      } else {
        this.authService.getUserDataObservable().pipe(take(1)).subscribe((userData) => {
          this.firestore.collection('users').doc(userData.uid).update({
            family: [
              ...userData.family,
              email
            ]
          }).then(() => {
            this.inputValue = ''
            this.analytics.logEvent('memberAddSuccess')
            this.ns.show('Family member successfully added')
          }).catch((err: Error) => {
            this.ns.show('Something went wrong')
            this.analytics.logEvent('error', { action: 'addMember', message: err.message })
          })
        })
      }
    })
  }

  deleteMember(email: any) {
    const members = this.family.map(e => e.email).filter(e => e !== email)
    this.authService.getUserDataObservable().pipe(take(1)).subscribe((user) => {
      this.firestore.collection('users').doc(user.uid).update({
        family: members
      }).then(() => {
        this.ns.show('Successfully deleted from family group')
        this.analytics.logEvent('memberDeleteSuccess')
      }).catch((err: Error) => {
        this.ns.show('Something went wrong')
        this.analytics.logEvent('error', { action: 'deleteMember', message: err.message })
      })
    })
  }
  
}
