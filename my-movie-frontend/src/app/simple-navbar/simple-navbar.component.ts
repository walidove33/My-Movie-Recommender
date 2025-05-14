import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-simple-navbar',
  standalone: true,
  imports: [RouterModule],
  template: `
    <nav class="navbar navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand" routerLink="/">
          <span class="logo-text">My<span class="text-primary">Movie</span></span>
        </a>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      padding: 1rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .logo-text {
      font-weight: 600;
      font-size: 1.5rem;
    }
    .text-primary {
      color: #e5b80b;
    }
  `]
})
export class SimpleNavbarComponent {}