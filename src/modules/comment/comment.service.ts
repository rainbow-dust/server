import { Model } from 'mongoose'

import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { PostModel } from '../post/post.model'
import { UserModel } from '../user/user.model'
import { CommentDto } from './comment.dto'
import { CommentModel } from './comment.model'

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('CommentModel')
    private readonly commentModel: Model<CommentModel>,
    @InjectModel('PostModel')
    private readonly postModel: Model<PostModel>,
  ) {}

  async createFirst(comment: CommentDto, user: UserModel) {
    const post = await this.postModel.findById(comment.postId)
    if (!post) {
      throw new Error('文章不存在')
    }
    const co = await this.commentModel.create({
      ...comment,
      user: user._id,
    })

    return this.postModel.findByIdAndUpdate(
      comment.postId,
      {
        $push: {
          comments: {
            commentId: co._id,
            content: comment.content, // 一级的内容还是存两份...
            user: user._id,
          },
        },
      },
      { new: true },
    )
  }
  async createSecond(comment: CommentDto, user: UserModel) {
    const parentComment = await this.commentModel.findById(comment.mentionee)
    if (!parentComment) {
      throw new Error('回复的评论不存在')
    }
    return this.commentModel.findByIdAndUpdate(
      comment.mentionee,
      {
        $push: {
          nestedComment: {
            ...comment,
            user: user._id,
          },
        },
      },
      { new: true },
    )
  }

  async getSecond(id: string) {}
}
