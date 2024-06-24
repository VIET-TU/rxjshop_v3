import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { ConversationEntity } from './conversation.entity'
import { UserEntity } from 'apps/rxjshop_v2/src/user/entities/user.entity'
import { BaseEntity } from 'libs/shared/bases'

@Entity('message')
export class MessageEntity extends BaseEntity {
	@Column()
	message: string

	// @ManyToOne(() => UserEntity, (userEntity) => userEntity.messages)
	// user: UserEntity

	@ManyToOne(() => ConversationEntity, (conversationEntity) => conversationEntity.messages)
	conversation: ConversationEntity
}
