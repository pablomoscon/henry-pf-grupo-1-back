import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class ReviewsService {

  constructor(
    @InjectRepository(Review) private readonly reviewRepository: Repository<Review>,
  ) { } 

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const newReview = await this.reviewRepository.create(createReviewDto);
    return await this.reviewRepository.save(newReview);
  };

 async findAll(pageNumber: number, limitNumber: number) {
    return await this.reviewRepository.find({
      where: { deleted_at: IsNull() },
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      relations: ['user'],
    });
  };

  async findOne(id: string) {
    return await this.reviewRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  };

  async update(id: string, updateReviewDto: UpdateReviewDto) {
    await this.reviewRepository.update(id, updateReviewDto);
    return this.findOne(id);
  };

  async remove(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    review.deleted_at = new Date();
    return this.reviewRepository.save(review);
  };
}
