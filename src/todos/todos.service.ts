import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { Todo } from './enitites/todo.entity';
// import { Todo } from './todos.interface';
// import { CreateTodoDto } from './dto/create-todo.dto';
import { InjectRepository } from '@nestjs/typeorm';
// import { Todo } from './enitites/todo.entity';
import { Repository } from 'typeorm';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { UsersService } from 'src/users/users.service';
import { TodoStatus } from './dto/todo-status.enum';
import { todo } from 'node:test';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo) private readonly repoService: Repository<Todo>,
    private userService: UsersService,
  ) {}

  async createTask(id: number, createTodoDto: CreateTodoDto) {
    const user = await this.userService.getUser(id);
    console.log('User details:', user);
    if (!user) {
      throw new BadRequestException('The user is not registered.');
    }
    const newData = {
      ...createTodoDto,
      fromUser: id,
    };
    console.log(newData);

    return this.repoService.save(newData);
  }
  //  get all tasks created by a user.
  async getAllTodos(id: number) {
    return this.repoService.find({
      where: { fromUser: id },
      select: ['id', 'content', 'position', 'status'],
      order: {
        position: 'ASC',
      },
    });
  }

  //  get all task of a user in specific status

  async getTaskFromStatus(id: number, status: TodoStatus) {
    return this.repoService.find({
      where: { fromUser: id, status: status },
      select: ['id', 'content', 'position'],
      order: {
        position: 'ASC',
      },
    });
  }

  async dragTodos(
    userId: number,
    updateTodoDto: UpdateTodoDto,
  ): Promise<Todo[]> {
    const { id, position, status } = updateTodoDto;
    const todos = await this.repoService.find({
      where: { fromUser: userId },
      order: { position: 'ASC' },
    });

    const todoToDrag = todos.find((todo) => todo.id === id);

    if (!todoToDrag) {
      throw new Error('Todo not found.');
    }
    if (todoToDrag.status !== status) {
      todoToDrag.status = updateTodoDto.status;
    }

    const updatedTodos = todos.filter(
      (todo) => todo.id !== id && todo.status === status,
    );
    updatedTodos.splice(position - 1, 0, todoToDrag);

    for (let i = 0; i < updatedTodos.length; i++) {
      if (updatedTodos[i].id === id) {
        updatedTodos[i].position = position;
      } else if (updatedTodos[i].position !== i + 1) {
        updatedTodos[i].position = i + 1;
      }
    }
    await this.repoService.save(updatedTodos);

    return this.getTaskFromStatus(userId, status);
  }
}
