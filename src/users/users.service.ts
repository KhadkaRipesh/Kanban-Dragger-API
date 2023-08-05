import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
export type Users = any;
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const user = await this.userRepo.create(createUserDto);
    return this.userRepo.save(user);
  }

  async getUsers() {
    return this.userRepo.find();
  }

  async getUser(id: number): Promise<Users> {
    return this.userRepo.findOne({ where: { id: id } });
  }
}
