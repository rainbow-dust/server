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
import { NoteDto, NoteList } from './note.dto'
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
  async getPaginate(@Body() noteList: NoteList) {
    return this.noteService.notePaginate(noteList)
  }

  @Delete(':id')
  @Auth()
  async deleteNote(@Param('id') id: string, @CurrentUser() user: UserModel) {
    const _note = await this.noteService.model.findById(id)
    if (_note?.author_id !== user._id && !user.admin) {
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
    if (_note?.author_id !== user._id && !user.admin) {
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
    if (_note?.author_id !== user._id && !user.admin) {
      throw new ForbiddenException('没有权限修改')
    }
    return await this.noteService.updateById(params.id, body)
  }

  // 怎么说呢...这里应该..换种设计
  // 列表查询的时候，如果有auth，就同时也给个isLike的字段
  // 然后不管怎么点，就是同一个接口，发现已经点过了，就unlike，没点过就like，然后返回结果到前端

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
}
