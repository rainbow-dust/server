import { Model } from 'mongoose'

import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CreateTagDto } from './tag.dto'
import { TagModel } from './tag.model'

@Injectable()
export class TagService {
  constructor(
    @InjectModel('TagModel')
    private readonly tagModel: Model<TagModel>,
  ) {}

  async create(tag: CreateTagDto) {
    return this.tagModel.create(tag)
  }

  async query(query: string) {
    // 根据标签名模糊查询，并根据匹配度与 heat 值排序...emmm 匹配的话是不是肯定都会是全匹配才会被查出来... 所以这个可能没啥用?
    // 可能有点用，是个，左匹配优先。
    const tags = await this.tagModel.aggregate([
      {
        $match: {
          name: {
            $regex: query,
          },
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          heat: 1,
          match: {
            $indexOfCP: ['$name', query],
          },
        },
      },
      {
        $sort: {
          match: 1,
          heat: -1,
        },
      },
    ])
    return tags
  }
}
