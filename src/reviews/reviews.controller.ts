import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { ReviewPaginationDto } from './dto/review-pagination.dto.js';
import { Review } from './entities/review.entity.js';

@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(@Body() dto: CreateReviewDto): Promise<Review> {
    return this.reviewsService.create(dto);
  }

  @Get()
  async findAll(@Query() dto: ReviewPaginationDto) {
    return this.reviewsService.findAll(dto);
  }

  @Get('hash/:fileHash')
  async findByHash(@Param('fileHash') fileHash: string): Promise<Review> {
    const review = await this.reviewsService.findByHash(fileHash);
    if (!review) {
      throw new NotFoundException(
        `Review for file hash "${fileHash}" not found`,
      );
    }
    return review;
  }

  @Get('file')
  async findByFilePath(@Query('filePath') filePath: string): Promise<Review> {
    const review = await this.reviewsService.findByFilePath(filePath);
    if (!review) {
      throw new NotFoundException(
        `Review for file path "${filePath}" not found`,
      );
    }
    return review;
  }
}