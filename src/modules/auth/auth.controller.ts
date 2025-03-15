import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInAuthDto } from './dto/signin-auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { Response } from 'express';
import { SignupResponseDto } from './dto/response-signup.dto';
import { CaretakerSignupAuthDto } from './dto/caretaker-signup-auth.dto';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
import { GoogleAuthGuard } from 'src/guards/googleAuth/google-auth.guard';

dotenv.config();

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async clientSignUp(@Body() signUpAuthDto: SignupAuthDto) {
    const user = await this.authService.clientSignUp(signUpAuthDto);
    return new SignupResponseDto(user);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async authLogin(@Body() signInAuthDto: SignInAuthDto) {
    const response = await this.authService.signIn(signInAuthDto);
    return {
      success: 'Login successful',
      response,
    };
  }

  @Post('caretaker-signup')
  @HttpCode(HttpStatus.CREATED)
  async caretakerSignUp(
    @Body() caretakerSignUpAuthDto: CaretakerSignupAuthDto,
  ) {
    const caretakerUser = await this.authService.caretakerSignUp(
      caretakerSignUpAuthDto,
    );
    return caretakerUser;
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)  
  async redirectToGoogle(@Res() res: Response) {
  
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async handleGoogleCallback(@Req() req: Request, @Res() res: Response) {
    if (!req.user) {
      return res.status(400).json({ message: 'User not found in request' });
    }

    const { user, token } = req.user as { user: User, token: string };

    res.cookie('auth', JSON.stringify({ token, user }), {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 1000,
      sameSite: 'none',
    });

    res.redirect(`${process.env.FRONTEND_URL}/loading`);
  };

  @Get('me')
  async getAuthUser(@Req() req: Request) {

    cookieParser()(req, req.res, () => { });

    const authCookie = req.cookies['auth'];

    if (authCookie) {
        const { token, user } = JSON.parse(authCookie);
        return { token, user };
    } else {
      return { message: 'No auth cookie found' };
    }
  };
}
