import { AngularFireAnalytics } from '@angular/fire/analytics';
import { EventEmitter } from '@angular/core';
import { Component , Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-new-button',
  templateUrl: './new-button.component.html',
  styleUrls: ['./new-button.component.scss']
})
export class NewButtonComponent {
  inputValue = ''
  @Output() result = new EventEmitter<{ name: string, share: boolean }>()
  isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(Breakpoints.XSmall);

  constructor(
    private breakpointObserver: BreakpointObserver,
    public dialog: MatDialog,
    private analytics: AngularFireAnalytics
  ) {}

  openDialog() {
    this.analytics.logEvent('listCreateStarted')
    const dialogRef = this.dialog.open(CreateListDialog, {
      width: '50%',
      height: '100%',
      maxWidth: '100vw',
      maxHeight: '100vh',
    });

    const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
      if (size.matches) {
        dialogRef.updateSize('98%');
      } else {
        dialogRef.updateSize('600px');
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.result.emit(result)
      smallDialogSubscription.unsubscribe();
    });
  }
}
@Component({
  selector: 'createListDialog',
  templateUrl: './createListDialog.component.html',
  styleUrls: ['./new-button.component.scss']
})
export class CreateListDialog {
  inputValue = ''
  share = true

  constructor(
    private dialogRef: MatDialogRef<CreateListDialog>) {
    
  }

  save() {
    this.dialogRef.close({
      name: this.inputValue,
      share: this.share
    });
  }
}