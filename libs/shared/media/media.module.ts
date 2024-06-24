import { Global, Module } from '@nestjs/common'
import { MediaService } from './services/media.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MediaEntity } from './entities/media.entity'
import { ConfigModule } from '@nestjs/config'
import { MediaRopository } from './repositories/media.repository'
import { MediaSubscriber } from './media.subscriber'
import { MediaController } from './controllers/media.controller'

@Global()
@Module({
	imports: [TypeOrmModule.forFeature([MediaEntity]), ConfigModule],
	controllers: [MediaController],
	providers: [MediaService, MediaRopository, MediaSubscriber],
	exports: [MediaService],
})
export class MediaModule {}
