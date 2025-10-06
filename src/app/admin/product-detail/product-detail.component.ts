import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProductService, Product, ProductColor } from '../../shared/services/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  product: Product | null = null;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(+productId);
    } else {
      this.errorMessage = 'Geçersiz ürün ID';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProduct(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Ürün yüklenirken hata oluştu';
        this.isLoading = false;
        console.error('Ürün yükleme hatası:', error);
      }
    });
  }

  navigateToEdit(): void {
    if (this.product) {
      this.router.navigate(['/admin/products', this.product.id, 'edit']);
    }
  }

  navigateToProducts(): void {
    this.router.navigate(['/admin/products']);
  }

  deleteProduct(): void {
    if (this.product && confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      this.productService.deleteProduct(this.product.id).subscribe({
        next: () => {
          this.router.navigate(['/admin/products']);
        },
        error: (error) => {
          console.error('Ürün silme hatası:', error);
          alert('Ürün silinirken hata oluştu');
        }
      });
    }
  }

  getTotalColorPrice(colors: ProductColor[]): number {
    return colors.reduce((total, color) => total + (color.price || 0), 0);
  }
}
