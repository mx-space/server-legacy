import { Controller, Get, Body, Post } from '@nestjs/common'
import { NotesService } from './notes.service'
import { NoteDto } from 'src/shared/notes/dto/note.dto'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Note Routes')
@Controller('notes')
export class NotesController {
  constructor(private readonly noteSerivce: NotesService) {}
  @Get()
  getLastestOne() {
    return
  }

  @Post()
  async postNewNote(@Body() body: NoteDto) {
    const data = await this.noteSerivce.createNew(body)

    //// TODO:  <25-03-20 filter data> //
    return data
  }
}
