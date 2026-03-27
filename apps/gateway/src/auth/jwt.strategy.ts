import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigurationService } from '@app/infrastructure';
import { JwtConfig } from '@app/contracts';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigurationService) {
    const jwtConfig = configService.getByKey('jwt', JwtConfig);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  validate(payload: { sub: number; username: string }): {
    userId: number;
    username: string;
  } {
    return { userId: payload.sub, username: payload.username };
  }
}
