import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* import { LoginComponent } from './login/login.component';
import { IssuesComponent } from './issues/issues.component'; */
import { ListsComponent } from './lists/lists.component'

const routes: Routes = [
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{ path: 'home', component: ListsComponent}
	// { path: 'login', component: LoginComponent },
	// { path: 'issues/open', component: IssuesComponent },
	// { path: 'issues/closed', component: IssuesComponent },
	// { path: '**', redirectTo: 'issues/open', pathMatch: 'full' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
