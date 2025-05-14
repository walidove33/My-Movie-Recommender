// src/app/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  credentials = { username: '', password: '' };
  errorMessage = '';
  redirectUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Handle redirect URL
    this.route.queryParamMap.subscribe(params => {
      this.redirectUrl = params.get('redirect');
    });

    // Handle fragment scroll
    this.route.fragment.subscribe(fragment => {
      if (fragment === 'login-form') {
        setTimeout(() => {
          const element = document.getElementById('login-form');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    });
  }

  onSubmit() {
    this.errorMessage = '';
    this.authService.login(this.credentials).subscribe({
      next: (response: any) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', this.credentials.username);
        
        // Handle redirect after login
        const redirect = this.redirectUrl || '/home';
        this.router.navigateByUrl(redirect);
      },
      error: err => {
        console.error('Login error', err);
        this.handleError(err);
      }
    });
  }

  private handleError(err: any) {
    if (err.status === 0) {
      this.errorMessage = 'Unable to connect to the server';
    } else if (err.status === 401) {
      this.errorMessage = 'Invalid username or password';
    } else {
      this.errorMessage = `Login failed (${err.status}): ${err.error?.message || 'Unknown error'}`;
    }
  }
}