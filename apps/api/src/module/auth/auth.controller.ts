import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessTokenResponseDto } from './dto/access-token-response';
import { ExceptionResponseDto } from 'src/common/exception/base.exception';
import { LoginDto } from './dto/login.dto';
import { Public } from 'src/common/decorator/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: '로그인' })
  @ApiOkResponse({ type: AccessTokenResponseDto })
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
  async login(@Body() dto: LoginDto): Promise<AccessTokenResponseDto> {
    return this.authService.login(dto);
  }
}
