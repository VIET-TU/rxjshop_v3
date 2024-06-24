import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { KeyTokenEntity } from '../entities/keyToken.entity'
import { BaseRepository } from 'libs/shared/bases'

@Injectable()
export class KeyTokenRepository extends BaseRepository<KeyTokenEntity> {
	constructor(@InjectRepository(KeyTokenEntity) public readonly repo: Repository<KeyTokenEntity>) {
		super(repo)
	}
}
