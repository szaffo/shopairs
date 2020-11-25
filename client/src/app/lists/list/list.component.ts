import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, ValidatorFn, AbstractControl } from '@angular/forms';

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

  constructor() {}

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
}
