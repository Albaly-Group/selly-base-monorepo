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

  async validate(payload: JwtPayload): Promise<any> {
    // Validate that the user still exists and is active
    const user = await this.authService.getUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Transform permissions from role.permissions array to Permission[] format
    // that the platform-admin controller expects
    const permissions =
      user.userRoles2?.flatMap((userRole: any) =>
        (userRole.role.permissions || []).map((permissionKey: string) => ({
          key: permissionKey,
        })),
      ) || [];

    // Return user object with permissions for use in guards and controllers
    return {
      ...payload,
      id: user.id,
      organizationId: user.organizationId,
      permissions,
    };
  }
}
