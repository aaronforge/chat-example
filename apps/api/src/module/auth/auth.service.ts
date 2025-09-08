import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDTO } from './dto/login.dto';
import {
  InvalidCredentialsException,
  UserNotFoundException,
} from 'src/common/exception/user.exception';
import * as bcrypt from 'bcrypt';
import { TJwtPayload } from './type/jwt-payload.type';
import { AccessTokenResponseDTO } from './dto/access-token-response';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDTO): Promise<AccessTokenResponseDTO> {
    const { email, password } = dto;
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UserNotFoundException();

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new InvalidCredentialsException();

    const payload: TJwtPayload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
