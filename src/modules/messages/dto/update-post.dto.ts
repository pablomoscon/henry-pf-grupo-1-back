import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { MessageType } from 'src/enums/message-type';

export class UpdatePostDto extends PartialType(CreatePostDto) { 

    @ApiProperty({ description: 'Type of the message', example: 'CHAT' })
    @IsEnum(MessageType)
    @IsOptional() 
    type?: MessageType;
}


