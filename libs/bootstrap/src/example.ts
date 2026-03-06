import { BootstrapCore } from '@app/bootstrap/core';
import { BootstrapToken, ExposeDependency } from '@app/bootstrap/decorators';
import { IIoCContainer } from '@app/bootstrap/interfaces';

@BootstrapToken('user-service')
abstract class IUserService {
  abstract _getUser(id: string): Promise<{ name: string }>;

  @ExposeDependency('getUser')
  getUser(id: string): Promise<{ name: string }> {
    return this._getUser(id);
  }
}

@BootstrapToken('logger')
abstract class ILogger {
  abstract _log(message: string): void;

  @ExposeDependency('log')
  log(message: string): void {
    this._log(message);
  }
}

class ConsoleLogger extends ILogger {
  override _log(message: string): void {
    console.log(`[LOG] ${message}`);
  }
}

class UserService extends IUserService {
  constructor(private logger: ILogger) {
    super();
  }

  override _getUser(id: string): Promise<{ name: string }> {
    this.logger.log(`Fetching user ${id}`);
    return Promise.resolve({ name: 'Alice' });
  }
}

const ioc: IIoCContainer = new IoCContainer();
const core = new BootstrapCore(ioc);

core.registerImplementation(ILogger, ConsoleLogger);
core.registerImplementation(IUserService, UserService);

const userService = ioc.resolve<IUserService>(IUserService);
userService
  .getUser('123')
  .then((user) => {
    console.log(user);
  })
  .catch((err: unknown) => {
    console.log(err);
  });
