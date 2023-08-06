import { IsEnum, IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { TodoStatus } from './todo-status.enum';

export class UpdateTodoDto {
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  source: number;

  @IsInt()
  target: number;

  @IsEnum(TodoStatus)
  status: TodoStatus;
}
