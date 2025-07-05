import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateTodoListDto } from './dtos/create-todo_list';
import { UpdateTodoListDto } from './dtos/update-todo_list';
import { TodoList } from '../interfaces/todo_list.interface';
import { TodoListsService } from './todo_lists.service';
import { TodoItem } from '../interfaces/todo_item.interface';
import { CreateTodoItemDto } from './dtos/create-todo-item';
import { UpdateTodoItemDto } from './dtos/update-todo-item';

@Controller('api/todolists')
export class TodoListsController {
  constructor(private todoListsService: TodoListsService) {}

  @Get()
  index(): TodoList[] {
    return this.todoListsService.all();
  }

  @Get('/:todoListId')
  show(@Param() param: { todoListId: number }): TodoList {
    return this.todoListsService.get(param.todoListId);
  }

  @Post()
  create(@Body() dto: CreateTodoListDto): TodoList {
    return this.todoListsService.create(dto);
  }

  @Put('/:todoListId')
  update(
    @Param() param: { todoListId: number },
    @Body() dto: UpdateTodoListDto,
  ): TodoList {
    return this.todoListsService.update(param.todoListId, dto);
  }

  @Delete('/:todoListId')
  delete(@Param() param: { todoListId: number }): void {
    this.todoListsService.delete(param.todoListId);
  }

  @Get('/:todoListId/items')
  showTodoItems(@Param() param: { todoListId: number }): TodoItem[] {
    return this.todoListsService.getTodoItems(param.todoListId);
  }

  @Post('/:todoListId/items')
  addTodoItem(
    @Param() param: { todoListId: number },
    @Body() dto: CreateTodoItemDto,
  ): TodoList {
    return this.todoListsService.addTodoItem(param.todoListId, dto);
  }

  @Put('/:todoListId/items/:itemId')
  updateTodoItem(
    @Param() param: { todoListId: number; itemId: string },
    @Body() dto: UpdateTodoItemDto,
  ): TodoList {
    return this.todoListsService.updateTodoItem(
      param.todoListId,
      param.itemId,
      dto,
    );
  }

  @Delete('/:todoListId/items/:itemId')
  deleteTodoItem(
    @Param() param: { todoListId: number; itemId: string },
  ): TodoList {
    return this.todoListsService.deleteTodoItem(param.todoListId, param.itemId);
  }

  @Post('/:todoListId/items/bulk-update')
     bulkUpdate(
    @Param('todoListId') todoListId: number,
    @Query('userId') userId: string, 
  ): { status: string } {
    this.todoListsService.bulkUpdate(todoListId, userId);
    return { status: 'processing' };
  }
}
