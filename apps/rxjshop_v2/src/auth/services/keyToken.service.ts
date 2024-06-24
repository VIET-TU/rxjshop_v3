import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { KeyTokenRepository } from '../respositories/keyToken.repository'
import { KeyTokenEntity } from '../entities/keyToken.entity'
import { UserEntity } from '../../user/entities/user.entity'

interface IcreateKeyToken {
	user: UserEntity
	publicKey: string
	privateKey: string
	refreshToken: string
}

@Injectable()
export class KeyTokenService {
	constructor(
		@Inject(forwardRef(() => KeyTokenRepository))
		private readonly keyTokenRepository: KeyTokenRepository
	) {}

	async updateKeyToken({
		user,
		publicKey,
		privateKey,
		refreshToken,
	}: IcreateKeyToken): Promise<void> {
		const searchCriteria = { user: { id: user.id } }
		await this.keyTokenRepository.updateBy(searchCriteria, { publicKey, privateKey, refreshToken })
	}

	async createKeyToken(data: IcreateKeyToken): Promise<void> {
		await this.keyTokenRepository.create(data)
	}

	async findKeyStoreByUserId(userId: string): Promise<KeyTokenEntity> {
		return await this.keyTokenRepository.getOne({ where: { user: { id: userId } } })
	}

	async deleteKeyStoreByUser(userId: string): Promise<void> {
		await this.keyTokenRepository.deleteBy({ user: { id: userId } })
	}
}
