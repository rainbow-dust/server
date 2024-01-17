import { Model } from 'mongoose'

import { BadRequestException, Injectable } from '@nestjs/common'
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

  async createComment(comment: CommentDto, user: UserModel) {
    const { post_id, content, root_comment_id, mentionee_id } = comment
    const post = await this.postModel.findById(post_id)
    if (!post) {
      throw new BadRequestException('文章不存在')
    }
    if (root_comment_id) {
      await this.commentModel.findByIdAndUpdate(root_comment_id, {
        $inc: { child_comment_count: 1 },
      })
    }
    const newComment = await this.commentModel.create({
      author_id: user._id,
      post_id,
      content,
      root_comment_id,
      mentionee_id,
    })
    await this.postModel.findByIdAndUpdate(post_id, {
      $inc: { comment_count: 1 },
    })
    return newComment
  }

  async getRootComment(post_id: string, user: UserModel) {
    const post = await this.postModel.findById(post_id)
    if (!post) {
      throw new BadRequestException('文章不存在')
    }
    const rootComments = await this.commentModel
      .find({ post_id, root_comment_id: null })
      .populate('author_id')
      .lean()

    if (user?._id) {
      rootComments.forEach((comment) => {
        comment['is_liked'] = comment.like_user_ids
          .map((i) => i.toString())
          .includes(user._id)
      })
    }
    return rootComments
  }

  async getChildComment(root_comment_id: string, user: UserModel) {
    const rootComment = await this.commentModel.findById(root_comment_id)
    if (!rootComment) {
      throw new BadRequestException('评论不存在')
    }
    const childComment = await this.commentModel
      .find({ root_comment_id })
      .populate('author_id')
      .lean()

    if (user?._id) {
      childComment.forEach((comment) => {
        comment['is_liked'] = comment.like_user_ids
          .map((i) => i.toString())
          .includes(user._id)
      })
    }
    return childComment
  }

  async like(comment_id: string, user: UserModel) {
    const comment = await this.commentModel.findById(comment_id)
    if (!comment) {
      throw new BadRequestException('评论不存在')
    }
    if (comment.like_user_ids.includes(user._id)) {
      throw new BadRequestException('已经点赞过了')
    }
    await this.commentModel.findByIdAndUpdate(comment_id, {
      $inc: { like_count: 1 },
      $push: { like_user_ids: user._id },
    })
    return { success: true }
  }

  async cancelLike(comment_id: string, user: UserModel) {
    const comment = await this.commentModel.findById(comment_id)
    if (!comment) {
      throw new BadRequestException('评论不存在')
    }
    if (!comment.like_user_ids.includes(user._id)) {
      throw new BadRequestException('未点赞过')
    }
    await this.commentModel.findByIdAndUpdate(comment_id, {
      $inc: { like_count: -1 },
      $pull: { like_user_ids: user._id },
    })
    return { success: true }
  }
}
