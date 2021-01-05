import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { SocketService } from '../../../core/services/socket-service.service';
import { AuthService } from '../../../core/services/auth.service'

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {

  token: string = ''

  @Input() data: any;
  @Output() change = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  constructor(
    private authService: AuthService,
    private socketService: SocketService
  ) {

  }

  ngOnInit(): void {
    this.data.quantity = this.data.quantity || 1

    this.authService.getUserToken().subscribe((data: any) => {
      this.token = data
      console.debug(data)
    })
  }

  check(itemId: number): void {
    this.data.checked = !this.data.checked
    this.change.emit(this.data.name)

    this.socketService.send("doneItem", {
      token: this.token,
      itemId,
      done: this.data.checked
    })
  }

  _delete(): void {
    this.delete.emit(this.data.name)
  }

  incQuantity(itemId: number): void {
    this.data.quantity += 1

    this.socketService.send("changeQuantity", {
      token: this.token,
      itemId,
      quantity: this.data.quantity
    });
  }

  decQuantity(itemId: number): void {
    this.data.quantity = Math.max(1, this.data.quantity - 1)

    this.socketService.send("changeQuantity", {
      token: this.token,
      itemId,
      quantity: this.data.quantity
    });
  }

}
