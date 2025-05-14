
// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { JwtHelperService } from '@auth0/angular-jwt';
// import { Observable, BehaviorSubject } from 'rxjs';
// import { tap } from 'rxjs/operators';

// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private apiUrl = 'http://localhost:8090/account';
//   private profilePictureSubject = new BehaviorSubject<string | null>(null);
//   profilePicture$ = this.profilePictureSubject.asObservable();

//   constructor(
//     private http: HttpClient,
//     private router: Router,
//     public jwtHelper: JwtHelperService
//   ) {
//     // Load profile picture from localStorage on init
//     const savedPicture = localStorage.getItem('profilePicture');
//     if (savedPicture) {
//       this.profilePictureSubject.next(savedPicture);
//     }
//   }

//   login(credentials: { username: string; password: string }) {
//     return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
//       tap((response: any) => {
//         if (response.profilePicture) {
//           this.setProfilePicture(response.profilePicture);
//         }
//       })
//     );
//   }

//   register(userData: any) {
//     return this.http.post(`${this.apiUrl}/register`, userData);
//   }

//   logout() {
//     localStorage.removeItem('token');
//     localStorage.removeItem('profilePicture');
//     this.profilePictureSubject.next(null);
//     this.router.navigate(['/login']);
//   }

//   isAuthenticated(): boolean {
//     const token = this.getToken();
//     if (!token || this.jwtHelper.isTokenExpired(token)) {
//       this.logout();
//       return false;
//     }
//     return true;
//   }

//   getToken(): string | null {
//     return localStorage.getItem('token');
//   }

//   getUserId(): number | null {
//     const token = this.getToken();
//     if (!token) return null;
//     const decoded: any = this.jwtHelper.decodeToken(token);
//     return decoded.userId || null;
//   }

//   getUserName(): string {
//     const token = this.getToken();
//     if (token) {
//       const decoded: any = this.jwtHelper.decodeToken(token);
//       return decoded.userName || decoded.sub || 'Account';
//     }
//     return 'Account';
//   }

//   getProfile(): Observable<any> {
//     return this.http.get(`${this.apiUrl}/profile`).pipe(
//       tap((response: any) => {
//         if (response.User?.profilePicture) {
//           this.setProfilePicture(response.User.profilePicture);
//         }
//       })
//     );
//   }

//   updateProfile(formData: FormData) {
//     const token = this.getToken();
//     const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    
//     return this.http.put(`${this.apiUrl}/profile`, formData, { headers }).pipe(
//       // tap((response: any) => {
//       //   if (response.profilePicture) {
//       //     this.setProfilePicture(response.profilePicture);
//       //   }
//       tap((response: any) => {
//         // response.profilePictureUrl from back‑end
//         const url = response.profilePictureUrl || response.User?.profilePictureUrl;
//         if (url) {
//           this.setProfilePicture(url);
//         }
//       })
//     );
//   }

//   setProfilePicture(url: string) {
//     localStorage.setItem('profilePicture', url);
//     this.profilePictureSubject.next(url);
//   }

//   getProfilePicture(): string | null {
//     return this.profilePictureSubject.getValue();
//   }
// }



import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8090/account';
  private profilePictureSubject = new BehaviorSubject<string | null>(null);
  profilePicture$ = this.profilePictureSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    public jwtHelper: JwtHelperService
  ) {
    // Charger la photo de profil depuis le localStorage
    const savedPicture = localStorage.getItem('profilePicture');
    if (savedPicture) {
      this.profilePictureSubject.next(savedPicture);
    }
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<{ token: string; user: any; profilePicture?: string }>(
      `${this.apiUrl}/login`,
      credentials
    ).pipe(
      tap(response => {
        // Stocker le token JWT
        localStorage.setItem('token', response.token);
        // Stocker la photo de profil si présente
        if (response.profilePicture) {
          this.setProfilePicture(response.profilePicture);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<{ token: string; user: any }>(
      `${this.apiUrl}/register`,
      userData
    ).pipe(
      tap(response => {
        // Stocker le token JWT
        localStorage.setItem('token', response.token);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('profilePicture');
    this.profilePictureSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token || this.jwtHelper.isTokenExpired(token)) {
      this.logout();
      return false;
    }
    return true;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded: any = this.jwtHelper.decodeToken(token);
    return decoded.userId || null;
  }

  getUserName(): string {
    const token = this.getToken();
    if (token) {
      const decoded: any = this.jwtHelper.decodeToken(token);
      return decoded.sub || decoded.username || 'Account';
    }
    return 'Account';
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`).pipe(
      tap(response => {
        if (response.profilePicture) {
          this.setProfilePicture(response.profilePicture);
        }
      })
    );
  }

  updateProfile(formData: FormData): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.put<any>(`${this.apiUrl}/profile`, formData, { headers }).pipe(
      tap(response => {
        const url = response.profilePictureUrl || response.profilePicture;
        if (url) {
          this.setProfilePicture(url);
        }
      })
    );
  }

  setProfilePicture(url: string) {
    localStorage.setItem('profilePicture', url);
    this.profilePictureSubject.next(url);
  }

  getProfilePicture(): string | null {
    return this.profilePictureSubject.getValue();
  }
}
