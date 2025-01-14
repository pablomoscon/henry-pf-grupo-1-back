import { BadRequestException, HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import { SignInAuthDto } from "./dto/signin-auth.dto";
import * as bcrypt from 'bcrypt';
import { User } from "../users/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SignupAuthDto } from "./dto/signup-auth.dto";
import { UsersService } from '../users/users.service';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly usersService: UsersService,
  ) { }


  async signUp(signUpUser: SignupAuthDto) {
    if (signUpUser.password !== signUpUser.confirmPassword) {
      throw new HttpException('Password do not match', 400)
    }
    const user = await this.usersService.findByEmail(signUpUser.email)
    if (user) {
      throw new BadRequestException('User already exists')
    }
    signUpUser.password = await bcrypt.hash(signUpUser.password, 10)
    return this.usersService.create(signUpUser);
  };


  async signIn(signInAuthDto: SignInAuthDto) {
    const { email, password } = signInAuthDto;
    
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['credential'],
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isValidPassword = await bcrypt.compare(password, user.credential.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return user;
    
  }
}