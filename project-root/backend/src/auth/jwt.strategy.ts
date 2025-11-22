import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'SEGREDO_SUPER_SECRETO',
    });
  }

  async validate(payload: any) {
    // Retorna o usuário (ou apenas o ID) que será anexado ao objeto Request
    return { userId: payload.sub, email: payload.email };
  }
}