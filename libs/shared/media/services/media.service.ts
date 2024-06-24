import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { S3 } from 'aws-sdk'
import { MediaRopository } from '../repositories/media.repository'
import { v4 as uuidv4 } from 'uuid'
import { EntityManager } from 'typeorm'
import { MediaEntity } from '../entities/media.entity'

@Injectable()
export class MediaService {
	private readonly region
	private readonly accessKeyId
	private readonly secretAccessKey
	private readonly publicBucketName
	private manager: EntityManager

	constructor(
		private readonly mediaRepository: MediaRopository,
		private readonly configService: ConfigService
	) {
		this.region = this.configService.get('AWS_REGION')
		this.accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID')
		this.secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY')
		this.publicBucketName = this.configService.get('AWS_PUBLIC_BUCKET_NAME')
	}

	public async handlerFile(files: File[], manager: EntityManager) {
		this.manager = manager
		const urls: string[] = []
		for (const item of files) {
			const url = this.getLinkMediaKey((await this.upload(item)).key)
			urls.push(url)
		}
		return urls
	}

	getLinkMediaKey(media_key) {
		const ONE_YEAR_EXPIRES = 60 * 60 * 24 * 365
		const s3 = this.getS3()
		return s3.getSignedUrl('getObject', {
			Key: media_key,
			Bucket: this.publicBucketName,
			Expires: ONE_YEAR_EXPIRES,
		})
	}

	// update role
	async updateACL(media_id) {
		const media = await this.mediaRepository.getOneByIdOrFail(media_id)
		const s3 = this.getS3()
		s3.putObjectAcl(
			{
				Bucket: this.publicBucketName,
				Key: media.key,
				ACL: 'public-read',
			},
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			(err, data) => {}
		)
		return (
			s3.endpoint.protocol +
			'//' +
			this.publicBucketName +
			'.' +
			s3.endpoint.hostname +
			'/' +
			media.key
		)
	}

	async uploadAndGetLink(file) {
		return await this.getLinkMediaKey((await this.upload(file)).key)
	}

	async upload(file) {
		const objectId = uuidv4()
		const arr_name = file.originalname.split('.')
		const extension = arr_name.pop()
		const name = arr_name.join('.')
		const key = objectId + '/' + this.slug(name) + '.' + extension
		const data = {
			id: objectId,
			name: name,
			file_name: String(file.originalname),
			mime_type: file.mimetype,
			size: file.size,
			key: key,
		}
		await this.uploadS3(file.buffer, key, file.mimetype)
		let newMedia
		if (this.manager) {
			newMedia = await this.manager.create(MediaEntity, data)
			await this.manager.save(newMedia)
		} else {
			newMedia = this.mediaRepository.create(data)
		}

		return newMedia
	}

	async deleteFileS3(media_key: string) {
		const s3 = this.getS3()
		const params = {
			Bucket: this.publicBucketName,
			Key: media_key,
		}
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		s3.deleteObject(params, (err, data) => {})
		return true
	}

	private async uploadS3(file_buffer, key, content_type) {
		const s3 = this.getS3()
		const params = {
			Bucket: this.publicBucketName,
			Key: key, // name file
			Body: file_buffer, // encode to buffer type
			ContentType: content_type, // jpg, png
		}
		return new Promise((resolve, reject) => {
			s3.upload(params, (err, data) => {
				if (err) {
					reject(err.message)
				}
				resolve(data)
			})
		})
	}

	private getS3() {
		return new S3({
			region: this.region,
			accessKeyId: this.accessKeyId,
			secretAccessKey: this.secretAccessKey,
		})
	}

	private slug(str) {
		str = str.replace(/^\s+|\s+$/g, '') // trim
		str = str.toLowerCase()

		// remove accents, swap ñ for n, etc
		const from =
			'ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆĞÍÌÎÏİŇÑÓÖÒÔÕØŘŔŠŞŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇğíìîïıňñóöòôõøðřŕšşťúůüùûýÿžþÞĐđßÆa·/_,:;'
		const to =
			'AAAAAACCCDEEEEEEEEGIIIIINNOOOOOORRSSTUUUUUYYZaaaaaacccdeeeeeeeegiiiiinnooooooorrsstuuuuuyyzbBDdBAa------'
		for (let i = 0, l = from.length; i < l; i++) {
			str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
		}

		str = str
			.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
			.replace(/\s+/g, '-') // collapse whitespace and replace by -
			.replace(/-+/g, '-') // collapse dashes

		return str
	}

	async deleteMediaById(media_key: string, manager: EntityManager) {
		const media = await manager.findOne(MediaEntity, {
			where: {
				key: media_key,
			},
		})
		if (media) {
			await manager.remove(MediaEntity, media)
		}
	}
}
