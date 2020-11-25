import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {

  @Input() data: any;
  @Output() change = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  check(): void {
    this.data.checked = !this.data.checked
    this.change.emit(this.data.name)
  }

  _delete():void {
    this.delete.emit(this.data.name)
  }

}
