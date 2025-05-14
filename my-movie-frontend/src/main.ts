import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './app/header/header.component';
import { NavbarComponent } from './app/navbar/navbar.component';
import { HomeComponent } from './app/home/home.component';
import { AuthService } from './app/service/auth.service';
import { filter } from 'rxjs/operators';

export function tokenGetter() { 
  return localStorage.getItem('token'); 
}




@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    HeaderComponent,
    HomeComponent
  ],
  template: `
    <div class="app-wrapper">
      <!-- Show different header for auth pages -->
      <div *ngIf="isAuthPage()" class="auth-header">
        <div class="container">
          <a href="/" class="brand">
            <i class="bi bi-film"></i>
            MyMovie
          </a>
        </div>
      </div>

      <!-- Show navbar for authenticated pages -->
      <app-navbar *ngIf="!isAuthPage() && authService.isAuthenticated()"></app-navbar>
      <app-header *ngIf="!isAuthPage() && !isMovieDetails && authService.isAuthenticated()"></app-header>

      <main [class.auth-main]="isAuthPage()" [class.movie-details-main]="isMovieDetails">
        <router-outlet></router-outlet>
      </main>

      <footer class="footer" [class.movie-details-footer]="isMovieDetails">
        <div class="container">
          <div class="footer-content">
            <div class="footer-brand">
              <h3><i class="bi bi-film"></i> MyMovie</h3>
              <p>Your ultimate movie companion. Discover, track, and enjoy the best of cinema.</p>
              <div class="social-links">
                <a href="#"><i class="bi bi-facebook"></i></a>
                <a href="https://www.linkedin.com/in/walid-benabbes-1684ab21a/" target="_blank"><i class="bi bi-linkedin"></i></a>
                <a href="#"><i class="bi bi-instagram"></i></a>
                <a href="#"><i class="bi bi-youtube"></i></a>
                
              </div>
            </div>

            <div class="footer-links">
            <div class="link-group">
  <h4>Explore</h4>
  <ul>
    <li><a routerLink="/home" fragment="top-rated">Top Rated Movies</a></li>
    <li><a routerLink="/home" fragment="recommended">Recommended For You</a></li>
    <li><a routerLink="/home" fragment="recommendedonwatched">Based on Your Watched</a></li>
    <li><a routerLink="/home" fragment="all-movies">All Movies</a></li>
  </ul>
</div>

              <div class="link-group">
                <h4>Account</h4>
                <ul>
                  <li><a routerLink="/profile">Profile</a></li>
                  <li><a routerLink="/to-watch">Watchlist</a></li>
                  <li><a routerLink="/watched">Watched</a></li>
                  <li><a routerLink="/settings">Settings</a></li>
                </ul>
              </div>

              <div class="link-group">
                <h4>Newsletter</h4>
                <p>Stay updated with the latest movies and features</p>
                <div class="newsletter-form">
                  <input type="email" placeholder="Your email address">
                  <button><i class="bi bi-send"></i></button>
                </div>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            <p>&copy; 2025 MyMovie. All rights reserved.</p>
            <div class="legal-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: #0a0a0f;
    }

    .auth-header {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      padding: 1rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .brand {
      color: #fff;
      text-decoration: none;
      font-size: 1.5rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .brand i {
      color: #ff3d71;
    }

    main {
      flex: 1;
    }

    .auth-main {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    }

    .movie-details-main {
      padding-top: 0;
      background: #0a0a0f;
    }

    .footer {
      background: #0f0f17;
      color: #fff;
      padding: 4rem 0 1.5rem;
      margin-top: 4rem;
    }

    .movie-details-footer {
      margin-top: 0;
      background: linear-gradient(to top, #0f0f17 0%, rgba(15, 15, 23, 0.8) 100%);
    }

    .footer-content {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 4rem;
      margin-bottom: 3rem;
    }

    .footer-brand h3 {
      font-size: 1.75rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .footer-brand i {
      color: #ff3d71;
    }

    .footer-brand p {
      color: #9ca3af;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .social-links {
      display: flex;
      gap: 1rem;
    }

    .social-links a {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      font-size: 1.25rem;
      transition: all 0.3s ease;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
    }

    .social-links a:hover {
      color: #ff3d71;
      transform: translateY(-2px);
      background: rgba(255, 61, 113, 0.1);
    }

    .footer-links {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }

    .link-group h4 {
      color: #fff;
      font-size: 1.1rem;
      margin-bottom: 1.25rem;
      position: relative;
      padding-bottom: 0.75rem;
    }

    .link-group h4::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 30px;
      height: 2px;
      background: #ff3d71;
      border-radius: 2px;
    }

    .link-group ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .link-group li {
      margin-bottom: 0.75rem;
    }

    .link-group a {
      color: #9ca3af;
      text-decoration: none;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .link-group a:hover {
      color: #ff3d71;
      transform: translateX(4px);
    }

    .newsletter-form {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .newsletter-form input {
      flex: 1;
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: #fff;
      transition: all 0.3s ease;
    }

    .newsletter-form input:focus {
      outline: none;
      border-color: #ff3d71;
      background: rgba(255, 255, 255, 0.1);
    }

    .newsletter-form button {
      background: #ff3d71;
      color: #fff;
      border: none;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .newsletter-form button:hover {
      background: #ff2661;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 38, 97, 0.3);
    }

    .footer-bottom {
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-bottom p {
      color: #9ca3af;
      margin: 0;
    }

    .legal-links {
      display: flex;
      gap: 2rem;
    }

    .legal-links a {
      color: #9ca3af;
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.3s ease;
    }

    .legal-links a:hover {
      color: #ff3d71;
    }

    @media (max-width: 992px) {
      .footer-content {
        grid-template-columns: 1fr;
        gap: 3rem;
      }

      .footer-links {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .footer-bottom {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .legal-links {
        justify-content: center;
        flex-wrap: wrap;
      }
    }

    @media (max-width: 480px) {
      .footer-links {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .footer {
        padding: 3rem 0 1rem;
      }
    }
  `]
})
export class AppComponent {
  isMovieDetails = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isMovieDetails = event.url.includes('/movies/');
    });
  }

  isAuthPage(): boolean {
    return window.location.pathname.includes('/login') || 
           window.location.pathname.includes('/register');
  }
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      HttpClientModule,
      JwtModule.forRoot({
        config: { tokenGetter, allowedDomains: ['localhost:8090'] }
      })
    )
  ]
}).catch(err => console.error(err));
