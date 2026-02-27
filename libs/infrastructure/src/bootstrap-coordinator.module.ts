import { Module, DynamicModule, Global } from '@nestjs/common';
import { BootstrapCoordinatorService } from '@app/infrastructure/bootstrap-coordinator.service';

@Global()
@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class BootstrapCoordinatorModule {
  static forRoot(): DynamicModule {
    return {
      module: BootstrapCoordinatorModule,
      providers: [
        {
          provide: BootstrapCoordinatorService,
          useClass: BootstrapCoordinatorService,
        },
        {
          provide: 'IBootstrapCoordinator',
          useExisting: BootstrapCoordinatorService,
        },
      ],
      exports: [BootstrapCoordinatorService, 'IBootstrapCoordinator'],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: BootstrapCoordinatorModule,
      providers: [
        {
          provide: BootstrapCoordinatorService,
          useClass: BootstrapCoordinatorService,
        },
      ],
      exports: [BootstrapCoordinatorService],
    };
  }
}
