import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	ForbiddenException,
	UseGuards,
} from '@nestjs/common'
import { PostService } from './post.service'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'
import { Action, CaslAbilityFactory, User } from './ability.factory'
import { ForbiddenError } from '@casl/ability'
import { CheckAbilities, ReadUserAbility } from './ability.decorator'
import { AbilityGuard } from './ability.guard'

@Controller('post')
export class PostController {
	constructor(
		private readonly postService: PostService,
		private caslAbilityFactory: CaslAbilityFactory
	) {}

	@Post()
	create(@Body() createPostDto: CreatePostDto) {
		const user = { id: 1, isAdmin: false, orgId: 1 }
		const ability = this.caslAbilityFactory.defineAbility(user)
		// const isAllowed = ability.can(Action.Create, User)
		// if(!isAllowed) {
		//   throw new ForbiddenException('only admin')
		// }

		try {
			ForbiddenError.from(ability)
				.setMessage('your message here')
				.throwUnlessCan(Action.Create, User)
			return this.postService.create(createPostDto)
		} catch (error) {
			throw new ForbiddenException(error.message)
		}
	}

	@Get()
	findAll() {
		return this.postService.findAll()
	}

	@Get(':id')
	@CheckAbilities(new ReadUserAbility())
	@UseGuards(AbilityGuard)
	findOne(@Param('id') id: string) {
		return this.postService.findOne(+id)
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
		return this.postService.update(+id, updatePostDto)
	}

	@Delete(':id')
	@CheckAbilities({ action: Action.Delete, subject: User })
	@UseGuards(AbilityGuard)
	remove(@Param('id') id: string) {
		return this.postService.remove(+id)
	}
}
