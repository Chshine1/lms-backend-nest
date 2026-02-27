import { Module, DynamicModule, Global } from '@nestjs/common';
import { InfrastructureRegistryService } from '@app/infrastructure/services/infrastructure-registry.service';
import { BootstrapCoordinatorModule } from '@app/infrastructure/bootstrap-coordinator.module';

@Global()
@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class InfrastructureModule {
  static forRoot(): DynamicModule {
    return {
      module: InfrastructureModule,
      imports: [BootstrapCoordinatorModule.forRoot()],
      providers: [InfrastructureRegistryService],
      exports: [InfrastructureRegistryService, BootstrapCoordinatorModule],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: InfrastructureModule,
      imports: [BootstrapCoordinatorModule.forFeature()],
      providers: [InfrastructureRegistryService],
      exports: [InfrastructureRegistryService, BootstrapCoordinatorModule],
    };
  }
}
