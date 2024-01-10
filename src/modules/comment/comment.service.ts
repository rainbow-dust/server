import { Model } from 'mongoose'

import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { UserModel } from '../user/user.model'
import { CommentDto } from './comment.dto'
import { CommentModel } from './comment.model'

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('CommentModel')
    private readonly commentModel: Model<CommentModel>,
  ) {}

  async create(comment: CommentDto, user: UserModel) {
    // 分情况...回复的对象是文章还是评论
    if (comment.parentId) {
      const parentComment = await this.commentModel.findById(comment.parentId)
      if (!parentComment) {
        throw new Error('回复的评论不存在')
      }
      comment.replyId = parentComment.creator?._id || '没有就没有'
    } else {
      comment.replyId = comment.postId
    }
    return this.commentModel.create({
      ...comment,
      user: user?._id || '没有就没有',
    })
  }
}
