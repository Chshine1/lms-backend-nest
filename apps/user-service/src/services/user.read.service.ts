import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/user-service/src/entities/user/user.entity';
import { In, Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserContract, UserLoginDto } from '@app/contracts';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserReadService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async userLogin(userLoginDto: UserLoginDto): Promise<string> {
    const user = await this.userRepository.findOne({
      where: { username: userLoginDto.username },
    });
    if (
      user === null ||
      !(await compare(userLoginDto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException();
    }
    const payload = {
      sub: user.id,
      tenant: user.tenantId,
      username: user.username,
      role: user.identityType,
    };
    return await this.jwtService.signAsync(payload);
  }

  async getUsers(ids: number[]): Promise<(UserContract | undefined)[]> {
    const users = await this.userRepository.find({
      where: { id: In(ids) },
    });
    return ids.map((id) => {
      const user = users.find((u) => u.id === id);
      if (user === undefined) return undefined;
      return plainToInstance(UserContract, user, {
        excludeExtraneousValues: true,
      });
    });
  }
}
