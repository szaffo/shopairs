import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatRippleModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { ListsComponent } from './lists/lists.component';
import { NewButtonComponent, CreateListDialog } from './new-button/new-button.component';
import { SettingsComponent } from './settings/settings.component';
import { PairComponent } from './pair/pair.component';
import { ListComponent } from './lists/list/list.component';
import { ItemComponent } from './lists/list/item/item.component';
// import { MatDialogModule } from '@angular/material/dialog';
// import { SettingsComponent } from './settings/settings.component';
// import { ProfileComponent } from './profile/profile.component';
// import { IssuesComponent } from './issues/issues.component';
// 	import { IssueComponent } from './issues/issue/issue.component';
// import { AddIssueComponent } from './issues/add-issue/add-issue.component';
// import { LoginComponent } from './login/login.component';
	//import { IssueDialogComponent } from './issues/issue/issue.component';

@NgModule({
	declarations: [
		AppComponent,
		MenuComponent,
		ListsComponent,
			ListComponent,
				ItemComponent,
		NewButtonComponent,
		CreateListDialog,
		SettingsComponent,
		PairComponent
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		FormsModule,
		ReactiveFormsModule,
		HttpClientModule,
		FlexLayoutModule,
		MatToolbarModule,
		MatSidenavModule,
		MatCardModule,
		MatInputModule,
		MatSelectModule,
		MatButtonModule,
		MatChipsModule,
		MatTooltipModule,
		MatDialogModule,
		MatIconModule,
		MatListModule,
		MatRippleModule,
		MatExpansionModule,
		MatSnackBarModule,
		AppRoutingModule,
		MatCheckboxModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }  bootstrap: [AppComponent]
