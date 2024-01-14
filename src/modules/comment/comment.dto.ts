import { IsOptional, IsString } from 'class-validator'

export class CommentDto {
  @IsString({ message: '评论内容' })
  content: string

  @IsString({ message: '文章id' })
  post_id: string

  @IsString({ message: '一级评论id' })
  @IsOptional()
  comment_id?: string

  @IsOptional()
  @IsString({ message: '被回复人id' })
  mentionee_author?: string

  @IsOptional()
  @IsString({ message: '被回复内容id' })
  mentionee?: string
}
