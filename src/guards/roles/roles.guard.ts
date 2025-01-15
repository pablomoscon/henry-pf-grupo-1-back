import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from 'src/enums/roles.enum';


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass()
    ]);

    const request = context.switchToHttp().getRequest();
    const user = request.user
    const hasRole = () => requiredRoles.includes(user.role);
    const valid = user?.role && hasRole();
    if (!valid) {
      throw new UnauthorizedException(
        'You do not have permission to access this route'
      );
    }
    return valid;
  };
}
