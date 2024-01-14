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
    const post = await this.postModel.findById(comment.post_id)
    if (!post) {
      throw new Error('文章不存在')
    }
    const co = await this.commentModel.create({
      ...comment,
      author: user._id,
    })

    return this.postModel.findByIdAndUpdate(
      comment.post_id,
      {
        $push: {
          comments: {
            comment_id: co._id,
            content: comment.content, // 一级的内容还是存两份...
            author: user._id,
          },
        },
      },
      { new: true },
    )
  }
  async createSecond(comment: CommentDto, user: UserModel) {
    // 找到一级评论
    const co = await this.commentModel.findById(comment.comment_id)
    if (!co) {
      throw new Error('评论不存在')
    }
    // 找到文章下的这个一级评论并更新一级评论数...
    // 难搞...好像真不如按范式来...或者完全不搞直接嵌套...
    await this.postModel.findOneAndUpdate(
      { _id: co.post_id },
      {
        $inc: { 'comments.$[comment].nested_comments_count': 1 },
      },
      {
        arrayFilters: [{ 'comment.comment_id': comment.comment_id }],
      },
    )

    // 创建二级评论
    const nested_comment = await this.commentModel.findOneAndUpdate(
      { _id: comment.comment_id },
      {
        $push: {
          nested_comments: {
            mentionee_author: comment.mentionee_author,
            mentionee: comment.mentionee,
            creator: user._id,
            content: comment.content,
          },
        },
      },
      { new: true },
    )

    return {
      comment: co,
      nested_comment,
    }
  }

  async getSecond(id: string) {}
}
