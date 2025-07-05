import { Test, TestingModule } from '@nestjs/testing';
import { TodoListsController } from './todo_lists.controller';
import { TodoListsService } from './todo_lists.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TodoGateway } from 'src/gateway/todo_gateway';

describe('TodoListsController', () => {
  let todoListsController: TodoListsController;
  let todoListService: TodoListsService;
  let mockTodoGateway: TodoGateway;

  beforeEach(async () => {
    mockTodoGateway = {
      server: {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as any,
      sendProgress: jest.fn(),
      handleConnection: jest.fn(),
    };

    todoListService = new TodoListsService(mockTodoGateway);

    todoListService.setTodoLists([
      { id: 1, name: 'list1', items: [] },
      { id: 2, name: 'list2', items: [] },
    ]);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoListsController],
      providers: [{ provide: TodoListsService, useValue: todoListService }],
    }).compile();

    todoListsController = module.get<TodoListsController>(TodoListsController);
  });

  describe('index', () => {
    it('should return all todo lists', () => {
      expect(todoListsController.index()).toEqual(todoListService.all());
    });
  });

  describe('show', () => {
    it('should return a list by ID', () => {
      expect(todoListsController.show({ todoListId: 1 })).toEqual(
        todoListService.get(1),
      );
    });

    it('should throw if list not found', () => {
      expect(() => todoListsController.show({ todoListId: 999 })).toThrowError(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new list', () => {
      const result = todoListsController.create({ name: 'new list' });
      expect(result.name).toBe('new list');
      expect(todoListService.all().length).toBe(3);
    });

    it('should throw if name is missing', () => {
      expect(() => todoListsController.create({ name: '' })).toThrowError(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update the list name', () => {
      const result = todoListsController.update(
        { todoListId: 1 },
        { name: 'updated' },
      );
      expect(result.name).toBe('updated');
    });

    it('should throw if list not found', () => {
      expect(() =>
        todoListsController.update({ todoListId: 999 }, { name: 'x' }),
      ).toThrowError(NotFoundException);
    });

    it('should keep original name if dto.name is null', () => {
      const original = todoListService.get(1);
      const result = todoListService.update(1, { name: null });
      expect(result.name).toBe(original.name);
    });
  });

  describe('delete', () => {
    it('should delete the list', () => {
      todoListsController.delete({ todoListId: 1 });
      expect(todoListService.all().length).toBe(1);
    });

    it('should throw if list not found', () => {
      expect(() =>
        todoListsController.delete({ todoListId: 999 }),
      ).toThrowError(NotFoundException);
    });
  });

  describe('showTodoItems', () => {
    it('should return items for a list', () => {
      expect(todoListsController.showTodoItems({ todoListId: 1 })).toEqual([]);
    });

    it('should throw if list not found', () => {
      expect(() =>
        todoListsController.showTodoItems({ todoListId: 999 }),
      ).toThrowError(NotFoundException);
    });
  });

  describe('addTodoItem', () => {
    it('should add item to list', () => {
      const result = todoListsController.addTodoItem(
        { todoListId: 1 },
        { content: 'task' },
      );
      expect(result.items.length).toBe(1);
      expect(result.items[0].content).toBe('task');
    });

    it('should throw if content is missing', () => {
      expect(() =>
        todoListsController.addTodoItem({ todoListId: 1 }, { content: '' }),
      ).toThrowError(BadRequestException);
    });

    it('should throw if list not found', () => {
      expect(() =>
        todoListsController.addTodoItem({ todoListId: 999 }, { content: 'x' }),
      ).toThrowError(NotFoundException);
    });
  });

  describe('updateTodoItem', () => {
    beforeEach(() => {
      todoListsController.addTodoItem(
        { todoListId: 1 },
        { content: 'original' },
      );
    });

    it('should update an item', () => {
      const result = todoListsController.updateTodoItem(
        { todoListId: 1, itemId: '1' },
        { content: 'updated', completed: true },
      );
      expect(result.items[0].content).toBe('updated');
      expect(result.items[0].completed).toBe(true);
    });

    it('should throw if list not found', () => {
      expect(() =>
        todoListsController.updateTodoItem(
          { todoListId: 999, itemId: '1' },
          { content: 'x', completed: true },
        ),
      ).toThrowError(NotFoundException);
    });

    it('should throw if item not found', () => {
      expect(() =>
        todoListsController.updateTodoItem(
          { todoListId: 1, itemId: '999' },
          { content: 'x', completed: true },
        ),
      ).toThrowError(NotFoundException);
    });

    it('should keep original content and completed if dto.content and dto.completed are null', () => {
      const original = todoListService.get(1).items[0];
      const result = todoListService.updateTodoItem(1, '1', {
        content: null,
        completed: null,
      });
      expect(result.items[0].content).toBe(original.content);
      expect(result.items[0].completed).toBe(original.completed);
    });
  });

  describe('deleteTodoItem', () => {
    beforeEach(() => {
      todoListsController.addTodoItem(
        { todoListId: 1 },
        { content: 'to delete' },
      );
    });

    it('should delete an item', () => {
      const result = todoListsController.deleteTodoItem({
        todoListId: 1,
        itemId: '1',
      });
      expect(result.items).toEqual([]);
    });

    it('should throw if list not found', () => {
      expect(() =>
        todoListsController.deleteTodoItem({ todoListId: 999, itemId: '1' }),
      ).toThrowError(NotFoundException);
    });

    it('should throw if item not found', () => {
      expect(() =>
        todoListsController.deleteTodoItem({ todoListId: 1, itemId: '999' }),
      ).toThrowError(NotFoundException);
    });
  });

  describe('bulkUpdate', () => {
    it('should return status processing', () => {
      const spy = jest
        .spyOn(todoListService, 'bulkUpdate')
        .mockImplementation();

      const result = todoListsController.bulkUpdate(1, 'user123');

      expect(result).toEqual({ status: 'processing' });
      expect(spy).toHaveBeenCalledWith(1, 'user123');
    });

    it('should throw NotFoundException if list does not exist', () => {
      jest.spyOn(todoListService, 'bulkUpdate').mockImplementation(() => {
        throw new NotFoundException();
      });

      expect(() => todoListsController.bulkUpdate(999, 'user123')).toThrowError(
        NotFoundException,
      );
    });
  });
});
