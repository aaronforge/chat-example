import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserResponseDTO } from './dto/user-response.dto';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ExceptionResponseDTO } from 'src/common/exception/base.exception';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '사용자 생성' })
  @ApiCreatedResponse({ type: UserResponseDTO })
  @ApiConflictResponse({
    type: ExceptionResponseDTO,
    description: '이미 사용 중인 이메일',
  })
  @Post()
  async create(@Body() dto: CreateUserDTO): Promise<UserResponseDTO> {
    const user = await this.userService.create(dto);
    return UserResponseDTO.fromEntity(user);
  }
}
