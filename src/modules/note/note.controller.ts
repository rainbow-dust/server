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

  @Get(':id')
  @ApiOperation({ summary: '根据 id 查文章' })
  async findLostById(@Param('id') id: string) {
    return this.noteService.findNoteById(id)
  }

  @Post('/query/list')
  @ApiOperation({ summary: '分页获取博文' })
  async getPaginate(
    @Body() noteQuery: NoteListQuery,
    @CurrentUser() user: UserModel,
  ) {
    return this.noteService.notePaginate(noteQuery, user)
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

  @Get('/:username/likes')
  @ApiOperation({ summary: '获取指定用户的点赞列表' })
  async getUserLikes(@Param('username') username: string) {
    return await this.noteService.getUserLikes(username)
  }
}
