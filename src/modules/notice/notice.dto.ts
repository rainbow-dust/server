import { CommentModel } from '~/modules/comment/comment.model'
import { NoteModel } from '~/modules/note/note.model'
import { UserModel } from '~/modules/user/user.model'

export class NoticeDto {
  type: 'like' | 'comment' | 'follow' | 'reply' | 'collect' | 'system'
  topic: UserModel | NoteModel | CommentModel
  description: string
  is_read: boolean
  from: UserModel
  to: UserModel
}
