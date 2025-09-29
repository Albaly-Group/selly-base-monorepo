import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, JwtPayload } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Validate that the user still exists and is active
    const user = await this.authService.getUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Return the payload for use in guards and controllers
    return payload;
  }
}