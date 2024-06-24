import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './services/user.service'
import { OtpService } from '../auth/services/otp.service'
import { UserRepository } from './repositories/user.repository'
import { UserEntity } from './entities/user.entity'
import { Services } from 'libs/shared/utils/constants'

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity])],
	controllers: [UserController],
	providers: [
		OtpService,
		UserRepository,
		{
			provide: Services.USERS,
			useClass: UserService,
		},
	],
	exports: [
		{
			provide: Services.USERS,
			useClass: UserService,
		},
		UserRepository,
	],
})
export class UserModule {}
