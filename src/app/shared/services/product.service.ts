import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of, Subject } from 'rxjs';
import { catchError, map, tap, takeUntil } from 'rxjs/operators';
import { API_BASE_URL } from '../../core/core.module';

export interface ProductColor {
  id?: number;
  name: string;
  hexCode: string;
  price?: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  stock: number;
  colors?: ProductColor[];
  imageUrl?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductCreateRequest {
  name: string;
  description?: string;
  price: number;
  category?: string;
  stock: number;
  colors?: Omit<ProductColor, 'id'>[];
  imageUrl?: string;
  isActive: boolean;
}

export interface ProductUpdateRequest extends ProductCreateRequest {
  id: number;
}

export interface ProductListResponse {
  products: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiBaseUrl = inject(API_BASE_URL);

  // Signals for reactive state management
  private productsSignal = signal<Product[]>([]);
  private selectedProductSignal = signal<Product | null>(null);
  private isLoadingSignal = signal<boolean>(false);
  private totalCountSignal = signal<number>(0);

  // BehaviorSubjects for components that need observables
  private productsSubject = new BehaviorSubject<Product[]>([]);
  private selectedProductSubject = new BehaviorSubject<Product | null>(null);

  // Public observables
  public products$ = this.productsSubject.asObservable();
  public selectedProduct$ = this.selectedProductSubject.asObservable();

  // Public signals
  public products = this.productsSignal.asReadonly();
  public selectedProduct = this.selectedProductSignal.asReadonly();
  public isLoading = this.isLoadingSignal.asReadonly();
  public totalCount = this.totalCountSignal.asReadonly();

  private destroy$ = new Subject<void>();

