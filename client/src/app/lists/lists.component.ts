import { MatDialog } from '@angular/material/dialog';
import { Component, Input } from '@angular/core';
// import { NewButtonComponent } from '../new-button/new-button.component';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.scss']
})
export class ListsComponent {
  constructor(public dialog: MatDialog) {}

  lists = [
    {
      name: 'Tesco',
      items: [
        { name: 'Bread', checked: true },
        { name: 'Milk', checked: false },
        { name: 'Sugar', checked: true },
        { name: 'Coffee', checked: true },
        { name: 'Snacks', checked: false },
        { name: 'Cola', checked: false },
        { name: 'Water', checked: true },
      ]
    },
    {
      name: 'Lidl',
      items: [
        { name: 'apple', checked: false },
        { name: 'ham', checked: false },
        { name: 'cookies', checked: false },
      ]
    },
    {
      name: 'the birthday party',
      open: false,
      items: [
        { name: 'drinka', checked: true },
        { name: 'cakes', checked: true },
        { name: 'presents', checked: true },
        { name: 'paper cups', checked: true },
        { name: 'paper plates', checked: true },
      ]
    }
  ]

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
    } 
  }

  deleteList(name:string): void {
    const dialogRef = this.dialog.open(AskDelDialog);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.lists = this.lists.filter((list: any) => list.name !== name)
      }
    });
  }
}

@Component({
  selector: 'askDelDialog',
  templateUrl: './ask-del-dialog.component.html',
})
export class AskDelDialog { }