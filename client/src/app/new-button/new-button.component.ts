import { EventEmitter } from '@angular/core';
import { Component , Output } from '@angular/core';
import { MatDialog, MatDialogRef} from '@angular/material/dialog';



@Component({
  selector: 'app-new-button',
  templateUrl: './new-button.component.html',
  styleUrls: ['./new-button.component.scss']
})
export class NewButtonComponent {
  inputValue = ''
  @Output() result = new EventEmitter<string>()

  constructor(public dialog: MatDialog) { }

  openDialog() {
    const dialogRef = this.dialog.open(CreateListDialog);

    dialogRef.afterClosed().subscribe(result => {
      this.result.emit(result)
    });
  }
}
@Component({
  selector: 'createListDialog',
  templateUrl: './createListDialog.component.html',
})
export class CreateListDialog {
  inputValue = ''

  constructor(
    private dialogRef: MatDialogRef<CreateListDialog>) {
    
  }

  save() {
    this.dialogRef.close(this.inputValue);
  }
}