  constructor() {
    // Initialize with some mock data for demo purposes
    this.loadMockProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMockProducts(): void {
    const mockProducts: Product[] = [
      {
        id: 1,
        name: 'iPhone 15 Pro',
        description: 'Apple iPhone 15 Pro akıllı telefon',
        price: 45000,
        category: 'Elektronik',
        stock: 50,
        colors: [
          { id: 1, name: 'Uzay Siyahı', hexCode: '#1a1a1a', price: 45000 },
          { id: 2, name: 'Doğal Titanyum', hexCode: '#8e8e93', price: 46000 },
          { id: 3, name: 'Beyaz Titanyum', hexCode: '#f5f5f7', price: 46000 },
          { id: 4, name: 'Mavi Titanyum', hexCode: '#5ac8fa', price: 47000 }
        ],
        imageUrl: 'https://example.com/iphone15pro.jpg',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Samsung Galaxy S24',
        description: 'Samsung Galaxy S24 akıllı telefon',
        price: 35000,
        category: 'Elektronik',
        stock: 30,
        colors: [
          { id: 5, name: 'Phantom Black', hexCode: '#000000', price: 35000 },
          { id: 6, name: 'Phantom Violet', hexCode: '#7c3aed', price: 36000 },
          { id: 7, name: 'Phantom Silver', hexCode: '#c0c0c0', price: 36000 }
        ],
        imageUrl: 'https://example.com/galaxy24.jpg',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        name: 'MacBook Pro 16"',
        description: 'Apple MacBook Pro 16 inç dizüstü bilgisayar',
        price: 85000,
        category: 'Bilgisayar',
        stock: 15,
        colors: [
          { id: 8, name: 'Uzay Grisi', hexCode: '#939396', price: 85000 },
          { id: 9, name: 'Gümüş', hexCode: '#f5f5f7', price: 86000 }
        ],
        imageUrl: 'https://example.com/macbook16.jpg',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    this.productsSignal.set(mockProducts);
    this.productsSubject.next(mockProducts);
    this.totalCountSignal.set(mockProducts.length);
  }

  // Get all products with pagination and filtering
  getProducts(page: number = 1, pageSize: number = 10, search?: string, category?: string): Observable<ProductListResponse> {
    this.isLoadingSignal.set(true);

    // For demo purposes, we'll simulate API delay
    return of({
      products: this.productsSignal(),
      totalCount: this.totalCountSignal(),
      page,
      pageSize
    }).pipe(
      tap(response => {
        this.productsSignal.set(response.products);
        this.productsSubject.next(response.products);
        this.totalCountSignal.set(response.totalCount);
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return throwError(() => new Error('Ürünler yüklenirken hata oluştu'));
      })
    );
  }

  // Get product by ID
  getProductById(id: number): Observable<Product> {
    this.isLoadingSignal.set(true);

    const product = this.productsSignal().find(p => p.id === id);

    if (product) {
      return of(product).pipe(
        tap(p => {
          this.selectedProductSignal.set(p);
          this.selectedProductSubject.next(p);
          this.isLoadingSignal.set(false);
        }),
        catchError(error => {
          this.isLoadingSignal.set(false);
          return throwError(() => new Error('Ürün bulunamadı'));
        })
      );
    } else {
      this.isLoadingSignal.set(false);
      return throwError(() => new Error('Ürün bulunamadı'));
    }
  }

  // Create new product
  createProduct(productData: ProductCreateRequest): Observable<Product> {
    this.isLoadingSignal.set(true);

    // For demo purposes, we'll simulate API delay and create a new product
    const newProduct: Product = {
      id: Date.now(),
      ...productData,
      colors: productData.colors?.map((color, index) => ({ ...color, id: Date.now() + index })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return of(newProduct).pipe(
      tap(product => {
        const currentProducts = this.productsSignal();
        const updatedProducts = [...currentProducts, product];
        this.productsSignal.set(updatedProducts);
        this.productsSubject.next(updatedProducts);
        this.totalCountSignal.set(updatedProducts.length);
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return throwError(() => new Error('Ürün oluşturulurken hata oluştu'));
      })
    );
  }

  // Update existing product
  updateProduct(productData: ProductUpdateRequest): Observable<Product> {
    this.isLoadingSignal.set(true);

    const currentProducts = this.productsSignal();
    const productIndex = currentProducts.findIndex(p => p.id === productData.id);

    if (productIndex === -1) {
      this.isLoadingSignal.set(false);
      return throwError(() => new Error('Güncellenecek ürün bulunamadı'));
    }

    const updatedProduct: Product = {
      ...currentProducts[productIndex],
      ...productData,
      colors: productData.colors?.map((color, index) => ({
        ...color,
        id: currentProducts[productIndex].colors?.[index]?.id || Date.now() + index
      })),
      updatedAt: new Date().toISOString()
    };

    return of(updatedProduct).pipe(
      tap(product => {
        const updatedProducts = [...currentProducts];
        updatedProducts[productIndex] = product;
        this.productsSignal.set(updatedProducts);
        this.productsSubject.next(updatedProducts);

        // Update selected product if it's the same
        if (this.selectedProductSignal()?.id === product.id) {
          this.selectedProductSignal.set(product);
          this.selectedProductSubject.next(product);
        }

        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return throwError(() => new Error('Ürün güncellenirken hata oluştu'));
      })
    );
  }

  // Delete product
  deleteProduct(id: number): Observable<void> {
    this.isLoadingSignal.set(true);

    const currentProducts = this.productsSignal();
    const productExists = currentProducts.some(p => p.id === id);

    if (!productExists) {
      this.isLoadingSignal.set(false);
      return throwError(() => new Error('Silinecek ürün bulunamadı'));
    }

    return of(void 0).pipe(
      tap(() => {
        const updatedProducts = currentProducts.filter(p => p.id !== id);
        this.productsSignal.set(updatedProducts);
        this.productsSubject.next(updatedProducts);
        this.totalCountSignal.set(updatedProducts.length);

        // Clear selected product if it was deleted
        if (this.selectedProductSignal()?.id === id) {
          this.selectedProductSignal.set(null);
          this.selectedProductSubject.next(null);
        }

        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return throwError(() => new Error('Ürün silinirken hata oluştu'));
      })
    );
  }

  // Set selected product
  setSelectedProduct(product: Product | null): void {
    this.selectedProductSignal.set(product);
    this.selectedProductSubject.next(product);
  }

  // Clear selected product
  clearSelectedProduct(): void {
    this.setSelectedProduct(null);
  }

  // Get products by category
  getProductsByCategory(category: string): Observable<Product[]> {
    const products = this.productsSignal().filter(p => p.category === category);
    return of(products);
  }

  // Search products
  searchProducts(query: string): Observable<Product[]> {
    const products = this.productsSignal().filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description?.toLowerCase().includes(query.toLowerCase()) ||
      p.category?.toLowerCase().includes(query.toLowerCase())
    );
    return of(products);
  }
}
