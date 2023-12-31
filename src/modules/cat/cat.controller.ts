import { Controller, Get, Param } from '@nestjs/common';
import { CatService } from './cat.service';

@Controller('cat')
export class CatController {
  constructor(private readonly catService: CatService) {}

  @Get(':catId')
  getCatById(@Param('catId') catId: string) {
    return this.catService.getCatById(catId);
  }
}
