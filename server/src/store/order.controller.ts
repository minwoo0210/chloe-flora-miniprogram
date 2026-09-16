import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { StoreService } from '@/store/store.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly store: StoreService) {}

  @Post()
  async create(@Body() body: any) {
    const data = await this.store.createOrder({
      openid: body.openid || 'guest',
      nickname: body.nickname,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerAddress: body.customerAddress,
      remark: body.remark,
      deliveryFee: body.deliveryFee,
      items: body.items,
    });
    return { status: 'success', data };
  }

  @Get('my')
  async my(@Query('openid') openid: string) {
    return { status: 'success', data: await this.store.listMyOrders(openid) };
  }
}