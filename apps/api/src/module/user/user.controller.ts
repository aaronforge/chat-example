import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ExceptionResponseDto } from 'src/common/exception/base.exception';
import { Public } from 'src/common/decorator/public.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @ApiOperation({ summary: '사용자 생성' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiConflictResponse({
    type: ExceptionResponseDto,
    description: 'EMAIL_ALREADY_EXISTS',
  })
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.create(dto);
    return UserResponseDto.fromEntity(user);
  }
}
