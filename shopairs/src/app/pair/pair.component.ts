import { CookieService } from 'ngx-cookie-service';
import { Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { NotificationService } from "../core/services/notification.service";
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-pair',
  templateUrl: './pair.component.html',
  styleUrls: ['./pair.component.scss']
})
export class PairComponent implements OnInit, OnDestroy {
  private user$?: Subscription
  private firestore$?: Subscription
  public single: boolean
  public partnerEmail: string
  public selfUid: string
  public tokenSubscriber: any

  constructor(
    private authService: AuthService,
    private firestore: AngularFirestore,
    private notificationService: NotificationService,
    private cs: CookieService
    ) {
    this.single = true
    this.partnerEmail = ""
    this.selfUid = ""
    
  }

  ngOnInit(): void {
    console.debug("Went into the pair component constructor");
    this.user$ = this.authService.getUser().subscribe((user) => {
      if (user != null) {
        this.selfUid = user.uid || ''
        this.firestore$ = this.firestore.collection("users").doc(user.uid).valueChanges().subscribe((data: any) => {
          this.single = data.commonId === ''

          if (!this.single) {
            this.firestore.collection('users').ref.where('commonId', '==', this.cs.get('commonId')).get().then((user: firebase.default.firestore.QuerySnapshot<any>) => {
              this.partnerEmail = user.docs[0].data().email
            }).catch((err) => {
              console.log(err)
            })
          } else {
            this.partnerEmail = ''
          }
        })
      }
    });
  }

  ngOnDestroy(): void {
    console.debug("Went into the pair component destructor");
    if (this.user$ !== null) {this.user$?.unsubscribe()}
    if (this.firestore$ !== null) {this.firestore$?.unsubscribe()}
  }

  joinToPair(): void {
    const commonId = uuidv4()
    this.firestore.collection('users').ref.where('email', '==', this.partnerEmail).get().then((partner: any) => {
      if (partner.docs.length <= 0) {
        this.notificationService.show('User not found')
        return
      }
      if (partner.docs[0].data().commonId !== '') {
        this.notificationService.show('The given user is already in a pair')
      } else {
        if (this.selfUid !== "") {
          this.cs.set('commonId', commonId)
          partner.docs[0].ref.update({
            commonId
          })
          this.firestore.collection("users").doc(this.selfUid).update({ commonId })
          this.notificationService.show('Succesfully paired')
        }
      }
    }).catch((err) => {
      console.log(err)
    })
  }
}
