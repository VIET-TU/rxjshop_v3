import { Injectable } from '@nestjs/common'
import { BaseRepository } from 'libs/shared/bases'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { ConversationEntity } from '../entities/conversation.entity'

@Injectable()
export class ConversationRepository extends BaseRepository<ConversationEntity> {
	constructor(
		@InjectRepository(ConversationEntity) public readonly repo: Repository<ConversationEntity>
	) {
		super(repo)
	}

	public async findConversation(
		userId: string,
		friendId: string
	): Promise<ConversationEntity | undefined> {
		return await this.repo
			.createQueryBuilder('conversation')
			.leftJoin('conversation.users', 'user')
			.where('user.id = :userId', { userId })
			.orWhere('user.id = :friendId', { friendId })
			.groupBy('conversation.id')
			.having('COUNT(*) > 1')
			.getOne()
	}
}
