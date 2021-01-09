import { AuthService } from './../core/services/auth.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { take } from 'rxjs/internal/operators/take';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
	public profilePic = ''
	public name = 'User'
	public email = ''
	private subscription: Subscription | null = null
	
	constructor(public auth: AuthService, private firestore: AngularFirestore) {}
	
	ngOnInit() {
		this.auth.getUserDataObservable().pipe(take(1)).subscribe((user: any) => {
			if (user) {
				this.ngOnDestroy()
				this.subscription = this.firestore.collection('users').doc(user.uid).snapshotChanges().subscribe({
					next: (userData: any) => {
						this.profilePic = user.photoURL
						this.name = userData.payload.data().name || 'User'
						this.email = userData.payload.data().email
					}})
			}
		})
	}

	ngOnDestroy() {
		if (this.subscription) {
			this.subscription.unsubscribe()
		}
	}
}