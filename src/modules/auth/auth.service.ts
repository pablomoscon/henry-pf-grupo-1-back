import {
  BadRequestException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInAuthDto } from './dto/signin-auth.dto';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { UsersService } from '../users/users.service';
import { CredentialsService } from '../credentials/credentials.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateCredentialDto } from '../credentials/dto/create-credential.dto';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { oauth2Client } from 'src/config/google-auth.config';
import * as jwt from 'jsonwebtoken';
import { MailService } from '../mail/mail.service';
import { CaretakerSignupAuthDto } from './dto/caretaker-signup-auth.dto';
import { CaretakersService } from '../caretakers/caretakers.service';
import { Caretaker } from '../caretakers/entities/caretaker.entity';
import { SigninResponseDto } from './response-singin.dto';
import { GoogleSignUpResponse, GoogleUserInfo } from './interfaces/google.interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly credentialsService: CredentialsService,
    private readonly jwtService: JwtService,
    private readonly caretakersService: CaretakersService,
    private readonly mailService: MailService,
  ) { }

  async signUp(signUpUser: SignupAuthDto): Promise<User> {
    if (signUpUser.password !== signUpUser.confirmPassword) {
      throw new HttpException('Password do not match', 400);
    }

    const user = await this.usersService.findByEmail(signUpUser.email);
    if (user) {
      throw new BadRequestException('User already exists');
    }

    const { email, name, phone, address, customerId, role, password } =
      signUpUser;

    const createUserDto: CreateUserDto = {
      email,
      name,
      phone,
      address,
      customerId,

      ...(role && { role }),
    };

    const newUser: User = await this.usersService.create(createUserDto);

    const createCredentialsDto: CreateCredentialDto = { password };

    await this.credentialsService.create(createCredentialsDto, newUser);

    return newUser;
  };

  async clientSignUp(signupAuthDto: SignupAuthDto) {
    const newUser = await this.signUp(signupAuthDto);

    this.mailService.sendSuccessfulregistration(newUser);

    return newUser;
  };

  async signIn(signInAuthDto: SignInAuthDto): Promise<SigninResponseDto> {
    const { email, password } = signInAuthDto;

    const credential = await this.usersService.findCredentialByEmail(email);

    if (!credential) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await this.credentialsService.validatePassword(
      credential.id,
      password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const user = credential.user;

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

  async createToken(user: User) {
    return this.jwtService.signAsync({
      sub: user.id,
      ...user, 
    });
  };

  async getUserInfo(code: string): Promise<GoogleUserInfo> {
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens) {
      throw new Error('No tokens received');
    }
    oauth2Client.setCredentials(tokens);

    const [userInfoData] = await Promise.all([
      oauth2Client
        .request({ url: 'https://www.googleapis.com/oauth2/v3/userinfo' })
        .then((res) => res.data),
    ]);

    return { ...(userInfoData as GoogleUserInfo) };
  };

  async googleSignUp(code: string): Promise<GoogleSignUpResponse> {
    try {
      const userInfo = await this.getUserInfo(code);
      let user = await this.usersService.findByEmail(userInfo.email);

      if (!user) {
        user = await this.usersService.create({
          email: userInfo.email,
          name: userInfo.name,
        });

        const credential = await this.credentialsService.createGoogleCredential(
          { googleId: userInfo.sub },
          user
        );

        this.mailService.sendPasswordChangeAlert(user, credential);
      }

      return { token: await this.createToken(user), user };
    } catch (error) {
      console.error('Error in googleSignUp:', error);
      throw error;
    }
  };


  async verifyToken(token: string): Promise<string> {
    try {
      console.log('Verifying token:', token);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', decoded);
      return decoded['userId'];
    } catch (err) {
      console.error('Error verifying token:', err);
      throw new UnauthorizedException('Token is expired or invalid.');
    }
  };

  async caretakerSignUp(
    caretakerSignupAuthDto: CaretakerSignupAuthDto,
  ): Promise<Caretaker> {
    const {
      email,
      password,
      confirmPassword,
      name,
      phone,
      address,
      customerId,
      role,
      profileData,
    } = caretakerSignupAuthDto;

    const user = await this.signUp({
      email,
      password,
      confirmPassword,
      name,
      phone,
      address,
      customerId,
      role,
    });

    const caretaker = await this.caretakersService.create({
      userId: user.id,
      profileData,
    });

    return caretaker;
  }
}

