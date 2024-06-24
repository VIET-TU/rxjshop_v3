import { Injectable } from '@nestjs/common'
import { CartEntity } from '../entities/cart.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseRepository } from 'libs/shared/bases'

@Injectable()
export class CartRepository extends BaseRepository<CartEntity> {
	constructor(@InjectRepository(CartEntity) public readonly repo: Repository<CartEntity>) {
		super(repo)
	}
}
