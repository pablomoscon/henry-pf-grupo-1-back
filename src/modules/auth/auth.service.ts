import { BadRequestException, HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import { SignInAuthDto } from "./dto/signin-auth.dto";
import * as bcrypt from 'bcrypt';
import { SignupAuthDto } from "./dto/signup-auth.dto";
import { UsersService } from '../users/users.service';
import { CredentialsService } from "../credentials/credentials.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { CreateCredentialDto } from "../credentials/dto/create-credential.dto";
import { Credential } from "../credentials/entities/credential.entity";
import { User } from "../users/entities/user.entity";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly credentialsService: CredentialsService,
    private readonly jwtService: JwtService,
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

    if (!user) {
      throw new BadRequestException('Invalid credentials')
    };
    const isPasswordValid = await bcrypt.compare(password, user.credential.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials')
    };
    return await this.createToken(user)
  };

  private async createToken(user: User) {
    const payload = {
      sub: user.id,
      id: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.signAsync(payload)
  };
}