import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ExceptionResponseDto } from 'src/common/exception/base.exception';
import { LoginDto } from './dto/login.dto';
import { Public } from 'src/common/decorator/public.decorator';
import { UserAgent } from 'src/common/decorator/user-agent.decorator';
import { RealIp } from 'nestjs-real-ip';
import { TokenResponseDto } from './dto/token-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { OkResponseDto } from 'src/common/dto/ok-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: '로그인' })
  @ApiOkResponse({ type: TokenResponseDto })
  @ApiNotFoundResponse({
    type: ExceptionResponseDto,
    description: 'USER_NOT_FOUND',
  })
  @ApiUnauthorizedResponse({
    type: ExceptionResponseDto,
    description: 'INVALID_CREDENTIALS',
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @UserAgent() userAgent: string | null,
    @RealIp() ip: string,
  ): Promise<TokenResponseDto> {
    return this.authService.login(dto, userAgent, ip);
  }

  @Public()
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiOkResponse({ type: TokenResponseDto })
  @ApiUnauthorizedResponse({
    type: ExceptionResponseDto,
    description:
      'UNAUTHORIZED | EXPIRED_TOKEN | INVALID_TOKEN | REFRESH_FAILED',
  })
  @ApiForbiddenResponse({
    type: ExceptionResponseDto,
    description: 'SUBJECT_NOT_FOUND',
  })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Body() dto: RefreshTokenDto,
    @UserAgent() userAgent: string | null,
    @RealIp() ip: string,
  ): Promise<TokenResponseDto> {
    return this.authService.refresh(dto.refreshToken, userAgent, ip);
  }

  @Public()
  @ApiOperation({ summary: '로그아웃' })
  @ApiOkResponse({ type: OkResponseDto })
  @ApiUnauthorizedResponse({
    type: ExceptionResponseDto,
    description: 'UNAUTHORIZED | EXPIRED_TOKEN | INVALID_TOKEN',
  })
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Body() dto: RefreshTokenDto): Promise<OkResponseDto> {
    const result = await this.authService.logout(dto.refreshToken);
    return {
      ok: result,
    };
  }
}
