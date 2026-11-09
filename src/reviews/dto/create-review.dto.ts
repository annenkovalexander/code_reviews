import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(64)
  fileHash: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1024)
  filePath: string;

  @IsString()
  @IsNotEmpty()
  reviewText: string;
}