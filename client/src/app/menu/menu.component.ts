import { AuthService } from './../core/services/auth.service';
import { Component } from '@angular/core';

import { Observable } from 'rxjs';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
	constructor(public auth: AuthService) {}
}