import { PermissionService } from './permission.service';
import { Permission } from './permission.interface';
import { Repository } from 'typeorm';

describe('PermissionService', () => {
  let permissionService: PermissionService;
  let mockRepo: jest.Mocked<Repository<Permission>>;

  beforeEach(() => {
    mockRepo = {
      find: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<Permission>>;

    permissionService = new PermissionService(mockRepo);
  });

  describe('getUserPermissions', () => {
    it('should return user permissions', async () => {
      const userId = 1;
      const expectedPermissions: Permission[] = [
        { userId: 1, resource: 1, action: 1, createdAt: new Date() },
      ];
      mockRepo.find.mockResolvedValue(expectedPermissions);

      const result = await permissionService.getUserPermissions(userId);

      expect(result).toEqual(expectedPermissions);
      expect(mockRepo.find).toHaveBeenCalledWith({ where: { userId } });
    });

    it('should return empty array on error', async () => {
      mockRepo.find.mockRejectedValue(new Error('DB error'));

      const result = await permissionService.getUserPermissions(1);

      expect(result).toEqual([]);
    });
  });
});
