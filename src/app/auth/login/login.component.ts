import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMessage = '';

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      // TODO: Implement actual login logic
      setTimeout(() => {
        // Mock login - in real app, this would be an API call
        if (this.loginForm.value.email && this.loginForm.value.password) {
          // Store user info in localStorage for demo purposes
          localStorage.setItem('currentUser', JSON.stringify({
            name: 'Demo User',
            email: this.loginForm.value.email
          }));
          this.router.navigate(['/admin']);
        } else {
          this.errorMessage = 'Geçersiz email veya şifre';
        }
        this.isLoading = false;
      }, 1000);
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.touched && field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} alanı zorunludur`;
      }
      if (field.errors['email']) {
        return 'Geçerli bir email adresi giriniz';
      }
      if (field.errors['minlength']) {
        return `${fieldName} alanı en az ${field.errors['minlength'].requiredLength} karakter olmalıdır`;
      }
    }
    return '';
  }
}
