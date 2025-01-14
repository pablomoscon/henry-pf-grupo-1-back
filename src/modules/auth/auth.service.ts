import { BadRequestException, HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import { SignInAuthDto } from "./dto/signin-auth.dto";
import * as bcrypt from 'bcrypt';
import { SignupAuthDto } from "./dto/signup-auth.dto";
import { UsersService } from '../users/users.service';
import { CredentialsService } from "../credentials/credentials.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly credentialsService: CredentialsService,
  ) { }

  async signUp(signUpUser: SignupAuthDto) {
    if (signUpUser.password !== signUpUser.confirmPassword) {
      throw new HttpException('Password do not match', 400);
    }
    
    const user = await this.usersService.findByEmail(signUpUser.email);
    if (user) {
      throw new BadRequestException('User already exists');
    }

    const createdUser = await this.usersService.create(signUpUser);

    const credentialDto = { password: signUpUser.password };
    const credential = await this.credentialsService.create(credentialDto, createdUser.id);

    createdUser.credential = credential;

    return createdUser;
  };

  async signIn(signInAuthDto: SignInAuthDto) {
    const { email, password } = signInAuthDto;
    
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isValidPassword = await bcrypt.compare(password, user.credential.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return user;
    
  };
}