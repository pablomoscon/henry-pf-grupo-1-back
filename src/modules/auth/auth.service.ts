import { BadRequestException, forwardRef, HttpException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
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
import * as jwt from 'jsonwebtoken';
import { MailService } from '../mail/mail.service';
import { CaretakerSignupAuthDto } from "./dto/caretaker-signup-auth.dto";
import { CaretakersService } from "../caretakers/caretakers.service";
import { Caretaker } from "../caretakers/entities/caretaker.entity";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly credentialsService: CredentialsService,
    private readonly jwtService: JwtService,
    private readonly caretakersService: CaretakersService,
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

    this.mailService.sendSuccessfulregistration(newUser)

    return newUser;
  };

  async signIn(signInAuthDto: SignInAuthDto) {

    const { email, password } = signInAuthDto;

    const credential = await this.usersService.findCredentialByEmail(email);

    if (!credential) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await this.credentialsService.validatePassword(credential.id, password);

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
      };

      const createUserDto: CreateUserDto = {
        email: userInfo.email,
        name: userInfo.name,
        phone: userInfo.phoneNumbers?.[0]?.value,
        address: userInfo.addresses?.[0]?.value,
        customerId: userInfo.customerId,
      };

      user = await this.usersService.create(createUserDto);

      const credential = await this.credentialsService.createGoogleCredential(createCredentialsDto, user);

      
    }

    const token = await this.createToken(user);

    return { token, user };
  };

  async verifyToken(token: string): Promise<string> {
    try {
      console.log("Verificando token:", token);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token decodificado correctamente:", decoded);
      return decoded['userId'];
    } catch (err) {
      console.error("Error en la verificación del token:", err);
      throw new UnauthorizedException('Token is expired or invalid.');
    }
  };

  async caretakerSignUp(caretakerSignupAuthDto: CaretakerSignupAuthDto): Promise<Caretaker> {
    const { email, password, confirmPassword, name, phone, address, customerId, role, profileData } = caretakerSignupAuthDto;

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

    return caretaker
  };
}
