import { BadRequestException, HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import { SignInAuthDto } from "./dto/signin-auth.dto";
import { SignupAuthDto } from "./dto/signup-auth.dto";
import { UsersService } from '../users/users.service';
import { CredentialsService } from "../credentials/credentials.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { CreateCredentialDto } from "../credentials/dto/create-credential.dto";
import { Credential } from "../credentials/entities/credential.entity";
import { User } from "../users/entities/user.entity";
import { JwtService } from "@nestjs/jwt";
import { oauth2Client } from "src/config/google-auth.config";
import * as crypto from 'crypto';
import { MailService } from "../mail/mail.service";
import { Role } from "src/enums/roles.enum";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly credentialsService: CredentialsService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) { }

  async signUp(signUpUser: SignupAuthDto) {
    if (signUpUser.password !== signUpUser.confirmPassword) {
      throw new HttpException('Password do not match', 400);
    }

    const user = await this.usersService.findByEmail(signUpUser.email);
    if (user) {
      throw new BadRequestException('User already exists');
    }

    const { email, name, phone, address, customerId, role, password } = signUpUser;

    const createCredentialsDto: CreateCredentialDto = { password };
    const credential: Credential = await this.credentialsService.create(createCredentialsDto);

    const createUserDto: CreateUserDto = {
      email,
      name,
      phone,
      address,
      customerId,

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
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await this.credentialsService.validatePassword(user.credential.id, password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }
    const token = await this.createToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        address: user.address,
        customerId: user.customerId,
      },
    };
  };

  private async createToken(user: User) {
    const payload = {
      sub: user.id,
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      address: user.address,
      customerId: user.customerId,
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
      oauth2Client.request({
        url: 'https://people.googleapis.com/v1/people/me?personFields=phoneNumbers,addresses'
      }).then(res => res.data),
    ]);

    return { ...(userInfoData as object), ...(peopleData as object) };
  };

  async googleSignUp(code: string): Promise<any> {
    const userInfo = await this.getUserInfo(code);
    let user: User = await this.usersService.findByEmail(userInfo.email);

    if (!user) {
      const createCredentialsDto: CreateCredentialDto = {
        googleId: userInfo.sub,
        password: crypto.randomBytes(16).toString('hex')
      };

      const credential: Credential = await this.credentialsService.createGoogleCredential(createCredentialsDto);

      const createUserDto: CreateUserDto = {
        email: userInfo.email,
        name: userInfo.name,
        phone: userInfo.phoneNumbers?.[0]?.value,
        address: userInfo.addresses?.[0]?.value,
        customerId: userInfo.customerId,
        role: Role.USER
      };
      user = await this.usersService.create(createUserDto, credential);
      await this.credentialsService.assignUserToCredentials(credential.id, { user });
      
      this.mailService.sendPasswordChangeAlert(user)

    }
    const token = await this.createToken(user);
    return { token, user };
  };
}
