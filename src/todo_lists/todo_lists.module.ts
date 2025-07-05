import { Module } from '@nestjs/common';
import { TodoListsController } from './todo_lists.controller';
import { TodoListsService } from './todo_lists.service';
import { TodoGateway } from '../gateway/todo_gateway';

@Module({
  imports: [],
  controllers: [TodoListsController],
  providers: [TodoListsService, TodoGateway],
})
export class TodoListsModule {}
