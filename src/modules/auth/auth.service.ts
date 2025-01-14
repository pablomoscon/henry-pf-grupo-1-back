import { BadRequestException, HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import { SignInAuthDto } from "./dto/signin-auth.dto";
import * as bcrypt from 'bcrypt';
import { SignupAuthDto } from "./dto/signup-auth.dto";
import { UsersService } from '../users/users.service';
import { CredentialsService } from "../credentials/credentials.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { CreateCredentialDto } from "../credentials/dto/create-credential.dto";
import { Credential } from "../credentials/entities/credential.entity";

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

    const { email, name, phone, birthdate, role, password } = signUpUser;

    const createCredentialsDto: CreateCredentialDto = { password };
    const credential: Credential = await this.credentialsService.create(createCredentialsDto);

    const createUserDto: CreateUserDto = {
      email,
      name,
      phone,
      birthdate,
      ...(role && { role }),
    };

    const userWithCredentials = await this.usersService.create(createUserDto, credential);

    await this.credentialsService.assignUserToCredentials(credential.id, { user: userWithCredentials });

    return userWithCredentials;
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