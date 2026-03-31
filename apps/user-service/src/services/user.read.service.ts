import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/user-service/src/entities/user/user.entity';
import { Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserLoginDto } from '@app/contracts';

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
}
