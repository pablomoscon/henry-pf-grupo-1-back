import { Injectable, UnauthorizedException } from "@nestjs/common";
import { SignInAuthDto } from "./dto/signin-auth.dto";
import * as bcrypt from 'bcrypt';
import { User } from "../users/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }


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