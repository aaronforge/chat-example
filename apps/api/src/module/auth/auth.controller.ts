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
    description: '존재하지 않는 사용자',
  })
  @ApiUnauthorizedResponse({
    type: ExceptionResponseDto,
    description: '잘못된 인증 정보',
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
    description: '인증 정보 조회 실패',
  })
  @ApiForbiddenResponse({
    type: ExceptionResponseDto,
    description: '사용자 조회 실패',
  })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Body() body: RefreshTokenDto,
    @UserAgent() userAgent: string | null,
    @RealIp() ip: string,
  ): Promise<TokenResponseDto> {
    return this.authService.refresh(body.refreshToken, userAgent, ip);
  }

  @Public()
  @ApiOperation({ summary: '로그아웃' })
  @ApiOkResponse({ type: Boolean })
  @ApiUnauthorizedResponse({
    type: ExceptionResponseDto,
    description: '인증 정보 조회 실패',
  })
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Body() body: RefreshTokenDto): Promise<OkResponseDto> {
    const result = await this.authService.logout(body.refreshToken);
    return {
      ok: result,
    };
  }
}
