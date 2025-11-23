import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user = request.user;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!user || !user.sub) {
      throw new ForbiddenException('Access denied');
    }

    // Get user from database to check role
    const dbUser = await this.prisma.user.findUnique({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      where: { id: user.sub },
      select: { role: true, blockDate: true },
    });

    if (!dbUser) {
      throw new ForbiddenException('User not found');
    }

    // Check if user is blocked
    if (dbUser.blockDate && dbUser.blockDate > new Date()) {
      throw new ForbiddenException('Account is blocked');
    }

    // Check if user has admin role
    if (dbUser.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
