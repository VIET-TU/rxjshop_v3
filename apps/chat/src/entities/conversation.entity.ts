import {
	Entity,
	JoinTable,
	ManyToMany,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm'

import { MessageEntity } from './message.entity'
import { UserEntity } from 'apps/rxjshop_v2/src/user/entities/user.entity'
import { BaseEntity } from 'libs/shared/bases'

@Entity('conversation')
export class ConversationEntity extends BaseEntity {
	@ManyToMany(() => UserEntity)
	@JoinTable()
	users: UserEntity[]

	@OneToMany(() => MessageEntity, (messageEntity) => messageEntity.conversation)
	messages: MessageEntity[]

	@UpdateDateColumn()
	lastUpdated: Date
}
