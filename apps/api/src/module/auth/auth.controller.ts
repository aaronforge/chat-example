import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessTokenResponseDTO } from './dto/access-token-response';
import { ExceptionResponseDTO } from 'src/common/exception/base.exception';
import { LoginDTO } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '로그인' })
  @ApiOkResponse({ type: AccessTokenResponseDTO })
  @ApiNotFoundResponse({
    type: ExceptionResponseDTO,
    description: '존재하지 않는 사용자',
  })
  @ApiUnauthorizedResponse({
    type: ExceptionResponseDTO,
    description: '잘못된 인증 정보',
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDTO): Promise<AccessTokenResponseDTO> {
    return this.authService.login(dto);
  }
}
