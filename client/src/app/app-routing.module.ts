import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { SettingsComponent } from './settings/settings.component';
import { ListsComponent } from './lists/lists.component'
import { PairComponent } from './pair/pair.component'

const routes: Routes = [
	{ path: '', redirectTo: 'lists', pathMatch: 'full' },
	{ path: 'lists', component: ListsComponent},
	{ path: 'settings', component: SettingsComponent },
	{ path: 'pair', component: PairComponent },
	// { path: 'issues/open', component: IssuesComponent },
	// { path: 'issues/closed', component: IssuesComponent },
	// { path: '**', redirectTo: 'issues/open', pathMatch: 'full' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
