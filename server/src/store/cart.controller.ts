import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { StoreService } from '@/store/store.service';

@Controller('cart')
export class CartController {
  constructor(private readonly store: StoreService) {}

  @Get()
  async list(@Query('userKey') userKey: string) {
    return { status: 'success', data: await this.store.listCart(userKey ?? 'guest') };
  }

  @Post('items')
  async add(@Body() body: { userKey?: string; productId: number; qty?: number }) {
    return {
      status: 'success',
      data: await this.store.addCartItem(body.userKey ?? 'guest', body.productId, body.qty ?? 1),
    };
  }

  @Put('items/:id')
  async updateQty(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userKey?: string; qty?: number },
  ) {
    return {
      status: 'success',
      data: await this.store.updateCartItemQty(body.userKey ?? 'guest', id, body.qty ?? 1),
    };
  }

  @Delete('items/:id')
  async remove(@Param('id', ParseIntPipe) id: number, @Query('userKey') userKey: string) {
    return { status: 'success', data: await this.store.removeCartItem(userKey ?? 'guest', id) };
  }

  @Delete()
  async clear(@Query('userKey') userKey: string) {
    return { status: 'success', data: await this.store.clearCart(userKey ?? 'guest') };
  }
}