import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

interface User {
  name: string;
  email: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  currentUser: User | null = null;
  isLoggedIn = false;
  currentTitle = 'Ana Sayfa';
  showProductSelector = false;

  ngOnInit(): void {
    // Check authentication status
    this.checkAuthStatus();

    // Listen for route changes to update title and product selector visibility
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateTitleAndProductSelector(event.url);
      }
    });

    // Initial title and product selector setup
    this.updateTitleAndProductSelector(this.router.url);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkAuthStatus(): void {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        this.currentUser = JSON.parse(userData);
        this.isLoggedIn = true;
      } catch (e) {
        this.logout();
      }
    }
  }

  private updateTitleAndProductSelector(url: string): void {
    // Update title based on current route
    if (url.includes('/admin/products/') && url.split('/').length > 3) {
      this.currentTitle = 'Ürünler / Ürün Detayı';
      this.showProductSelector = true;
    } else if (url.includes('/admin/products')) {
      this.currentTitle = 'Ürünler';
      this.showProductSelector = false;
    } else if (url.includes('/admin')) {
      this.currentTitle = 'Ana Sayfa';
      this.showProductSelector = false;
    } else {
      this.currentTitle = 'Ürün Yönetim Sistemi';
      this.showProductSelector = false;
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUser = null;
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }

  onProductSelect(productId: string): void {
    // Navigate to product detail page
    this.router.navigate(['/admin/products', productId]);
  }
}
