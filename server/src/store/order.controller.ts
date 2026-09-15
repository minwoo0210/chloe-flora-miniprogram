import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { StoreService } from '@/store/store.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly store: StoreService) {}

  @Post()
  async create(@Body() body: any) {
    const userKey = body.userKey ?? 'guest';
    const data = await this.store.createOrder(userKey, {
      receiver: body.receiver,
      phone: body.phone,
      address: body.address,
      remark: body.remark,
      items: body.items,
    });
    return { status: 'success', data };
  }

  @Get()
  async list(@Query('userKey') userKey: string) {
    return { status: 'success', data: await this.store.listOrders(userKey ?? 'guest') };
  }
}