import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { SocketService } from '../core/services/socket-service.service';
import { NotificationService } from "../core/services/notification.service";
import { Router } from '@angular/router';

@Component({
  selector: 'app-pair',
  templateUrl: './pair.component.html',
  styleUrls: ['./pair.component.scss']
})
export class PairComponent implements OnInit {
  private user: any
  private token: string
  public single: boolean
  public partnerEmail: string
  public tokenSubscriber: any

  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.token = ""
    this.single = true
    this.partnerEmail = ""

    console.debug("Went into the pair component constructor");
  }

  ngOnInit(): void {
    console.debug("Went into the pair component initializer");

    this.authService.getUserToken().subscribe((data: any) => {
      this.token = data
      console.debug(this.token);
    });
    this.authService.getUser().subscribe((data: any) => {
      this.user = data
      console.debug(data);
    });
    this.socketService.listen("joinToPair").subscribe((data: any) => {
      console.debug(data);
      if (data.success) {
        this.notificationService.show("You are now paired!")
        this.router.navigate(['lists'])
      } else {
        this.notificationService.show(data.error)
      }
    });
  }

  ngOnDestroy(): void {
    console.debug("Went into the pair component destructor");

  }

  joinToPair(): void {
    this.socketService.send("joinToPair", {
      token: this.token,
      email: this.user.email,
      partnerEmail: this.partnerEmail
    });
  }
}
