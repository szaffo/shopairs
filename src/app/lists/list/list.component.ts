import { AngularFireAnalytics } from '@angular/fire/analytics';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import '@firebase/firestore';


import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Input, OnInit, Output, EventEmitter, Inject, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { take } from 'rxjs/internal/operators/take';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  @Input() data: any = {}
  @Input() index: number = -1
  @Output() delete = new EventEmitter<any>()
  open = false;
  inputValue = ''
  inputError = false
  isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(Breakpoints.XSmall);
  token: string = ''
  items: any = []

  constructor
    (
      private breakpointObserver: BreakpointObserver,
      public dialog: MatDialog,
      private firestore: AngularFirestore,
      private analytics: AngularFireAnalytics

    ) {
  }

  ngOnInit(): void {
    this.open =  (this.index === 0)? true : this.data.open || false

    this.firestore.collection('items').ref.where('listId', "==", this.data.id).orderBy('created', 'desc').onSnapshot({
      next: (data) => {
        this.items = []
        data.docs.forEach((item) => {
          this.items.push(item)
        });
      }
    })
  }

  countChecked(): number {
    return this.items.filter((item: any) => item.data().checked).length
  }

  countAll(): number {
    return this.items.length
  }

  isDone(): boolean {
    return this.countAll() === this.countChecked()
  }

  itemAdd(): void {
    if (this.inputValue.trim().length <= 0) { this.inputValue = ''; return }
    
    let found = false
    this.items.forEach((item: any) => {
      if (item.data().name.toLowerCase() === this.inputValue.toLowerCase()) {
        item.ref.update({
          quantity: item.data().quantity + 1
        })
        found = true
        this.analytics.logEvent('itemInc')
      }
    });

    if (!found) {
      this.firestore.collection('items').add({
        name: this.inputValue,
        quantity: 1,
        chechked: false,
        listId: this.data.id,
        created: firebase.firestore.FieldValue.serverTimestamp(),
      }).then(() => {
        this.analytics.logEvent('itemAdd')
      }).catch((err) => {
        this.analytics.logEvent('error', { action: 'itemAdd', message: err.message })
      })
    }

    this.inputValue = ''
  }

  someDone(): boolean {
    return (0 < this.countChecked()) && (this.countAll() > this.countChecked())
  }

  setAll(to: boolean): void {
    this.items.forEach((item: any) => {
      item.ref.update({
        checked: to
      })
    });
  }

  deleteList(e: any): void {
    e.stopPropagation()
    this.delete.emit(this.data)
  }

  renameList(e: any, listId: number): void {
    e.stopPropagation()

    const dialogRef = this.dialog.open(RenameListDialog, {
      data: { name: this.data.data().name },
      width: '50%',
      height: '50%',
      maxWidth: '100vw',
      maxHeight: '100vh',
    });

    const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
      if (size.matches) {
        dialogRef.updateSize('98%', 'auto');
      } else {
        dialogRef.updateSize('600px', 'auto');
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      smallDialogSubscription.unsubscribe();
      const newName = result.trim()
      if (newName.length > 0 && newName !== this.data.name) {
        this.data.ref.update({
          name: newName
        }).then(() => {
          this.analytics.logEvent('listRename')
        }).catch((err: Error) => {
          this.analytics.logEvent('error', { action: 'listRename', message: err.message })
        })
      }
    });
  }

  shareDialog(e: any) {
    e.stopPropagation()

    const dialogRef = this.dialog.open(ShareListDialog, {
      data: this.data,
      width: '50%',
      height: '50%',
      maxWidth: '100vw',
      maxHeight: '100vh',
    });

    const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
      if (size.matches) {
        dialogRef.updateSize('98%', 'auto');
      } else {
        dialogRef.updateSize('600px', 'auto');
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      smallDialogSubscription.unsubscribe();
    });

  }
}
@Component({
  selector: 'renameList',
  templateUrl: './rename-list-dialog.component.html',
  styleUrls: ['./list.component.scss']
})
export class RenameListDialog {
  inputValue = ''

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<RenameListDialog>) {

  }

  ngOnInit() {
    this.inputValue = this.data.name
  }

  save() {
    this.dialogRef.close(this.inputValue);
  }
}

@Component({
  selector: 'shareList',
  templateUrl: './share-list-dialog.component.html',
  styleUrls: ['./list.component.scss']
})
export class ShareListDialog implements OnInit, OnDestroy {
  private sub: Subscription | null = null
  public family: any[] = []
  public displayedColumns = ['name', 'email', 'delete']
  public inputValue = ''

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ShareListDialog>,
    private authService: AuthService,
    private firestore: AngularFirestore,
    private ns: NotificationService,
    private analytics: AngularFireAnalytics
  ) {}

  ngOnInit() {
    this.getData()
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe()
  }
  
  getData() {
    this.ngOnDestroy()
    this.sub = this.firestore.collection('lists').doc(this.data.id).snapshotChanges().subscribe((list: any) => {
      const emails = list.payload.data().shared
      this.firestore.collection('users').ref.where('email', 'in', emails).get().then((users) => {
          const data: any[] = []
          users.docs.forEach((user:any) => {
            data.push({
              name: user.data().name,
              email: user.data().email
            })
          })
          this.family = data
        })
    })
    
  }

  addMember() {
    if (this.inputValue.trim().length === 0) { return }

    const email = this.inputValue.trim()
    
    if (this.family.filter((x) => x.email === email).length > 0) {
      this.ns.show('User already has access to the list')
      this.inputValue = ''
      return
    }

    this.firestore.collection("users").ref.where('email', '==', this.inputValue).limit(1).get().then((users: any) => {
      if (users.empty) {
        this.ns.show('User not found with the given email address')
      } else {
        this.firestore.collection('lists').doc(this.data.id).update({
          shared: [
            ...this.family.map(e => e.email),
            email
          ]
        }).then(() => {
          this.ns.show("List shared")
          this.inputValue = ''
        }).catch((err: Error) => {
          this.ns.show("Something went wrong")
          this.analytics.logEvent('error', { action: 'shareList', message: err.message })
        })
      }
    })
  }

  deleteMember(email: any) {
    if (email === this.authService.getUserData().email) {
      this.ns.show("Can not delete yourself from share list")
      return
    }   
    
    const members = this.family.map(e => e.email).filter(e => e !== email)
    
    this.firestore.collection('lists').doc(this.data.id).update({
      shared: members
    }).then(() => {
      this.analytics.logEvent('unshare')
    }).catch((err: Error) => {
      this.ns.show('Something went wrong')
      this.analytics.logEvent('error', { action: 'unshare', message: err.message })
    })
  }
  
}