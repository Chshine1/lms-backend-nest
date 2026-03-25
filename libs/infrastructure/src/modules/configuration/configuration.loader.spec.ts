import { ConfigurationLoader } from './configuration.loader';
import { ConfigurationServiceDependencies } from './configuration.service';
import { LoaderPipelineService } from './pipeline/loader-pipeline.service';

const mockPipelineProcess = jest.fn();

const mockLoaderPipelineService = {
  process: mockPipelineProcess,
} as unknown as LoaderPipelineService;

describe('ConfigurationLoader', () => {
  let loader: ConfigurationLoader;
  let dependencies: ConfigurationServiceDependencies;

  beforeEach(() => {
    jest.clearAllMocks();
    dependencies = new ConfigurationServiceDependencies();
    loader = new ConfigurationLoader(mockLoaderPipelineService, dependencies);
  });

  it('should load configuration via pipeline, update dependencies, and set ready state', async () => {
    const mockConfig = { appName: 'test', port: 3000 };
    mockPipelineProcess.mockResolvedValue(mockConfig);

    await loader.load();

    expect(mockPipelineProcess).toHaveBeenCalledTimes(1);
    expect(mockPipelineProcess).toHaveBeenCalledWith({});
    expect(dependencies.configuration).toEqual(mockConfig);
    expect(loader.isReady).toBe(true);
  });
});
