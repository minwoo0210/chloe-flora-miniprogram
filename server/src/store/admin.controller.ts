import { Controller, Get } from '@nestjs/common';
import { StoreService } from './store.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly store: StoreService) {}

  @Get('overview')
  async overview() {
    const data = await this.store.adminOverview();
    return { status: 'success', data };
  }

  @Get('categories')
  async categories() {
    const data = await this.store.listCategories();
    return { status: 'success', data };
  }

  @Get('products')
  async products() {
    const data = await this.store.listProducts();
    return { status: 'success', data };
  }

  @Get('orders')
  async orders() {
    const data = await this.store.listAllOrders();
    return { status: 'success', data };
  }
}