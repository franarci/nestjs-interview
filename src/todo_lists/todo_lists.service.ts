import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTodoListDto } from './dtos/create-todo_list';
import { UpdateTodoListDto } from './dtos/update-todo_list';
import { TodoList } from '../interfaces/todo_list.interface';
import { TodoItem } from '../interfaces/todo_item.interface';
import { CreateTodoItemDto } from './dtos/create-todo-item';
import { UpdateTodoItemDto } from './dtos/update-todo-item';
import { TodoGateway } from '../gateway/todo_gateway';

@Injectable()
export class TodoListsService {
  private todolists: TodoList[];
  private readonly todoGateway: TodoGateway;

  constructor(todoGateway: TodoGateway) {
    this.todoGateway = todoGateway;
    this.todolists = [];
  }

  all(): TodoList[] {
    return this.todolists;
  }
  //For testing purposes
  setTodoLists(todolists: TodoList[]): void {
    this.todolists = todolists;
  }
  get(id: number): TodoList {
    const todo = this.todolists.find((x) => x.id === Number(id));
    if (!todo) {
      throw new NotFoundException(`Todo list with ID ${id} not found`);
    }
    return todo;
  }

  create(dto: CreateTodoListDto): TodoList {
    if (!dto.name) {
      throw new BadRequestException('Todo list name is required');
    }

    const todoList: TodoList = {
      id: this.nextId(),
      name: dto.name,
      items: [],
    };

    this.todolists.push(todoList);
    return todoList;
  }

  update(id: number, dto: UpdateTodoListDto): TodoList {
    const todolist = this.get(id);

    todolist.name = dto.name ?? todolist.name;
    return todolist;
  }

  delete(id: number): void {
    const index = this.todolists.findIndex((x) => x.id === Number(id));
    if (index === -1) {
      throw new NotFoundException(`Todo list with ID ${id} not found`);
    }

    this.todolists.splice(index, 1);
  }

  getTodoItems(id: number): TodoItem[] {
    const list = this.get(id);
    return list.items;
  }

  addTodoItem(listid: number, dto: CreateTodoItemDto): TodoList {
    if (!dto.content) {
      throw new BadRequestException('Todo item content is required');
    }

    const list = this.get(listid);

    const item = {
      id: this.nextItemId(list.id),
      content: dto.content,
      completed: false,
    };

    list.items.push(item);
    return list;
  }

  updateTodoItem(
    listid: number,
    itemId: string,
    dto: UpdateTodoItemDto,
  ): TodoList {
    const list = this.get(listid);
    const id = parseInt(itemId);
    const index = list.items.findIndex((x) => x.id === id);
    if (index === -1) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    list.items[index] = {
      id,
      content: dto.content ?? list.items[index].content,
      completed: dto.completed ?? list.items[index].completed,
    };

    return list;
  }

  deleteTodoItem(listid: number, itemId: string): TodoList {
    const list = this.get(listid);
    const id = parseInt(itemId);
    const index = list.items.findIndex((x) => x.id === id);
    if (index === -1) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    list.items.splice(index, 1);
    return list;
  }

  private nextId(): number {
    const last = this.todolists.map((x) => x.id).sort((a, b) => b - a)[0];

    return last ? last + 1 : 1;
  }

  private nextItemId(todoListId: number): number {
    const list = this.get(todoListId);
    const last = list.items.map((x) => x.id).sort((a, b) => b - a)[0];

    return last ? last + 1 : 1;
  }

  async bulkUpdate(listId: number, userId: string): Promise<void> {
    const items = this.getTodoItems(listId);
    const total = items.length;

    for (let i = 0; i < total; i++) {
      await this.delay(1000);
      items[i].completed = true;
      this.updateTodoItem(listId, items[i].id.toString(), {
        content: items[i].content,
        completed: true,
      });

      this.todoGateway.sendProgress(userId, { progress: i + 1, total });
    }

    this.todoGateway.sendProgress(userId, { progress: total, total });
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
