import { Module } from '@nestjs/common'
import { PostService } from './post.service'
import { PostController } from './post.controller'
import { CaslAbilityFactory } from './ability.factory'

@Module({
	controllers: [PostController],
	providers: [PostService, CaslAbilityFactory],
})
export class PostModule {}
