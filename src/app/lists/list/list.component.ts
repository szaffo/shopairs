import { AngularFireAnalytics } from '@angular/fire/analytics';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import '@firebase/firestore';


import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Input, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';

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