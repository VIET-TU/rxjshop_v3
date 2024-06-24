import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'
import { ProductFactory } from './services/products.service'
import { ProductsController } from './products.controller'
import { ElectronicRepository, ProductRepository } from './repositories/product.repository'
import { ProductEnitty } from './entities/product.entity'
import { ElectronicEntity } from './entities/electronic.entity'

import { ProductCacheService } from './services/productCache.service'
import { ClothingEntity } from './entities/clothing.entity'
import { ColorEntity } from './entities/color.entity'
import { SizeEntity } from './entities/size.entity'
import { CategoryEntity } from './entities/category.entity'

@Module({
	imports: [
		TypeOrmModule.forFeature([
			ProductEnitty,
			ElectronicEntity,
			ClothingEntity,
			ColorEntity,
			SizeEntity,
			CategoryEntity,
		]),
	],
	controllers: [ProductsController],
	providers: [ProductFactory, ProductRepository, ElectronicRepository, ProductCacheService],
})
export class ProductsModule {}
