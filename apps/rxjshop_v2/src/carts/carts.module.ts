import { Module } from '@nestjs/common'
import { CartsController } from './controllers/carts.controller'
import { CartsService } from './services/carts.service'
import { CartItemRepository } from './repositories/cart-item.repository'
import { CartRepository } from './repositories/cart.repository'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CartItemEntity } from './entities/cart-item.entity'
import { CartEntity } from './entities/cart.entity'

@Module({
	imports: [TypeOrmModule.forFeature([CartItemEntity, CartEntity])],
	controllers: [CartsController],
	providers: [CartsService, CartItemRepository, CartRepository],
})
export class CartsModule {}
