import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Input, OnInit, Output, EventEmitter, Inject } from '@angular/core';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  @Input() data: any = {}
  @Output() change = new EventEmitter()
  @Output() delete = new EventEmitter<string>()
  open = false;
  inputValue = ''
  inputError = false

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {}

  countChecked(): number {
    return this.data.items.filter((item: any) => item.checked).length
  }

  countAll(): number {
    return this.data.items.length
  }

  isDone(): boolean {
    return this.countAll() === this.countChecked()
  }

  itemCheck(): void {
    this.change.emit()
  }

  itemDelete(name: string): void {
    this.data.items = this.data.items.filter((item: any)=> item.name !== name)
    this.change.emit()
  }

  itemAdd(): void {
    if (this.inputValue.trim().length <= 0) { this.inputValue = ''; return}
    let found = false
    this.data.items.forEach((item: any) => {
      if (item.name.toLowerCase() === this.inputValue.toLowerCase()) {
        item.quantity = item.quantity || 0
        item.quantity += 1
        found = true
      }
    });

    if (!found) {
      this.data.items.push({
        name: this.inputValue,
        quantity: 1,
        checked: false
      })
    }

    this.inputValue = ''
    this.change.emit()
  }

  someDone(): boolean {
    return (0 < this.countChecked()) && (this.countAll() > this.countChecked())
  }

  setAll(to: boolean): void {
    this.data.items.forEach((item: any) => {
      item.checked = to;
    });
  }

  deleteList(e: any): void {
    e.stopPropagation()
    this.delete.emit(this.data.name)
  }

  renameList(e: any): void {
    e.stopPropagation()

    const dialogRef = this.dialog.open(RenameListDialog, {data: {name: this.data.name}});

    dialogRef.afterClosed().subscribe(result => {
      const newName = result.trim()
      if (newName.length > 0 && newName !== this.data.name) {
        this.data.name = newName
        this.change.emit()
      }
    });
  }
}
@Component({
  selector: 'renameList',
  templateUrl: './rename-list-dialog.component.html',
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