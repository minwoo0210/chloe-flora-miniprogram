import { Module } from '@nestjs/common';
import { StoreService } from '@/store/store.service';
import { CatalogController } from '@/store/catalog.controller';
import { AuthController } from '@/store/auth.controller';
import { AddressController } from '@/store/address.controller';
import { CartController } from '@/store/cart.controller';
import { OrderController } from '@/store/order.controller';
import { AdminController } from '@/store/admin.controller';

@Module({
  controllers: [CatalogController, AuthController, AddressController, CartController, OrderController, AdminController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}