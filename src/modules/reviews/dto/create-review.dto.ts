import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Max, Min } from "class-validator";
import { User } from "src/modules/users/entities/user.entity";

export class CreateReviewDto {
    @ApiProperty({
        description: 'Text of the review',
        example: 'This product is excellent. I highly recommend it.',
    })
    @IsNotEmpty({ message: 'The review text cannot be empty.' })
    @IsString({ message: 'The review text must be a string.' })
    body: string;

    @ApiProperty({
        description: 'Rating given by the user (between 1 and 5)',
        example: 4,
    })
    @IsNotEmpty({ message: 'The rating cannot be empty.' })
    @IsNumber({}, { message: 'The rating must be a number.' })
    @Min(1, { message: 'The minimum rating is 1.' })
    @Max(5, { message: 'The maximum rating is 5.' })
    calification: number;

    @ApiProperty({
        description: 'User who submitted the review',
        type: () => User,
    })
    @IsNotEmpty({ message: 'The user cannot be empty.' })
    userId: string;
}