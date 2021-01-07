import { CookieService } from 'ngx-cookie-service';
import { NotificationService } from '../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { AngularFireAnalytics } from '@angular/fire/analytics';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.scss']
})
export class ListsComponent implements OnInit {

  public lists: any = []
  private inPair: boolean = true

  constructor(
    public dialog: MatDialog,
    private ns: NotificationService,
    private firestore: AngularFirestore,
    private cs: CookieService,
    private analytics: AngularFireAnalytics
  ) {}
  
  ngOnInit() {
    console.debug('Lists oninit')
    const commonId = this.cs.get('commonId')
    if (commonId !== null || commonId !== '') {
      this.firestore.collection('lists').ref.where('commonId', '==', commonId).orderBy('created', 'desc').onSnapshot({
        next: (data: firebase.default.firestore.QuerySnapshot<any>) => {
          this.lists = []
          data.docs.forEach((data) => {
            this.lists.push(data)
          })
        }
      })
    }
  }

  createList(name: string): void {
    if (name.trim().length > 0) {
      this.firestore.collection('lists').add({
        name: name.trim(),
        commonId: this.cs.get('commonId'),
        created: firebase.default.firestore.FieldValue.serverTimestamp(),
      }).then(() => {
        this.analytics.logEvent('listCreated')
      }).catch((err) => {
        this.analytics.logEvent('error', { action: 'listCreate', message: err.message })
      })
    }
  }

  deleteList(data: any): void {
    const dialogRef = this.dialog.open(AskDelDialog);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        data.ref.delete().then(() => {
          this.ns.show('List deleted')
          this.analytics.logEvent('listDelete')
        }).catch((err: Error) => {
          this.analytics.logEvent('error', { action: 'listDelete', message: err.message })
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