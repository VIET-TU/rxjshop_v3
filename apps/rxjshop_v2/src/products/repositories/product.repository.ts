import { Injectable } from '@nestjs/common'
import { ProductEnitty } from '../entities/product.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ElectronicEntity } from '../entities/electronic.entity'
import { BaseRepository } from 'libs/shared/bases'

@Injectable()
export class ProductRepository extends BaseRepository<ProductEnitty> {
	constructor(@InjectRepository(ProductEnitty) public readonly repo: Repository<ProductEnitty>) {
		super(repo)
	}
}

@Injectable()
export class ElectronicRepository extends BaseRepository<ElectronicEntity> {
	constructor(
		@InjectRepository(ElectronicEntity) public readonly repo: Repository<ElectronicEntity>
	) {
		super(repo)
	}
}
