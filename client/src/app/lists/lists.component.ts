import { NotificationService } from '../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { Component, Input } from '@angular/core';
// import { NewButtonComponent } from '../new-button/new-button.component';
import { AuthService } from '../core/services/auth.service';
import { SocketService } from '../core/services/socket-service.service';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.scss']
})
export class ListsComponent {

  private token: string
  public lists: any = []

  constructor(
    public dialog: MatDialog,
    private ns: NotificationService,
    private socketService: SocketService,
    private authService: AuthService
  ) {
    this.token = ""

    this.authService.getUserToken().subscribe((data: any) => {
      this.token = data
      console.debug(this.token)

      this.socketService.send("getLists", { token: this.token })
    })
    this.socketService.listen("getLists").subscribe((data): any => {
      if(data.data.length !== 0) {
        this.lists = data.data
      }
      console.debug(data)
    })
  }


  change(): void {
    console.log('dataset is changed. Should save')
  }

  createList(name: string): void {
    if (name.trim().length > 0) {
      this.lists.push({
        name: name.trim(),
        items: [],
        open: true
      })

      this.socketService.send("createList", {
        token: this.token,
        name: name.trim()
      })
    }
  }

  deleteList(name: string, id: number): void {
    console.log(id);
    const dialogRef = this.dialog.open(AskDelDialog);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.lists = this.lists.filter((list: any) => list.name !== name)
        this.ns.show('List deleted')

        this.socketService.send("deleteList", {
          token: this.token,
          listId: id
        });
      }
    });
  }
}

@Component({
  selector: 'askDelDialog',
  templateUrl: './ask-del-dialog.component.html',
})
export class AskDelDialog { }