import { NotificationService } from './core/services/notification.service';
import { AuthService } from './core/services/auth.service';
import { isDevMode, NgModule } from '@angular/core';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAnalyticsModule, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { AngularFireRemoteConfig, AngularFireRemoteConfigModule, DEFAULTS, SETTINGS } from '@angular/fire/remote-config';

import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CookieService } from 'ngx-cookie-service';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatRippleModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatTableModule } from '@angular/material/table'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { ListsComponent, AskDelDialog } from './lists/lists.component';
import { NewButtonComponent, CreateListDialog } from './new-button/new-button.component';
import { SettingsComponent } from './settings/settings.component';
import { PairComponent } from './pair/pair.component';
import { ListComponent, RenameListDialog, ShareListDialog } from './lists/list/list.component';
import { ItemComponent } from './lists/list/item/item.component';
import { LoginComponent } from './login/login.component';
import { environment } from 'src/environments/environment';
import { LandingComponent } from './landing/landing.component';

import * as Hammer from 'hammerjs';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
export class MyHammerConfig extends HammerGestureConfig {
	buildHammer(element: HTMLElement): HammerManager {
		return new Hammer.Manager(element, {
			touchAction: 'auto',
			inputClass: Hammer.TouchInput,
			recognizers: [
				[Hammer.Swipe, {
					direction: Hammer.DIRECTION_HORIZONTAL
				}]
			]
		});
	}
}

@NgModule({
	declarations: [
		AppComponent,
		MenuComponent,
		ListsComponent,
		CreateListDialog,
		AskDelDialog,	
		ListComponent,
		RenameListDialog,
		ItemComponent,
		NewButtonComponent,
		SettingsComponent,
		PairComponent,
		LoginComponent,
		LandingComponent,
		ShareListDialog
	],
	imports: [
		BrowserModule,
		AngularFireModule.initializeApp(environment.firebase),
		AngularFireAuthModule,
		AngularFirestoreModule,
		AngularFireAnalyticsModule, // TODO make a consent dialog and make analytics opt-out-able
		AngularFireRemoteConfigModule,
		// AngularFireMessagingModule,
		// AngularFireStorageModule,
		BrowserAnimationsModule,
		FormsModule,
		ReactiveFormsModule,
		HttpClientModule,
		FlexLayoutModule,
		MatTableModule,
		MatToolbarModule,
		MatSidenavModule,
		MatCardModule,
		MatInputModule,
		MatSelectModule,
		MatButtonModule,
		MatChipsModule,
		MatTooltipModule,
		MatIconModule,
		MatListModule,
		MatRippleModule,
		MatExpansionModule,
		MatSnackBarModule,
		AppRoutingModule,
		MatCheckboxModule,
		MatSlideToggleModule,
		MatDialogModule,
		HammerModule,
		MatProgressSpinnerModule
	],
	providers: [
		AuthService,
		{
			provide: HAMMER_GESTURE_CONFIG,
			useClass: MyHammerConfig,
		},
		{ provide: DEFAULTS, useValue: { maintance: false } },
		{
			provide: SETTINGS,
			useFactory: () => isDevMode() ? { minimumFetchIntervalMillis: 10_000 } : {}
		},	
		CookieService,
		ScreenTrackingService,
		UserTrackingService
	],
	bootstrap: [AppComponent]
})
export class AppModule { 
	constructor(
		private remoteConfig: AngularFireRemoteConfig,
		private as: AuthService,
		private ns: NotificationService	
	) {
		remoteConfig.booleans.maintance.subscribe((maintance) => {
			if (maintance) {
				this.as.maintanceMode()
				this.ns.show('Shopairs is under maintenance. You can not log in now. Come back later', '', {duration: 10000})
			}

			(maintance && !isDevMode())? this.as.lock() : this.as.unlock()

		})
	}
}  bootstrap: [AppComponent]
