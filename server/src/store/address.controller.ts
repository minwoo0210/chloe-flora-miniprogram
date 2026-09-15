import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { StoreService } from '@/store/store.service';

@Controller('addresses')
export class AddressController {
  constructor(private readonly store: StoreService) {}

  @Get()
  async list(@Query('userKey') userKey: string) {
    return { status: 'success', data: await this.store.listAddresses(userKey ?? 'guest') };
  }

  @Post()
  async create(@Body() body: any) {
    const userKey = body.userKey ?? 'guest';
    return { status: 'success', data: await this.store.createAddress(userKey, body) };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const userKey = body.userKey ?? 'guest';
    return { status: 'success', data: await this.store.updateAddress(userKey, id, body) };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Query('userKey') userKey: string) {
    return { status: 'success', data: await this.store.deleteAddress(userKey ?? 'guest', id) };
  }
}