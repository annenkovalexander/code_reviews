import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { CreateReviewDto } from './dto/create-review.dto.js';
import { ReviewPaginationDto } from './dto/review-pagination.dto.js';
import { ReviewsService } from './reviews.service.js';

@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto);
  }

  @Get('hash/:fileHash')
  findByHash(@Param('fileHash') fileHash: string) {
    return this.reviewsService.findByHash(fileHash);
  }

  @Get('file')
  findByFilePath(@Query('filePath') filePath: string) {
    return this.reviewsService.findByFilePath(filePath);
  }

  @Get()
  findAll(@Query() dto: ReviewPaginationDto) {
    return this.reviewsService.findAll(dto);
  }
}