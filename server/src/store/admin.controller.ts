import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
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

  @Get('dashboard')
  async dashboard() {
    return { status: 'success', data: await this.store.dashboard() };
  }

  @Get('customers')
  async customers() {
    return { status: 'success', data: await this.store.listCustomers() };
  }

  @Get('site/home')
  async getHome() {
    return { status: 'success', data: await this.store.getHomeConfig() };
  }

  @Put('site/home')
  async saveHome(@Body() body: any) {
    return { status: 'success', data: await this.store.saveHomeConfig(body?.config ?? body) };
  }

  @Put('orders/:id/status')
  async updateOrderStatus(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return { status: 'success', data: await this.store.updateOrderStatus(id, body?.status) };
  }

  @Post('products')
  async createProduct(@Body() body: any) {
    const data = await this.store.createProduct(body);
    return { status: 'success', data };
  }

  @Put('products/:id')
  async updateProduct(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const data = await this.store.updateProduct(id, body);
    return { status: 'success', data };
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    const data = await this.store.deleteProduct(id);
    return { status: 'success', data };
  }
}