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
      select: ['id', 'content', 'status'],
    });
  }

  //   //  get all task of a user in specific status

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
    const { source, target, status } = updateTodoDto;
    const todos = await this.repoService.find({
      where: { fromUser: userId },
      order: {
        position: 'ASC',
      },
    });

    const todoToDrag = todos.find((todo) => todo.id === source);
    const targetedTodo = todos.find((todo) => todo.id === target);

    if (!todoToDrag) {
      throw new BadRequestException(
        'The selected task for dragging is not valid.',
      );
    }
    if (todoToDrag.status !== status) {
      todoToDrag.status = updateTodoDto.status;
    }

    const updatedTodos = todos.filter(
      (todo) => todo.id !== source && todo.status === status,
    );
    const remainingTodos = todos.filter(
      (todo) => todo.id !== source && todo.status !== status,
    );
    console.log(remainingTodos);

    if (targetedTodo) {
      const insertIndex = updatedTodos.indexOf(targetedTodo);
      updatedTodos.splice(
        insertIndex + (todoToDrag.position < targetedTodo.position ? 1 : 0),
        0,
        todoToDrag,
      );
      updatedTodos.forEach((todo, index) => {
        todo.position = index + 1;
      });
      remainingTodos.forEach((todo, index) => {
        todo.position = index + 1;
      });
      console.log(remainingTodos);

      await this.repoService.save(updatedTodos);
    } else {
      throw new BadRequestException(
        'You cannot drag the task in the given target.',
      );
    }
    return this.getTaskFromStatus(userId, status);
  }
}
