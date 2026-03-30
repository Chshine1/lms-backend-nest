import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { compare, hash } from 'bcrypt';
import { CreateUserDto, UserContract } from '@app/contracts';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserContract> {
    const { password, ...rest } = createUserDto;
    const passwordHash = await hash(password, 10);
    const user = this.userRepository.create({
      ...rest,
      passwordHash,
    });
    const createResult = await this.userRepository.save(user);
    return plainToInstance(UserContract, createResult, {
      excludeExtraneousValues: true,
    });
  }

  async findById(id: number): Promise<UserContract | null> {
    const findResult = await this.userRepository.findOne({ where: { id } });
    if (findResult === null) return null;
    return plainToInstance(UserContract, findResult, {
      excludeExtraneousValues: true,
    });
  }

  async validateUser(
    username: string,
    pass: string,
  ): Promise<UserContract | null> {
    const findResult = await this.userRepository.findOne({
      where: { username },
    });
    if (
      findResult === null ||
      !(await compare(pass, findResult.passwordHash))
    ) {
      return null;
    }
    return plainToInstance(UserContract, findResult, {
      excludeExtraneousValues: true,
    });
  }

  async findByTenant(tenantId: number): Promise<UserContract[]> {
    const findResult = await this.userRepository.find({ where: { tenantId } });
    return findResult.map((r: User) =>
      plainToInstance(UserContract, r, {
        excludeExtraneousValues: true,
      }),
    );
  }
}
