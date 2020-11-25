import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  @Input() data: any;
  @Output() change = new EventEmitter()
  open = false;

  constructor() {
    this.data = {}
  }

  ngOnInit(): void {
  }

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

}
