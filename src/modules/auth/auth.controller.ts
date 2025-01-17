import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Res, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInAuthDto, } from './dto/signin-auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { Response } from 'express';
import { oauth2Client } from 'src/config/google-auth.config';
import { AuthResponseDto } from './dto/response-auth.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpAuthDto: SignupAuthDto) {
    const user = await this.authService.signUp(signUpAuthDto);
    return new AuthResponseDto(user)
  };

@Post('login')
@HttpCode(HttpStatus.OK)
async authLogin(@Body() signInAuthDto: SignInAuthDto) {
  const response = await this.authService.signIn(signInAuthDto);
  return {
    success: 'Login successful',
    response
  };
};

@Get('google')
redirectToGoogle(@Res() res: Response) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/user.birthday.read',
      'https://www.googleapis.com/auth/user.phonenumbers.read',
    ],
  });
  res.redirect(authUrl);
};

@Get('google/callback')
async handleGoogleCallback(@Query('code') code: string, @Res() res: Response) {
  const token = await this.authService.googleSignUp(code);
  res.json({
    message: 'User successfully registered or logged in via Google',
    token,
  });
};
}

