import { NotificationService } from './../../../core/services/notification.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {

  public name: string = ''
  public quantity: number = 1
  public checked: boolean = false

  @Input() data: any;

  constructor(private ns: NotificationService) {}

  ngOnInit(): void {
    this.quantity = this.data.data().quantity
    this.name = this.data.data().name
    this.checked = this.data.data().checked || false
  }

  check(): void {
    this.checked = !this.checked
    this.save()
  }

  delete(): void {
    this.data.ref.delete().then(() => {
      this.ns.show('Item deleted')
    })
  }

  incQuantity(itemId: number): void {
    this.quantity += 1
    this.save()
  }

  decQuantity(itemId: number): void {
    this.quantity = Math.max(1, this.data.data().quantity - 1)
    this.save()
  }

  save() {
    this.data.ref.update({
      name: this.name,
      quantity: this.quantity,
      checked: this.checked
    })
  }

}
