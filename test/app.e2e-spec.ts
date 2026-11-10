import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module.js';

describe('Reviews (e2e)', () => {
  let app: INestApplication;

  const createReviewDto = {
    fileHash: `sha256:test-${Date.now()}`,
    filePath: 'src/Components/ui/PeriodNavigationUI/PeriodNavigationUI.tsx',
    reviewText: 'Test review text',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/reviews — creates a review', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/reviews')
      .send(createReviewDto)
      .expect(201);

    expect(response.body).toMatchObject({
      fileHash: createReviewDto.fileHash,
      filePath: createReviewDto.filePath,
      reviewText: createReviewDto.reviewText,
    });

    expect(response.body.id).toBeDefined();
    expect(response.body.createdAt).toBeDefined();
    expect(response.body.updatedAt).toBeDefined();
  });

  it('GET /api/reviews/hash/:fileHash — returns review by hash', async () => {
    const dto = {
      fileHash: `sha256:test-${Date.now()}-${Math.random()}`,
      filePath: 'src/Components/ui/PeriodNavigationUI/PeriodNavigationUI.tsx',
      reviewText: 'Test review text',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/api/reviews')
      .send(dto)
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/api/reviews/hash/${dto.fileHash}`)
      .expect(200);

    expect(response.body.id).toBe(createResponse.body.id);
    expect(response.body.fileHash).toBe(dto.fileHash);
    expect(response.body.reviewText).toBe(dto.reviewText);
  });

  it('GET /api/reviews/file?filePath=... — returns review by file path', async () => {
    const dto = {
      fileHash: `sha256:test-${Date.now()}-${Math.random()}`,
      filePath: `src/Components/ui/PeriodNavigationUI/PeriodNavigationUI-${Date.now()}.tsx`,
      reviewText: 'Test review text',
    };

    await request(app.getHttpServer())
      .post('/api/reviews')
      .send(dto)
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/api/reviews/file')
      .query({ filePath: dto.filePath })
      .expect(200);

    expect(response.body.fileHash).toBe(dto.fileHash);
    expect(response.body.filePath).toBe(dto.filePath);
  });

  it('GET /api/reviews — returns paginated reviews', async () => {
    await request(app.getHttpServer())
      .post('/api/reviews')
      .send(createReviewDto)
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/api/reviews')
      .query({ page: 1, limit: 10 })
      .expect(200);

    expect(response.body).toHaveProperty('items');
    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('page', 1);
    expect(response.body).toHaveProperty('limit', 10);
    expect(response.body).toHaveProperty('totalPages');

    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items.length).toBeGreaterThan(0);
  });

  it('GET /api/reviews/hash/:fileHash — returns 404 for unknown hash', async () => {
    await request(app.getHttpServer())
      .get('/api/reviews/hash/unknown-hash')
      .expect(404);
  });

  it('GET /api/reviews/file?filePath=... — returns 404 for unknown path', async () => {
    await request(app.getHttpServer())
      .get('/api/reviews/file')
      .query({ filePath: 'unknown/path.tsx' })
      .expect(404);
  });

  it('POST /api/reviews — returns 400 for invalid payload', async () => {
    await request(app.getHttpServer())
      .post('/api/reviews')
      .send({
        fileHash: '',
        filePath: '',
        reviewText: '',
      })
      .expect(400);
  });
});