import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PermissionModule } from './permission.module';
import { PermissionService } from './permission.service';
import { Permission } from '@app/authentication/permission/permission.interface';
import { Entity } from 'typeorm';

@Entity('mock_permissions')
class MockPermission implements Permission {
  action!: number;
  createdAt!: Date;
  resource!: number;
  userId!: number;
}

describe('PermissionModule', () => {
  it('should compile the module and resolve providers correctly', async () => {
    const mockRepo = {
      find: jest.fn(),
      save: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [PermissionModule.forFeature(MockPermission)],
    })
      .overrideProvider(getRepositoryToken(MockPermission))
      .useValue(mockRepo)
      .compile();

    const permissionService =
      moduleRef.get<PermissionService>(PermissionService);
    expect(permissionService).toBeDefined();
  });
});
