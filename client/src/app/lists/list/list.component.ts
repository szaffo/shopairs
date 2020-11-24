import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  @Input() data: any;
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

}
