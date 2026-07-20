import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { STATUS_CODE } from '../../../common/utils/constant';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('VTC_JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || user.statusId !== STATUS_CODE.ACTIVE) {
      throw new UnauthorizedException('Tài khoản không hợp lệ hoặc đã bị khóa');
    }
    return { id: user.id, email: user.email, role: user.role.code };
  }
}
