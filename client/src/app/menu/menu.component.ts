import { AuthService } from './../core/services/auth.service';
import { Component } from '@angular/core';

import { Observable } from 'rxjs';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
	profilePic = ''
	name = 'User'
	email = ''
	constructor(public auth: AuthService) {
		auth.getUser().subscribe((user: any) => {
			if (user) {
				this.profilePic = user.photoURL
				this.name = user.displayName || 'User'
				this.email = user.email
			}
		})
	}
}