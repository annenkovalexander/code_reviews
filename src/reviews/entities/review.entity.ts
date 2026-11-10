import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reviews')
@Index(['fileHash'])
@Index(['filePath'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64, name: 'file_hash' })
  fileHash: string;

  @Column({ type: 'text', name: 'file_path' })
  filePath: string;

  @Column({ type: 'text', name: 'review_text' })
  reviewText: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}