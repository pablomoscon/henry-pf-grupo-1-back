import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/modules/users/entities/user.entity'; // Importa la entidad User

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): User => {
        const request = ctx.switchToHttp().getRequest();
        return request.user; 
    },
);