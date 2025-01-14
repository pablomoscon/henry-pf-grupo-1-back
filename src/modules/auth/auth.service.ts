import { BadRequestException, HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import { SignInAuthDto } from "./dto/signin-auth.dto";
import * as bcrypt from 'bcrypt';
import { SignupAuthDto } from "./dto/signup-auth.dto";
import { UsersService } from '../users/users.service';
import { CredentialsService } from "../credentials/credentials.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { CreateCredentialDto } from "../credentials/dto/create-credential.dto";

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

    const { email, name, phone, birthdate, role } = signUpUser;

    const createUserDto: CreateUserDto = {
      email,
      name,
      phone,
      birthdate,
      ...(role && { role }),
    };

    const createdUser = await this.usersService.create(createUserDto);

    const createCredentialDto: CreateCredentialDto = { password: signUpUser.password };
    const credential = await this.credentialsService.create(createCredentialDto, createdUser.id);

    createdUser.credential = credential;

    return await this.usersService.update(createdUser.id, createdUser);
  };

  async signIn(signInAuthDto: SignInAuthDto) {
    const { email, password } = signInAuthDto;

    const user = await this.usersService.findByEmail(email);
    const errorMessage = 'Invalid email or password';
    if (!user || !(await bcrypt.compare(password, user.credential.password))) {
      throw new UnauthorizedException(errorMessage);
    }
    return user;
  };
}