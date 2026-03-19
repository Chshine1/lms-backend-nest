import { PermissionService } from './permission.service';
import { Repository } from 'typeorm';
import { Permission } from './permission.interface';

describe('PermissionService', () => {
  let permissionService: PermissionService;
  let permissionRepo: jest.Mocked<Repository<Permission>>;

  function createMockRepository(): jest.Mocked<Repository<Permission>> {
    return {
      find: jest.fn(),
    } as unknown as jest.Mocked<Repository<Permission>>;
  }

  function createPermissionService(
    repo: Repository<Permission>,
  ): PermissionService {
    return new PermissionService(repo);
  }

  function createMockPermission(
    userId: number,
    resource: number,
    action: number,
  ): Permission {
    return {
      userId,
      resource,
      action,
      createdAt: new Date(),
    };
  }

  beforeEach(() => {
    permissionRepo = createMockRepository();
    permissionService = createPermissionService(permissionRepo);
  });

  describe('getUserPermissions', () => {
    describe('when repository returns permissions', () => {
      it('should return user permissions', async () => {
        const userId = 123;
        const mockPermissions = [
          createMockPermission(userId, 1, 2),
          createMockPermission(userId, 3, 4),
        ];

        permissionRepo.find.mockResolvedValue(mockPermissions);

        const result = await permissionService.getUserPermissions(userId);

        expect(result).toEqual(mockPermissions);
        expect(permissionRepo.find).toHaveBeenCalledWith({ where: { userId } });
      });
    });

    describe('when repository returns empty array', () => {
      it('should return empty array', async () => {
        const userId = 123;

        permissionRepo.find.mockResolvedValue([]);

        const result = await permissionService.getUserPermissions(userId);

        expect(result).toEqual([]);
        expect(permissionRepo.find).toHaveBeenCalledWith({ where: { userId } });
      });
    });

    describe('when repository throws error', () => {
      it('should return empty array', async () => {
        const userId = 123;

        permissionRepo.find.mockRejectedValue(new Error('Database error'));

        const result = await permissionService.getUserPermissions(userId);

        expect(result).toEqual([]);
        expect(permissionRepo.find).toHaveBeenCalledWith({ where: { userId } });
      });
    });
  });
});
