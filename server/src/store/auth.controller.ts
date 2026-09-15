import { Body, Controller, Post } from '@nestjs/common';
import { StoreService } from '@/store/store.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly store: StoreService) {}

  @Post('login')
  async login(@Body() body: { userKey: string; nickname?: string }) {
    const user = await this.store.login(body.userKey, body.nickname);
    return { status: 'success', data: user };
  }
}