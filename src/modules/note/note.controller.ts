import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

import { Auth } from '~/common/decorator/auth.decorator'
import { CurrentUser } from '~/common/decorator/current-user.decorator'
import { ApiName } from '~/common/decorator/openapi.decorator'

import { MongoIdDto } from '../../shared/dto/id.dto'
import { UserModel } from '../user/user.model'
import { NoteDto, NoteListQuery } from './note.dto'
import { PartialNoteModel } from './note.model'
import { NoteService } from './note.service'

@Controller('note')
@ApiName
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post('/add')
  @Auth()
  async create(@Body() note: NoteDto, @CurrentUser() user: UserModel) {
    return await this.noteService.create(note, user)
  }

  // 这里除了 tag, 也考虑查出来收录它的 collect
  // 以及这里可以用来，更新 user 的 preference...可能算我懒..喜欢和收藏的地方也可以但好像要在好多地方写...
  // 总之推荐系统要考虑开始搞了，虽然现在没啥数据...
  @Get(':id')
  @ApiOperation({ summary: '根据 id 查文章' })
  async findLostById(@Param('id') id: string, @CurrentUser() user: UserModel) {
    return this.noteService.findNoteById(id, user)
  }

  // 这个接口处理的更多的是有条件的查询
  @Post('/query/list')
  @ApiOperation({ summary: '分页获取博文' })
  async getPaginate(
    @Body() noteQuery: NoteListQuery,
    @CurrentUser() user: UserModel,
  ) {
    return this.noteService.notePaginate(noteQuery, user)
  }

  @Post('/query/recommend')
  @ApiOperation({ summary: '获取推荐文章' })
  async getRecommend(
    @CurrentUser() user: UserModel,
    @Body()
    pagination: {
      pageCurrent?: number
      pageSize: number
      lastId?: string
    },
  ) {
    return this.noteService.getRecommend(pagination, user)
  }

  @Delete(':id')
  @Auth()
  async deleteNote(@Param('id') id: string, @CurrentUser() user: UserModel) {
    const _note = await this.noteService.model.findById(id)
    if (_note?.author !== user._id && !user.admin) {
      throw new ForbiddenException('没有权限删除')
    }
    return await this.noteService.deleteNote(id)
  }

  @Patch('/:id')
  @Auth()
  async patch(
    @Param() params: MongoIdDto,
    @Body() body: PartialNoteModel,
    @CurrentUser() user: UserModel,
  ) {
    const _note = await this.noteService.model.findById(params.id)
    if (_note?.author !== user._id && !user.admin) {
      throw new ForbiddenException('没有权限修改')
    }
    return await this.noteService.updateById(params.id, body)
  }

  @Put('/:id')
  @Auth()
  async put(
    @Param() params: MongoIdDto,
    @Body() body: PartialNoteModel,
    @CurrentUser() user: UserModel,
  ) {
    const _note = await this.noteService.model.findById(params.id)
    if (_note?.author !== user._id && !user.admin) {
      throw new ForbiddenException('没有权限修改')
    }
    return await this.noteService.updateById(params.id, body)
  }

  @Post('/:id/like')
  @Auth()
  async like(@Param('id') id: string, @CurrentUser() user: UserModel) {
    return await this.noteService.like(id, user)
  }

  @Delete('/:id/like')
  @Auth()
  async unlike(@Param('id') id: string, @CurrentUser() user: UserModel) {
    return await this.noteService.unlike(id, user)
  }

  @Post('/:username/likes')
  @ApiOperation({ summary: '获取指定用户的点赞列表' })
  async getUserLikes(
    @Param('username') username: string,
    @Body() noteQuery: NoteListQuery,
    @CurrentUser() user: UserModel,
  ) {
    return await this.noteService.getUserLikes(username, noteQuery, user)
  }
}
