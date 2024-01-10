import { IsOptional, IsString } from 'class-validator'

export class CommentDto {
  @IsString({ message: '一级评论内容' })
  content: string

  @IsString({ message: '文章id' })
  postId: string

  @IsOptional()
  @IsString({ message: '被回复人id' })
  parentId?: string

  @IsOptional()
  @IsString({ message: '被回复内容id' })
  replyId?: string
}
