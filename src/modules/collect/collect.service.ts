import { Model } from 'mongoose'

import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CollectModel } from './collect.model'

@Injectable()
export class CollectService {
  constructor(
    @InjectModel('CollectModel')
    private readonly collectModel: Model<CollectModel>,
  ) {}
}
