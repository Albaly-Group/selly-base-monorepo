import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService, LoginResponse } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from '../../dtos/company.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body(new ValidationPipe({ transform: true })) loginDto: LoginDto,
  ): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    const user = await this.authService.getUserById(req.user.sub);
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      organizationId: user.organizationId,
      organization: user.organization,
    };
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refresh(@Request() req: any): Promise<{ accessToken: string }> {
    const payload = {
      sub: req.user.sub,
      email: req.user.email,
      organizationId: req.user.organizationId,
    };
    
    const accessToken = this.authService['jwtService'].sign(payload);
    return { accessToken };
  }
}