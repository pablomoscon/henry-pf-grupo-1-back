import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let mockReflector: Partial<Reflector>;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: jest.fn(),
    };
    rolesGuard = new RolesGuard(mockReflector as Reflector);
  });

  it('should be defined', () => {
    expect(rolesGuard).toBeDefined();
  });
});