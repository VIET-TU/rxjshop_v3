import { ExtractJwt, Strategy } from 'passport-jwt'
import {
	Inject,
	ExecutionContext,
	Injectable,
	forwardRef,
	HttpStatus,
	HttpException,
} from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { HEADER } from '../enums/header.enum'
import { KeyTokenRepository } from '../respositories/keyToken.repository'
import { KeyTokenService } from '../services/keyToken.service'
import { UserService } from '../../user/services/user.service'
import { Services } from 'libs/shared/utils/constants'
import { JwtPayoadType } from './types/jwt-payload-types'
import { UserEntity } from '../../user/entities/user.entity'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
	constructor(
		@Inject(Services.USERS) private readonly userService: UserService,
		@Inject(forwardRef(() => KeyTokenService))
		private readonly keyTokenService: KeyTokenService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					const token = request?.cookies[process.env.REFRESH_TOKEN_COOKIE_NAME]
					request.body.refreshToken = token
					if (!token) return null
					return token
				},
			]),
			passReqToCallback: true,
			ignoreExpiration: false,
			secretOrKeyProvider: async (req: Request, _, done) => {
				try {
					const userId = req.headers[HEADER.CLIENT_ID]
					if (!userId) throw new HttpException('Invalid request', HttpStatus.UNAUTHORIZED)
					const keyStore = await this.keyTokenService.findKeyStoreByUserId(userId as string)
					if (!keyStore) throw new HttpException('Not found keyStore', HttpStatus.UNAUTHORIZED)
					if (keyStore.refreshToken !== req.body.refreshToken) {
						throw new HttpException('User not registered', HttpStatus.UNAUTHORIZED)
					}

					req.body.keyStore = keyStore
					done(null, keyStore.privateKey)
				} catch (error) {
					done(error)
				}
			},
		})
	}
	async validate(req: Request, { payload }: { payload: JwtPayoadType }): Promise<UserEntity> {
		if (payload.userId !== req.headers[HEADER.CLIENT_ID])
			throw new HttpException('Invaild userId', HttpStatus.BAD_REQUEST)
		const user = await this.userService.findOneUserById(payload.userId)
		if (!user) {
			throw new HttpException('User not registered', HttpStatus.UNAUTHORIZED)
		}

		return user as UserEntity
	}
}
