import { Controller, Get, Param, Query } from '@nestjs/common';
import { StoreService } from '@/store/store.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly store: StoreService) {}

  @Get('categories')
  async categories() {
    return { status: 'success', data: await this.store.listCategories() };
  }

  @Get('products')
  async products(@Query('categorySlug') categorySlug?: string) {
    return { status: 'success', data: await this.store.listProducts(categorySlug) };
  }

  @Get('products/:id')
  async product(@Param('id') id: string) {
    return { status: 'success', data: await this.store.getProduct(id) };
  }

  @Get('home')
  async home() {
    return { status: 'success', data: await this.store.getHome() };
  }

  @Get('theme')
  async theme() {
    return { status: 'success', data: await this.store.getTheme() };
  }
}