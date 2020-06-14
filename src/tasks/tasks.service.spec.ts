import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task.status.enum';
import { NotFoundException } from '@nestjs/common';

const mockUser = {
  username: 'Test user 1',
  id: 22,
};

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

describe('TasksService', () => {
  let taskService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile();

    taskService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('get task from the repository', async () => {
      taskRepository.getTasks.mockResolvedValue('some value');

      expect(taskRepository.getTasks).not.toHaveBeenCalled();

      const filters: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'search query',
      };
      const result = await taskService.getTasks(filters, mockUser);
      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('some value');
    });
  });

  describe('getTaskById', () => {
    it('should call taskRepository.findOne() and successfully return a task', async () => {
      const mockTest = { title: 'title', description: 'description' };
      taskRepository.findOne.mockResolvedValue(mockTest);
      const result = await taskService.getTaskById(1, mockUser);
      expect(result).toBe(mockTest);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          userId: mockUser.id,
        },
      });
    });

    it('throws an error when a task is not found', () => {
      taskRepository.findOne.mockResolvedValue(null);
      expect(taskService.getTaskById(1, mockUser)).rejects.toThrow();
    });
  });

  describe('createTask', () => {
    it('should call taskRepository.createTask() and successfully return the new created task', async () => {
      expect(taskRepository.createTask).not.toHaveBeenCalled();

      const mockNewTask = {
        title: 'test title 2',
        description: 'test description 2',
      };
      taskRepository.createTask.mockResolvedValue(mockNewTask);

      const result = await taskService.createTask(mockNewTask, mockUser);
      expect(taskRepository.createTask).toHaveBeenCalled();
      expect(taskRepository.createTask).toHaveBeenCalledWith(
        mockNewTask,
        mockUser,
      );
      expect(result).toBe(mockNewTask);
    });
  });

  describe('deleteTask', () => {
    it('should call taskRepository.deleteTask() to delete a task', async () => {
      expect(taskRepository.delete).not.toHaveBeenCalled();
      taskRepository.delete.mockResolvedValue({ affected: 1 });

      await taskService.deleteTask(1, mockUser);
      expect(taskRepository.delete).toHaveBeenCalled();
      expect(taskRepository.delete).toHaveBeenCalledWith({
        id: 1,
        userId: mockUser.id,
      });
    });

    it('throws an exception when no task is deleted ', () => {
      expect(taskRepository.delete).not.toHaveBeenCalled();
      taskRepository.delete.mockResolvedValue({ affected: 0 });

      expect(taskService.deleteTask(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateTask', () => {
    it('update the task status', async () => {
      const save = jest.fn().mockResolvedValue(true)
      taskService.getTaskById = jest.fn().mockResolvedValue({
        status: TaskStatus.OPEN,
        save
      });

      expect(taskService.getTaskById).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
      const result = await taskService.updateTaskStatus(1, TaskStatus.IN_PROGRESS, mockUser)
      expect(taskService.getTaskById).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
      expect(result.status).toEqual(TaskStatus.IN_PROGRESS);
    });
  });
});
