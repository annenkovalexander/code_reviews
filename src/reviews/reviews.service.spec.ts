import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { ReviewPaginationDto } from './dto/review-pagination.dto.js';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewRepo: any;

  beforeEach(() => {
    reviewRepo = {
      create: vi.fn(),
      save: vi.fn(),
      findOneBy: vi.fn(),
      findAndCount: vi.fn(),
    };
    service = new ReviewsService(reviewRepo);
  });

  it('creates review', async () => {
    const dto: CreateReviewDto = {
      fileHash: 'abc123',
      filePath: 'src/Components/Circle/Circle.tsx',
      reviewText: 'Review text',
    } as any;

    const review = { id: 1, ...dto };
    reviewRepo.create.mockReturnValue(review);
    reviewRepo.save.mockResolvedValue(review);

    const result = await service.create(dto);

    expect(reviewRepo.create).toHaveBeenCalledWith({
      fileHash: dto.fileHash,
      filePath: dto.filePath,
      reviewText: dto.reviewText,
    });
    expect(reviewRepo.save).toHaveBeenCalledWith(review);
    expect(result).toEqual(review);
  });

  it('returns review by hash', async () => {
    const review = { id: 1, fileHash: 'abc123' };
    reviewRepo.findOneBy.mockResolvedValue(review);

    const result = await service.findByHash('abc123');

    expect(reviewRepo.findOneBy).toHaveBeenCalledWith({ fileHash: 'abc123' });
    expect(result).toEqual(review);
  });

  it('throws NotFoundException if review by hash not found', async () => {
    reviewRepo.findOneBy.mockResolvedValue(null);

    await expect(service.findByHash('nope')).rejects.toThrow(NotFoundException);
  });

  it('returns review by file path', async () => {
    const review = { id: 1, filePath: 'src/Components/Circle/Circle.tsx' };
    reviewRepo.findOneBy.mockResolvedValue(review);

    const result = await service.findByFilePath('src/Components/Circle/Circle.tsx');

    expect(reviewRepo.findOneBy).toHaveBeenCalledWith({
      filePath: 'src/Components/Circle/Circle.tsx',
    });
    expect(result).toEqual(review);
  });

  it('throws NotFoundException if review by file path not found', async () => {
    reviewRepo.findOneBy.mockResolvedValue(null);

    await expect(
      service.findByFilePath('nope.ts'),
    ).rejects.toThrow(NotFoundException);
  });

  it('returns paginated reviews', async () => {
    const dto: ReviewPaginationDto = { page: 1, limit: 2 } as any;
    const items = [{ id: 1 }, { id: 2 }];
    reviewRepo.findAndCount.mockResolvedValue([items, 5]);

    const result = await service.findAll(dto);

    expect(reviewRepo.findAndCount).toHaveBeenCalled();
    expect(result.items).toEqual(items);
    expect(result.total).toBe(5);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(2);
    expect(result.totalPages).toBe(3);
  });
});