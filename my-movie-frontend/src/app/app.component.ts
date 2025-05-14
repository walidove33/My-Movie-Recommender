import { Component } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { SimpleNavbarComponent } from './simple-navbar/simple-navbar.component';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    SimpleNavbarComponent,
    RouterOutlet,
    HeaderComponent
  ],
  template: `
    <app-simple-navbar *ngIf="showSimpleNavbar"></app-simple-navbar>
    <app-navbar *ngIf="!showSimpleNavbar"></app-navbar>
    <app-header></app-header>
    <div class="container mt-4">
      <router-outlet></router-outlet>
    </div>
  `,
  
})
export class AppComponent {
  showSimpleNavbar = false;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showSimpleNavbar = this.isAuthPage(event.url);
      }
    });
  }

  private isAuthPage(url: string): boolean {
    return url.includes('/login') || url.includes('/register');
  }


  navigateWithFragment(path: string, fragment: string) {
    if (this.router.url === '/home') {
      // Already on home, just scroll
      document.getElementById(fragment)?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    } else {
      this.router.navigate([path], { fragment }).then(() => {
        document.getElementById(fragment)?.scrollIntoView({
          behavior: 'smooth'
        });
      });
    }
  }
}