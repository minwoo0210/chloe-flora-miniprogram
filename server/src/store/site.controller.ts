import { Controller, Get } from '@nestjs/common';
import { StoreService } from './store.service';

@Controller('site')
export class SiteController {
  constructor(private readonly store: StoreService) {}

  @Get('home')
  async home() {
    return { status: 'success', data: await this.store.getHomeConfig() };
  }
}