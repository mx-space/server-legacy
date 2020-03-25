import { Module } from '@nestjs/common'
import { SharedService } from './shared.service'
import { BaseService } from './base/base.service'
import { NotesController } from './notes/notes.controller';
import { NotesService } from './notes/notes.service';

@Module({
  providers: [SharedService, NotesService],
  controllers: [NotesController],
})
export class SharedModule {}
