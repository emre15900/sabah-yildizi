import { NgModule, InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreRoutingModule } from './core-routing.module';

// API Configuration Token
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

// API Configuration Interface
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

// Default API Configuration
export const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: 'https://northwind.vercel.app/api',
  timeout: 10000
};


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CoreRoutingModule
  ],
  providers: [
    {
      provide: API_BASE_URL,
      useValue: DEFAULT_API_CONFIG.baseUrl
    }
  ]
})
export class CoreModule { }
