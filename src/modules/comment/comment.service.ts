import { Model } from 'mongoose'

import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { NoteModel } from '../note/note.model'
import { UserModel } from '../user/user.model'
import { CommentDto } from './comment.dto'
import { CommentModel } from './comment.model'

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('CommentModel')
    private readonly commentModel: Model<CommentModel>,
    @InjectModel('NoteModel')
    private readonly noteModel: Model<NoteModel>,
  ) {}

  async createComment(comment: CommentDto, user: UserModel) {
    const { note_id, content, root_comment_id, mentionee_id } = comment
    const note = await this.noteModel.findById(note_id)
    if (!note) {
      throw new BadRequestException('文章不存在')
    }
    if (root_comment_id) {
      await this.commentModel.findByIdAndUpdate(root_comment_id, {
        $inc: { child_comment_count: 1 },
      })
    }
    const newComment = await this.commentModel.create({
      author: user._id,
      note_id,
      content,
      root_comment_id,
      mentionee: mentionee_id,
    })
    await this.noteModel.findByIdAndUpdate(note_id, {
      $inc: { comment_count: 1 },
    })
    return newComment
  }

  async getRootComment(note_id: string, user: UserModel) {
    const note = await this.noteModel.findById(note_id)
    if (!note) {
      throw new BadRequestException('文章不存在')
    }
    const rootComments = await this.commentModel
      .find({ note_id, root_comment_id: null })
      .populate('author')
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
      .populate('author mentionee')
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
    const newComment = await this.commentModel
      .findByIdAndUpdate(comment_id, {
        $inc: { like_count: 1 },
        $push: { like_user_ids: user._id },
      })
      .lean()
    newComment['is_liked'] = true
    newComment['like_count'] += 1 // 为什么这个不是给出修改后的结果...还要自己这里做样子...
    return newComment
  }

  async cancelLike(comment_id: string, user: UserModel) {
    const comment = await this.commentModel.findById(comment_id)
    if (!comment) {
      throw new BadRequestException('评论不存在')
    }
    if (!comment.like_user_ids.includes(user._id)) {
      throw new BadRequestException('未点赞过')
    }

    const newComment = await this.commentModel
      .findByIdAndUpdate(comment_id, {
        $inc: { like_count: -1 },
        $pull: { like_user_ids: user._id },
      })
      .lean()
    newComment['is_liked'] = false
    newComment['like_count'] -= 1
    return newComment
  }
}
