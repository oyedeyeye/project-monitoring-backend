import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User, Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { resetPasswordToken: token },
      include: { profile: true },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const user = await this.prisma.user.create({
      data,
      include: { profile: true },
    });
    await this.cacheManager.clear();
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async findAll(params?: { page?: number; limit?: number; role?: Role }) {
    const page = params?.page || 1;
    const limit = params?.limit || 25;
    const skip = (page - 1) * limit;
    const role = params?.role;

    const where: Prisma.UserWhereInput = role ? { profile: { role } } : {};

    const data = await this.prisma.user.findMany({
      where,
      skip,
      take: limit,
      include: {
        profile: {
          include: {
            mda: true,
          },
        },
      },
    });

    const total = await this.prisma.user.count({ where });

    // Get latest progress updates by MDA
    const mdaUpdates = await this.prisma.progressUpdate.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        project: {
          select: { mdaId: true },
        },
      },
    });

    const latestUpdatesByMda = new Map<string, Date>();
    for (const update of mdaUpdates) {
      const mdaId = update.project?.mdaId;
      if (mdaId && !latestUpdatesByMda.has(mdaId)) {
        latestUpdatesByMda.set(mdaId, update.createdAt);
      }
    }

    const mappedData = data.map((user) => {
      let lastEditDate = user.profile?.updatedAt || user.updatedAt;
      if (user.profile?.mdaId) {
        const mdaLastUpdate = latestUpdatesByMda.get(user.profile.mdaId);
        if (mdaLastUpdate && mdaLastUpdate > lastEditDate) {
          lastEditDate = mdaLastUpdate;
        }
      }
      // Never expose the bcrypt hash or the reset-token digest over HTTP.
      const {
        passwordHash: _passwordHash,
        resetPasswordToken: _resetPasswordToken,
        resetPasswordExpires: _resetPasswordExpires,
        ...safeUser
      } = user;
      return {
        ...safeUser,
        lastEditActivityDate: lastEditDate,
      };
    });

    return {
      data: mappedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: { profile: true },
    });
    await this.cacheManager.clear();
    return user;
  }

  async remove(id: string): Promise<User> {
    const user = await this.prisma.user.delete({
      where: { id },
      include: { profile: true },
    });
    await this.cacheManager.clear();
    return user;
  }
}
