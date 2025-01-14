import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInAuthDto, } from './dto/signin-auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { SignupAuthDto } from './dto/signup-auth.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpAuthDto: SignupAuthDto) {
    const user = await this.authService.signUp(signUpAuthDto);
    return { user,
      message: 'User successfully registered',
    };
  };

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async authLogin(@Body() signInAuthDto: SignInAuthDto) {
      const user = await this.authService.signIn(signInAuthDto);
    return {
      message: 'Login successful'
      };
  };
}
