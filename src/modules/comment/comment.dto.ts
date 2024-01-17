import { IsOptional, IsString } from 'class-validator'

export class CommentDto {
  @IsString({ message: '评论内容' })
  content: string

  @IsString({ message: '文章id' })
  note_id: string

  @IsString({ message: '一级评论id' })
  @IsOptional()
  root_comment_id?: string | null | undefined

  @IsOptional()
  @IsString({ message: '被回复人id' })
  mentionee_id?: string | null | undefined
}
