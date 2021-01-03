import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Observer } from 'rxjs';

@Injectable()
export class SocketService {

  constructor(private socket: Socket) { }

  send(event: string, data: any) {
    console.log(data)
    this.socket.emit(event, JSON.stringify(data))
  }

  listen(event: string) {
    return new Observable((observer: Observer<any>) => {
      this.socket.on(event, (data: any) => {
        observer.next(data)
      })
    })
  }
}