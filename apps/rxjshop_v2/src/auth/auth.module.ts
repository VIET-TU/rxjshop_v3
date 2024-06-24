import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './services/auth.service'
import { OtpService } from './services/otp.service'
import { BullModule } from '@nestjs/bull'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { KeyTokenService } from './services/keyToken.service'
import { KeyTokenRepository } from './respositories/keyToken.repository'
import { TypeOrmModule } from '@nestjs/typeorm'
import { KeyTokenEntity } from './entities/keyToken.entity'
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { UserModule } from '../user/user.module'
import { Services } from 'libs/shared/utils/constants'

@Module({
	imports: [
		TypeOrmModule.forFeature([KeyTokenEntity]),
		UserModule,
		BullModule.registerQueue({
			name: 'send-email',
		}),
		PassportModule.register({
			defaultStrategy: 'jwt',
			property: 'user',
			session: false,
		}),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get('SECRETKEY'),
				signOptions: {
					expiresIn: configService.get('EXPIRESIN'),
				},
			}),
			inject: [ConfigService],
		}),
	],
	controllers: [AuthController],

	providers: [
		{
			provide: Services.AUTH,
			useClass: AuthService,
		},
		KeyTokenRepository,
		OtpService,
		KeyTokenService,
		JwtRefreshStrategy,
		JwtStrategy,
	],
})
export class AuthModule {}
