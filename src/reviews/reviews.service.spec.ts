import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from 'vitest';

import { ReviewsService } from './reviews.service.js';
import { Review } from './entities/review.entity.js';
import type { CreateReviewDto } from './dto/create-review.dto.js';
import type { ReviewPaginationDto } from './dto/review-pagination.dto.js';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let moduleFixture: TestingModule;

  let repo: {
    create: Mock;
    save: Mock;
    findOneBy: Mock;
    findAndCount: Mock;
    delete: Mock;
  };

  const fileHash = 'abc123';
  const filePath =
    '../../projects/annenkov_tech/src/Components/Circle/Circle.tsx';

  const mockReview = {
    id: 'c82581b9-d030-4285-a63e-4b768b3984c0',
    fileHash,
    filePath,
    reviewText: 'Test review',
    createdAt: new Date('2026-11-10T13:00:00.000Z'),
  };

  beforeEach(async () => {
    repo = {
      create: vi.fn((dto: CreateReviewDto) => ({
        ...mockReview,
        ...dto,
      })),
      save: vi.fn().mockResolvedValue(mockReview),
      findOneBy: vi.fn(),
      findAndCount: vi.fn(),
      delete: vi.fn(),
    };

    moduleFixture = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: getRepositoryToken(Review),
          useValue: repo,
        },
      ],
    }).compile();

    service = moduleFixture.get<ReviewsService>(ReviewsService);
  });

  afterEach(async () => {
    await moduleFixture?.close();
  });

  it('create — создаёт review', async () => {
    const dto: CreateReviewDto = {
      fileHash,
      filePath,
      reviewText: 'Test review',
    };

    const result = await service.create(dto);

    expect(repo.create).toHaveBeenCalledExactlyOnceWith(dto);
    expect(repo.save).toHaveBeenCalledExactlyOnceWith(mockReview);
    expect(result).toEqual(mockReview);
  });

  it('findByHash — возвращает review если найден', async () => {
    repo.findOneBy.mockResolvedValue(mockReview);

    const result = await service.findByHash(fileHash);

    expect(repo.findOneBy).toHaveBeenCalledWith({ fileHash });
    expect(result).toEqual(mockReview);
  });

  it('findByHash — возвращает null если не найден', async () => {
    repo.findOneBy.mockResolvedValue(null);

    const result = await service.findByHash('nonexistent');

    expect(repo.findOneBy).toHaveBeenCalledWith({
      fileHash: 'nonexistent',
    });
    expect(result).toBeNull();
  });

  it('findByFilePath — возвращает review если найден', async () => {
    repo.findOneBy.mockResolvedValue(mockReview);

    const result = await service.findByFilePath(filePath);

    expect(repo.findOneBy).toHaveBeenCalledWith({ filePath });
    expect(result).toEqual(mockReview);
  });

  it('findByFilePath — возвращает null если не найден', async () => {
    repo.findOneBy.mockResolvedValue(null);

    const result = await service.findByFilePath('nonexistent/path');

    expect(repo.findOneBy).toHaveBeenCalledWith({
      filePath: 'nonexistent/path',
    });
    expect(result).toBeNull();
  });

  it('findAll — возвращает пагинированный результат', async () => {
    const dto: ReviewPaginationDto = {
      page: 1,
      limit: 10,
    };

    const items = [mockReview];

    repo.findAndCount.mockResolvedValue([items, 1]);

    const result = await service.findAll(dto);

    expect(repo.findAndCount).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      order: { createdAt: 'DESC' },
    });

    expect(result).toEqual({
      items,
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });

  it('removeByHash — удаляет review если найден', async () => {
    repo.delete.mockResolvedValue({ affected: 1 });

    const result = await service.removeByHash(fileHash);

    expect(repo.delete).toHaveBeenCalledWith({ fileHash });
    expect(result).toEqual({ deleted: true });
  });

  it('removeByHash — бросает NotFoundException если не найден', async () => {
    repo.delete.mockResolvedValue({ affected: 0 });

    await expect(
      service.removeByHash('nonexistent'),
    ).rejects.toThrow(NotFoundException);

    expect(repo.delete).toHaveBeenCalledWith({
      fileHash: 'nonexistent',
    });
  });

  it('removeByFilePath — удаляет review если найден', async () => {
    repo.delete.mockResolvedValue({ affected: 1 });

    const result = await service.removeByFilePath(filePath);

    expect(repo.delete).toHaveBeenCalledWith({ filePath });
    expect(result).toEqual({ deleted: true });
  });

  it('removeByFilePath — бросает NotFoundException если не найден', async () => {
    repo.delete.mockResolvedValue({ affected: 0 });

    await expect(
      service.removeByFilePath('nonexistent/path'),
    ).rejects.toThrow(NotFoundException);

    expect(repo.delete).toHaveBeenCalledWith({
      filePath: 'nonexistent/path',
    });
  });
});