import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, Product } from '../../shared/services/product.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private productService = inject(ProductService);
  private authService = inject(AuthService);

  // Signals for reactive state
  products = signal<Product[]>([]);
  totalProducts = signal<number>(0);
  isLoading = signal<boolean>(false);
  currentUser = this.authService.currentUser;

  // Computed values for template
  activeProductsCount = signal<number>(0);
  lowStockProductsCount = signal<number>(0);
  categoryCount = signal<number>(0);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);

    // Subscribe to products changes
    this.productService.products$.subscribe(products => {
      this.products.set(products);
      this.totalProducts.set(products.length);

      // Update computed values
      this.activeProductsCount.set(products.filter(p => p.isActive).length);
      this.lowStockProductsCount.set(products.filter(p => p.stock <= 10).length);
      this.categoryCount.set(new Set(products.map(p => p.category).filter(Boolean)).size);

      this.isLoading.set(false);
    });

    // Load products if not already loaded
    if (this.productService.products().length === 0) {
      this.productService.getProducts().subscribe();
    }
  }

  navigateToProducts(): void {
    // Navigation will be handled by routerLink in template
  }
}
