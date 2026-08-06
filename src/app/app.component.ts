import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BaseToastHostComponent } from './base';

@Component({
  selector: 'fam-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, BaseToastHostComponent],
  template: `
    <router-outlet />
    <base-toast-host />
  `
})
export class AppComponent {}
