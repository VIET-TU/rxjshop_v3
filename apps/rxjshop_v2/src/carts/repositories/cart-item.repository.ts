import { Injectable } from '@nestjs/common'
import { CartItemEntity } from '../entities/cart-item.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { BaseRepository } from 'libs/shared/bases'

@Injectable()
export class CartItemRepository extends BaseRepository<CartItemEntity> {
	constructor(@InjectRepository(CartItemEntity) public readonly repo: Repository<CartItemEntity>) {
		super(repo)
	}
}
