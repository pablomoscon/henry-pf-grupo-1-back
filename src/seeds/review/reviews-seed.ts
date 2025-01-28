import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { reviewsMock } from './reviews-mock';
import { UsersService } from 'src/modules/users/users.service';
import { Review } from 'src/modules/reviews/entities/review.entity';

@Injectable()
export class ReviewsSeed {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
        private readonly usersService: UsersService,  
    ) { }

    async seed() {
        const existingReviews = (await this.reviewRepository.find()).map(
            (review) => review.id,
        );

        for (const reviewData of reviewsMock) {
            if (!existingReviews.includes(reviewData.id)) {
                
                const review = new Review();
                review.id = reviewData.id;
                review.textBody = reviewData.textBody;
                review.rating = reviewData.rating;
                review.deleted_at = reviewData.deleted_at || null;

                const user = await this.usersService.findOne(reviewData.user.id);
                if (!user) {
                    console.error(`User with id ${reviewData.user.id} not found.`);
                    continue; 
                };

                review.user = user;

             
                await this.reviewRepository.save(review);
            }
        }
    };
}