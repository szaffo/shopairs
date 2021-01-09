import { AuthService } from './../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { take } from "rxjs/operators";

import firebase from 'firebase/app';
import '@firebase/firestore';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.scss']
})
export class ListsComponent implements OnInit {

  public lists: any = []

  constructor(
    public dialog: MatDialog,
    private ns: NotificationService,
    private firestore: AngularFirestore,
    private analytics: AngularFireAnalytics,
    private as: AuthService
  ) {}
  
  ngOnInit() {
    this.as.getUserDataObservable().pipe(take(1)).subscribe((userData) => {
      if (userData === null) {return}
      
      this.firestore.collection('lists').ref.where('shared', 'array-contains', userData.email).orderBy('created', 'desc').onSnapshot({
        next: (data: firebase.firestore.QuerySnapshot<any>) => {
          this.lists = []
          data.docs.forEach((data) => {
            this.lists.push(data)
          })
        }
      })  
    })
  }

  createList(data: {name: string, share: boolean}): void {
    const {name, share} = data
    
    if (name === undefined || name.trim().length <= 0) {
      this.analytics.logEvent('listCreateCancelled')
      return 
    }
    
    const userData = this.as.getUserData()
      
    this.firestore.collection('lists').add({
      name: name.trim(),
      created: firebase.firestore.FieldValue.serverTimestamp(),
      shared: [
        userData.email,
        ...((share)? userData.family : [])
      ]
    }).then(() => {
      this.analytics.logEvent('listCreated')
    }).catch((err) => {
      this.analytics.logEvent('error', { action: 'listCreate', message: err.message })
    })

  }

  deleteList(data: any): void {
    const dialogRef = this.dialog.open(AskDelDialog);

    dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
      if (result) {
        data.ref.delete().then(() => {
          this.ns.show('List deleted')
          this.analytics.logEvent('listDelete')
        }).catch((err: Error) => {
          this.analytics.logEvent('error', { action: 'listDelete', message: err.message })
        })

        this.firestore.collection('items').ref.where('listId', '==', data.id).get().then((items: firebase.firestore.QuerySnapshot<any>) => {
          items.docs.forEach((doc) => {
            doc.ref.delete()
          })
        })
      }
    });
  }
}

@Component({
  selector: 'askDelDialog',
  templateUrl: './ask-del-dialog.component.html',
})
export class AskDelDialog { }