import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./products/products.component').then(m => m.ProductsComponent)
  },
  {
    path: 'products/create',
    loadComponent: () => import('./product-create/product-create.component').then(m => m.ProductCreateComponent)
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'products/:id/edit',
    loadComponent: () => import('./product-edit/product-edit.component').then(m => m.ProductEditComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
