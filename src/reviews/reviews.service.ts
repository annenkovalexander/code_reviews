import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateReviewDto } from './dto/create-review.dto.js';
import { ReviewPaginationDto } from './dto/review-pagination.dto.js';
import { Review } from './entities/review.entity.js';

export interface PaginatedReviews {
  items: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
  ) {}

  async create(dto: CreateReviewDto): Promise<Review> {
    const review = this.reviewsRepository.create({
      fileHash: dto.fileHash,
      filePath: dto.filePath,
      reviewText: dto.reviewText,
    });

    return this.reviewsRepository.save(review);
  }

  async findByHash(fileHash: string): Promise<Review | null> {
    const review = await this.reviewsRepository.findOneBy({
      fileHash,
    });

    return review ?? null;
  }

  async findByFilePath(filePath: string): Promise<Review | null> {
    const review = await this.reviewsRepository.findOneBy({
      filePath,
    });

    return review ?? null;
  }

  async findAll(dto: ReviewPaginationDto): Promise<PaginatedReviews> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;

    const [items, total] = await this.reviewsRepository.findAndCount({
      order: {
        createdAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}