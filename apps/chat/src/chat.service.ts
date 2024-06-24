import { ClientProxy } from '@nestjs/microservices'
import { Inject, Injectable } from '@nestjs/common'

import { firstValueFrom } from 'rxjs'

import { NewMessageDTO } from './dtos/NewMessage.dto'
import { MessageRepository } from './repositories/message.repository'
import { ConversationRepository } from './repositories/conversations.repository'
import { UserEntity } from 'apps/rxjshop_v2/src/user/entities/user.entity'

@Injectable()
export class ChatService {
	constructor(
		@Inject('ConversationsRepositoryInterface')
		private readonly conversationsRepository: ConversationRepository,
		@Inject('MessagesRepositoryInterface')
		private readonly messagesRepository: MessageRepository,
		@Inject('AUTH_SERVICE') private readonly authService: ClientProxy
	) {}

	getHello(): string {
		return 'Hello World!'
	}

	private async getUser(id: string) {
		const ob$ = this.authService.send<UserEntity>(
			{
				cmd: 'get-user',
			},
			{ id }
		)

		const user = await firstValueFrom(ob$).catch((err) => console.error(err))

		return user
	}

	async getConversations(userId: string) {
		const allConversations = await this.conversationsRepository.getAll({
			relations: ['users'],
		})

		const userConversations = allConversations.filter((conversation) => {
			const userIds = conversation.users.map((user) => user.id)
			return userIds.includes(userId)
		})

		return userConversations.map((conversation) => ({
			id: conversation.id,
			userIds: (conversation?.users ?? []).map((user) => user.id),
		}))
	}

	async createConversation(userId: string, friendId: string) {
		const user = await this.getUser(userId)
		const friend = await this.getUser(friendId)

		if (!user || !friend) return

		const conversation = await this.conversationsRepository.findConversation(userId, friendId)

		if (!conversation) {
			return await this.conversationsRepository.create({
				users: [user, friend],
			})
		}

		return conversation
	}

	async createMessage(userId: string, newMessage: NewMessageDTO) {
		const user = await this.getUser(userId)

		if (!user) return

		const conversation = await this.conversationsRepository.getOne({
			where: [{ id: newMessage.conversationId }],
			relations: ['users'],
		})

		if (!conversation) return

		return await this.messagesRepository.create({
			message: newMessage.message,
			user,
			conversation,
		})
	}
}
