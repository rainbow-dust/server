import { IsOptional, IsString } from 'class-validator'

export class CommentDto {
  @IsString({ message: '评论内容' })
  content: string

  @IsString({ message: '文章id' })
  postId: string

  @IsOptional()
  @IsString({ message: '被回复人id' })
  mentioneeAuthor?: string

  @IsOptional()
  @IsString({ message: '被回复内容id' })
  mentionee?: string
}
