import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { UserContract } from '@app/contracts';
import { plainToInstance } from 'class-transformer';
import { User } from '../entities/user/user.entity';
import { CreateUserDto } from '@app/contracts';

@Injectable()
export class UserWriteService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserContract> {
    const { password, ...rest } = createUserDto;

    const passwordHash = await hash(password, 10);

    // TODO: Is create() correct here?
    const user = this.userRepository.create({
      ...rest,
      passwordHash,
    });
    const createResult = await this.userRepository.save(user);
    return plainToInstance(UserContract, createResult, {
      excludeExtraneousValues: true,
    });
  }
}
