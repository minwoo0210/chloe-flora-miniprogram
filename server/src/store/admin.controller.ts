import { Controller, Get } from '@nestjs/common';
import { StoreService } from './store.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly store: StoreService) {}

  @Get('overview')
  async overview() {
    return { status: 'success', data: await this.store.adminOverview() };
  }

  @Get('dashboard')
  async dashboard() {
    return { status: 'success', data: await this.store.dashboard() };
  }

  @Get('categories')
  async categories() {
    return { status: 'success', data: await this.store.listCategories() };
  }

  @Get('products')
  async products() {
    return { status: 'success', data: await this.store.listProducts() };
  }

  @Get('orders')
  async orders() {
    return { status: 'success', data: await this.store.listAllOrders() };
  }

  @Get('customers')
  async customers() {
    return { status: 'success', data: await this.store.listCustomers() };
  }
}