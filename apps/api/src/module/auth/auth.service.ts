import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import {
  InvalidCredentialsException,
  UserNotFoundException,
} from 'src/common/exception/user.exception';
import * as bcrypt from 'bcrypt';
import { TJwtPayload } from './type/jwt-payload.type';
import { RefreshTokenRepository } from 'src/repository/refresh-token.repository';
import { User } from 'src/entity/user.entity';
import { ConfigService } from '@nestjs/config';
import { TokenResponseDto } from './dto/token-response.dto';
import { randomUUID } from 'crypto';
import { UnauthorizedException } from 'src/common/exception/common.exception';
import {
  ExpiredTokenException,
  InvalidTokenException,
  RefreshFailedException,
  SubjectNotFoundException,
} from 'src/common/exception/auth.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  /**
   * 토큰 발급
   */
  private async issueTokens(
    user: User,
    userAgent: string | null,
    ip: string | null,
  ): Promise<TokenResponseDto> {
    const payload: TJwtPayload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('JWT_EXPIRES_IN'),
    });

    const jti = randomUUID();
    const refreshToken = this.jwtService.sign(
      { ...payload, jti },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow<string>(
          'JWT_REFRESH_EXPIRES_IN',
        ),
      },
    );

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(refreshToken, salt);
    const exp = this.jwtService.decode(refreshToken).exp * 1000;

    await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({
        userId: user.id,
        tokenHash: hash,
        jti,
        userAgent: userAgent?.slice(0, 255),
        ip,
        expiredAt: new Date(exp),
      }),
    );

    return { accessToken, refreshToken };
  }

  /**
   * 리프레시 토큰 검증 및 레코드 조회 공통 처리
   */
  private async verifyAndFindRefreshRecord(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync<TJwtPayload>(
      refreshToken,
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      },
    );
    if (!payload.jti) throw new UnauthorizedException();

    const rec = await this.refreshTokenRepository.findValidByUserAndJti(
      payload.sub,
      payload.jti,
    );
    if (!rec) throw new UnauthorizedException();
    if (rec.expiredAt < new Date()) throw new ExpiredTokenException();

    return { payload, rec } as const;
  }

  /**
   * 로그인
   */
  async login(
    dto: LoginDto,
    userAgent: string | null,
    ip: string | null,
  ): Promise<TokenResponseDto> {
    const { email, password } = dto;
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UserNotFoundException();

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new InvalidCredentialsException();

    return this.issueTokens(user, userAgent, ip);
  }

  /**
   * 토큰 재발급
   */
  async refresh(
    refreshToken: string,
    userAgent: string | null,
    ip: string | null,
  ) {
    try {
      const { payload, rec } =
        await this.verifyAndFindRefreshRecord(refreshToken);

      const ok = await bcrypt.compare(refreshToken, rec.tokenHash);
      if (!ok) {
        // 토큰 위조 시도
        await this.refreshTokenRepository.revokeAllByUser(payload.sub);
        throw new InvalidTokenException();
      }

      await this.refreshTokenRepository.revokeById(rec.id);

      const user = await this.userService.findByEmail(payload.email);
      if (!user) throw new SubjectNotFoundException();

      return this.issueTokens(user, userAgent, ip);
    } catch {
      throw new RefreshFailedException();
    }
  }

  /**
   * 로그아웃
   */
  async logout(refreshToken: string) {
    try {
      const { rec } = await this.verifyAndFindRefreshRecord(refreshToken);

      await this.refreshTokenRepository.revokeById(rec.id);

      return true;
    } catch {
      throw new InvalidTokenException();
    }
  }
}
