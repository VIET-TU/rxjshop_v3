import { Injectable } from '@nestjs/common'
import { UserEntity } from '../entities/user.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { BaseRepository } from 'libs/shared/bases'

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
	constructor(@InjectRepository(UserEntity) public readonly repo: Repository<UserEntity>) {
		super(repo)
	}
}
