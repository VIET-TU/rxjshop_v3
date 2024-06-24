import { Injectable } from '@nestjs/common'
import { BaseRepository } from 'libs/shared/bases'
import { MessageEntity } from '../entities/message.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class MessageRepository extends BaseRepository<MessageEntity> {
	constructor(@InjectRepository(MessageEntity) public readonly repo: Repository<MessageEntity>) {
		super(repo)
	}
}
