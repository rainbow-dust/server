import { Model } from 'mongoose'

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { UserModel } from '../user/user.model'
import { PostDto, PostList, QueryType } from './post.dto'
import { PartialPostModel, PostModel } from './post.model'

@Injectable()
export class PostService {
  constructor(
    @InjectModel('PostModel')
    private readonly postModel: Model<PostModel>,
  ) {}
  async create(post: PostDto, user: UserModel) {
    return this.postModel.create({ ...post, user: user._id })
  }

  async findPostById(id: string) {
    const _post = await this.postModel.findById(id)

    if (!_post) {
      throw new ForbiddenException('文章不存在')
    }
    await this.postModel.updateOne({ _id: id }, { $inc: { read: 1 } })
    const post = await this.postModel
      .findById(id)
      // .populate('category user')
      .lean()
    post.id = post._id
    const relatedPost = await this.postModel.aggregate([
      {
        // 联表查询，comments 里有一堆 id，需要转换成具体的评论
        $lookup: {
          from: 'comments',
          localField: 'comments',
          foreignField: 'comment_id',
          as: 'comments',
        },
      },
      {
        $project: {
          title: 1,
          read: 1,
        },
      },
      {
        $match: {
          _id: { $ne: post._id },
        },
      },
      {
        $sort: {
          read: -1,
        },
      },
      {
        $limit: 10,
      },
    ])
    post['related'] = relatedPost
    return post
  }

  // FIXME 无法查询到当前页面之外的文章，需要分组查询
  async postPaginate(post: PostList) {
    const { pageCurrent, pageSize, tags, sort, type } = post

    if (type === QueryType.user_preference) {
      // TODO
    }

    // ...

    const postList = await this.postModel.populate(
      await this.postModel.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $project: {
            content: {
              $substrCP: ['$content', 1, 100],
            },
            _id: 1,
            title: 1,
            tags: 1,
            created: 1,
            cover: 1,
            pic_urls: 1,
            read: 1,
            updatedAt: 1,
            user: {
              $arrayElemAt: ['$user', 0],
            },
            // 我希望这里能够返回 user 的信息而不是什么id...
          },
        },
        // {
        //   $match: {
        //     tags: { $in: tags },
        //   },
        // },
        // {
        //   $sort: {
        //     read: sort != Sort.Newest ? -1 : 1,
        //     created: -1,
        //   },
        // },
        {
          $skip: pageSize * (pageCurrent - 1),
        },
        {
          $limit: pageSize,
        },
      ]),
      { path: 'category user' },
    )

    const totalCount = await this.postModel.count()
    const totalPages = Math.ceil(totalCount / pageSize)
    return {
      postList,
      totalCount,
      totalPages,
    }
  }

  async deletePost(id: string) {
    const _post = await this.postModel.findById(id)
    if (!_post) {
      throw new ForbiddenException('文章不存在')
    }
    await this.postModel.findByIdAndDelete(id)
    return
  }

  async updateById(id: string, post: PartialPostModel) {
    const oldPost = await this.postModel.findById(id, 'category')
    if (!oldPost) {
      throw new BadRequestException('文章不存在')
    }
    await this.postModel.updateOne({ _id: id }, post)
    return
  }

  get model() {
    return this.postModel
  }
}
