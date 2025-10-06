import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ProductService, Product } from '../../shared/services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // Signals for reactive state
  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  isLoading = signal<boolean>(false);
  searchQuery = signal<string>('');

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  ngOnInit(): void {
    this.loadProducts();

    // Subscribe to products changes
    this.productService.products$.pipe(takeUntil(this.destroy$)).subscribe(products => {
      this.products.set(products);
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProducts(): void {
    this.isLoading.set(true);
    this.productService.getProducts(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.totalItems = response.totalCount;
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Ürünler yüklenirken hata:', error);
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    const query = this.searchQuery().toLowerCase();
    const allProducts = this.products();

    if (!query) {
      this.filteredProducts.set(allProducts);
    } else {
      const filtered = allProducts.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
      this.filteredProducts.set(filtered);
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  navigateToCreate(): void {
    this.router.navigate(['/admin/products/create']);
  }

  navigateToEdit(productId: number): void {
    this.router.navigate(['/admin/products', productId, 'edit']);
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/admin/products', productId]);
  }

  deleteProduct(productId: number): void {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          console.log('Ürün başarıyla silindi');
        },
        error: (error) => {
          console.error('Ürün silinirken hata:', error);
          alert('Ürün silinirken hata oluştu');
        }
      });
    }
  }

  // Pagination helpers
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get pages(): number[] {
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    const pages: number[] = [];

    // Show max 5 pages around current page
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }
}
