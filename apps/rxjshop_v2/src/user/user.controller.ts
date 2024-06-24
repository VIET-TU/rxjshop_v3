import {
	Body,
	Controller,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
	Request,
	forwardRef,
	Inject,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FileInterceptor } from '@nestjs/platform-express'
import { ResponseInterceptor } from 'libs/shared/utils/reponse.interceptor'
import { UpdateUserDto } from './dtos/UpdateUser.dto'
import { UserEntity } from './entities/user.entity'
import { UserService } from './services/user.service'
import { Services } from 'libs/shared/utils/constants'
import { ChangePassWordDto } from './dtos/ChangePassword.dto'

@Controller('user')
export class UserController {
	constructor(@Inject(Services.USERS) private readonly userService: UserService) {}

	@Post()
	@UseGuards(AuthGuard('jwt'))
	@UseInterceptors(FileInterceptor('avatar'))
	@UseInterceptors(new ResponseInterceptor('Update user successfully'))
	async updateUser(
		@Request() { user },
		@Body() payload: UpdateUserDto,
		@UploadedFile()
		avatar: File
	): Promise<UserEntity> {
		return this.userService.updateUser(user as UserEntity, payload, avatar)
	}

	@Post('/passwd')
	@UseGuards(AuthGuard('jwt'))
	@UseInterceptors(new ResponseInterceptor('Change password successfully'))
	async changePassword(@Request() { user }, @Body() payload: ChangePassWordDto) {
		return this.userService.changePassword(user, payload)
	}
}
