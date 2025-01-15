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
import { oauth2Client } from "src/config/google-auth.config";

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

  async getUserInfo(code: string): Promise<any> {
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens) {
      throw new Error("No tokens received");
    }
    oauth2Client.setCredentials(tokens);

    const [userInfoData, peopleData] = await Promise.all([
      oauth2Client.request({ url: 'https://www.googleapis.com/oauth2/v3/userinfo' }).then(res => res.data),
      oauth2Client.request({ url: 'https://people.googleapis.com/v1/people/me?personFields=birthdays,phoneNumbers' }).then(res => res.data),
    ]);

    return { ...(userInfoData as object), ...(peopleData as object) };
  };

  async googleSignUp(code: string): Promise<any> {
    const userInfo = await this.getUserInfo(code);
    let user = await this.usersService.findByEmail(userInfo.email);

    if (!user) {
      const createCredentialsDto: CreateCredentialDto = {
        password: userInfo.sub,
      };

      const credential: Credential = await this.credentialsService.create(createCredentialsDto);

      const createUserDto: CreateUserDto = {
        email: userInfo.email,
        name: userInfo.name,
        birthdate: userInfo.birthdays?.[0]?.date
          ? new Date(
            userInfo.birthdays[0].date.year,
            userInfo.birthdays[0].date.month - 1,
            userInfo.birthdays[0].date.day
          )
          : null,
        phone: userInfo.phoneNumbers?.[0]?.value,
      };

      user = await this.usersService.create(createUserDto, credential);
      await this.credentialsService.assignUserToCredentials(credential.id, { user });
    }
    return await this.createToken(user)
  };
}