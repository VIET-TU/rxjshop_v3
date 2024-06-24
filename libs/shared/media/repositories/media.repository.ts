import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { BaseRepository } from 'libs/shared/bases'
import { MediaEntity } from '../entities/media.entity'

@Injectable()
export class MediaRopository extends BaseRepository<MediaEntity> {
	constructor(@InjectRepository(MediaEntity) public readonly repo: Repository<MediaEntity>) {
		super(repo)
	}
}
