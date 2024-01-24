import { CommentModel } from '../comment/comment.model'
import { NoteModel } from '../note/note.model'
import { UserModel } from '../user/user.model'

export class NoticeDto {
  type: 'like' | 'comment' | 'follow' | 'reply'
  topic: UserModel | NoteModel | CommentModel
  description: string
  is_read: boolean
  from: UserModel
  to: UserModel
}
