import { Module } from '@nestjs/common';
import { StoreService } from '@/store/store.service';
import { CatalogController } from '@/store/catalog.controller';
import { OrderController } from '@/store/order.controller';
import { AdminController } from '@/store/admin.controller';

@Module({
  controllers: [CatalogController, OrderController, AdminController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}