import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { environment } from '../envirenoment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  };
  
  profilePicture: string | null = null;
  fileToUpload: File | null = null;
  errorMessage = '';
  successMessage = '';

  constructor(private auth: AuthService, private router: Router) {
    this.auth.profilePicture$.subscribe(url => {
      this.profilePicture = url;
    });
  }

  ngOnInit() {
    this.auth.getProfile().subscribe({
      next: res => {
        const user = res.User;
        this.profile.firstName = user.firstName;
        this.profile.lastName = user.lastName;
        this.profile.email = user.email;
        this.profile.phone = user.phone;
        this.profile.address = user.address;
        if (user.profilePictureUrl) {
          this.auth.setProfilePicture(`${environment.apiUrl}/${user.profilePictureUrl}`);
        }
      },
      error: () => {
        this.errorMessage = 'Could not load profile';
      }
    });
  }

  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.fileToUpload = input.files[0];
      
      // Preview the image
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePicture = e.target?.result as string;
      };
      reader.readAsDataURL(this.fileToUpload);
    }
  }

  // onSubmit() {
  //   this.errorMessage = this.successMessage = '';

  //   const formData = new FormData();
  //   formData.append('firstName', this.profile.firstName);
  //   formData.append('lastName', this.profile.lastName);
  //   formData.append('email', this.profile.email);
  //   formData.append('phone', this.profile.phone);
  //   formData.append('address', this.profile.address);
  //   if (this.fileToUpload) {
  //     formData.append('profilePicture', this.fileToUpload);
  //   }

  //   this.auth.updateProfile(formData).subscribe({
  //     next: () => {
  //       this.successMessage = 'Profile updated successfully';
  //     },
  //     error: err => {
  //       if (typeof err.error === 'object') {
  //         this.errorMessage = Object.values(err.error).join(', ');
  //       } else {
  //         this.errorMessage = err.error || 'Update failed';
  //       }
  //     }
  //   });
  // }

  onSubmit() {
  this.errorMessage = this.successMessage = '';

  const formData = new FormData();
  formData.append('firstName', this.profile.firstName);
  formData.append('lastName', this.profile.lastName);
  formData.append('email', this.profile.email);
  formData.append('phone', this.profile.phone);
  formData.append('address', this.profile.address);
  if (this.fileToUpload) {
    formData.append('profilePicture', this.fileToUpload);
  }

  this.auth.updateProfile(formData).subscribe({
    next: () => {
      this.successMessage = 'Profile updated successfully';
      
      // Reload profile data to reflect changes
      this.auth.getProfile().subscribe({
        next: (res) => {
          const user = res.User;
          // Update local profile data
          this.profile.firstName = user.firstName;
          this.profile.lastName = user.lastName;
          this.profile.email = user.email;
          this.profile.phone = user.phone;
          this.profile.address = user.address;
          
          // Update profile picture with latest URL
          if (user.profilePictureUrl) {
            this.auth.setProfilePicture(`${environment.apiUrl}${user.profilePictureUrl}`);
          }
        },
        error: () => {
          this.errorMessage = 'Profile updated but failed to refresh data';
        }
      });
    },
    error: err => {
      if (typeof err.error === 'object') {
        this.errorMessage = Object.values(err.error).join(', ');
      } else {
        this.errorMessage = err.error || 'Update failed';
      }
    }
  });
}
}