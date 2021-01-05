import { AuthService } from './core/services/auth.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'Shopairs';
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  
  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    public router: Router,
    ){
    this.mobileQuery = media.matchMedia('(max-width: 990px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  drawer(): boolean {
    return [
      '/lists',
      '/settings',
      '/pair'
    ].includes(this.router.url)
  }

  swipeEv(e:any) {
    console.log('SWIPE')
  }
}
