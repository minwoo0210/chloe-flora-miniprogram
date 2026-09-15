import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { StoreService } from '@/store/store.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly store: StoreService) {}

  @Get('categories')
  async categories() {
    return { status: 'success', data: await this.store.listCategories() };
  }

  @Get('products')
  async products(@Query('categoryId') categoryId?: string) {
    const id = categoryId ? Number(categoryId) : undefined;
    return { status: 'success', data: await this.store.listProducts(id) };
  }

  @Get('products/:id')
  async product(@Param('id', ParseIntPipe) id: number) {
    return { status: 'success', data: await this.store.getProduct(id) };
  }
}