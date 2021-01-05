import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AngularFireAuthGuard } from '@angular/fire/auth-guard';


import { SettingsComponent } from './settings/settings.component';
import { ListsComponent } from './lists/lists.component'
import { PairComponent } from './pair/pair.component'

const routes: Routes = [
	{ path: 'lists', component: ListsComponent, canActivate: [AngularFireAuthGuard]},
	{ path: 'settings', component: SettingsComponent, canActivate: [AngularFireAuthGuard]},
	{ path: 'pair', component: PairComponent, canActivate: [AngularFireAuthGuard] },
	{ path: 'register', component: LoginComponent},
	{ path: 'login', component: LoginComponent},
	{ path: '', component: LandingComponent},
	{ path: '**', redirectTo: '/login', pathMatch: 'full'}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
