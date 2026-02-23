import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { hash, compare } from 'bcrypt';
import { UserContract } from '@app/contracts/user/entities/user.contract';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from '@app/contracts/user/dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserContract> {
    const { password, ...rest } = createUserDto;
    const hashedPassword = await hash(password, 10);
    const user = this.userRepository.create({
      ...rest,
      password: hashedPassword,
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
    if (findResult === null || !(await compare(pass, findResult.password))) {
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
