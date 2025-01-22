import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';

describe('AuthGuard', () => {
  let jwtService: JwtService;
  let authGuard: AuthGuard;

  beforeEach(() => {
    jwtService = new JwtService({}); 
    authGuard = new AuthGuard(jwtService);
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });
});