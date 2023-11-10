import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class TimestampableEntity {
  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;
}
