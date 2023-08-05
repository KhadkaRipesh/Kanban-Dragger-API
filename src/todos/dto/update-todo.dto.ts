import { IsEnum, IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { TodoStatus } from './todo-status.enum';

export class UpdateTodoDto {
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  id: number;

  @IsEnum(TodoStatus, { message: 'Invalid status' })
  status: TodoStatus;
}
