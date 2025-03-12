import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';
import { SignupDto } from './dto/signup.dto';
import { Tokens } from './types';
import { MailerService } from 'src/mailer/mailer.service';
import { TokenService } from './token.service';
import { authenticator } from 'otplib';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly mailerService: MailerService,
    private readonly tokenService: TokenService,
  ) {}

  async otpSend(data) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    if (user.active) {
      throw new HttpException('El usuario ya está activo', HttpStatus.BAD_REQUEST);
    }

    const otp = authenticator.generate(process.env.OTP_SECRET);
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpiry: expiry },
    });

    await this.mailerService.sendMail(
      user.email,
      'Tu código OTP',
      `Tu OTP es: <strong>${otp}</strong>. Expirará en 5 minutos.`
    );
  }

  async otpVerify(email: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user.active) {
      throw new HttpException('El usuario ya está activo', HttpStatus.BAD_REQUEST);
    }

    if (!user || !user.otp || !user.otpExpiry) {
      throw new HttpException(
        'OTP inválido o expirado',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.otp !== code || user.otpExpiry < new Date()) {
      throw new HttpException(
        'OTP inválido o expirado',
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { active: true, otp: null, otpExpiry: null },
    });

    await this.mailerService.sendMail(
      user.email,
      'Cuenta activada',
      'Tu cuenta ha sido activada con éxito. Puedes iniciar sesión ahora.',
      'https://miapp.com/login',
      'Iniciar sesión'
    );

    return { "message": "Usuario Verificado con Exito" };
  }

  async login(loginData: LoginDto): Promise<Tokens> {
    const userExist = await this.prisma.user.findUnique({
      where: { email: loginData.email },
    });
    if (!userExist) {
       throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    if (!userExist.active) {
      throw new HttpException('El usuario no está activado', HttpStatus.BAD_REQUEST);
    }

    const passwordMatch = await argon2.verify(
      userExist.password,
      loginData.password,
    );
    if (!passwordMatch) {
      throw new HttpException('Contraseña inválida', HttpStatus.BAD_REQUEST);
    }

    const tokens = await this.tokenService.generateTokens(
      userExist.id.toString(),
      userExist.email,
      userExist.role,
    );

    return tokens;
  }

  async signup(signupData: SignupDto) {
    const userExist = await this.prisma.user.findUnique({
      where: { email: signupData.email },
    });
    if (userExist) {
      throw new HttpException('El usuario ya existe', HttpStatus.CONFLICT);
    }

    const hashedPassword = await argon2.hash(signupData.password);
    const newUser = await this.prisma.user.create({
      data: {
        ...signupData,
        password: hashedPassword,
      },
    });

    return { message: 'Usuario creado con éxito' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
  
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }
  
    const otp = authenticator.generate(process.env.OTP_SECRET);
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // OTP válido por 5 minutos
  
    await this.prisma.user.update({
      where: { id: user.id },
      data: { otpForgetPass: otp, otpForgetExpiry: expiry },
    });
  
    await this.mailerService.sendMail(
      user.email,
      'Recuperación de contraseña',
      `Tu código de recuperación es: <strong>${otp}</strong>. Expirará en 5 minutos.`,
    );
  
    return { message: 'Código de recuperación enviado' };
  }
  
  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
  
    if (!user || !user.otpForgetPass || !user.otpForgetExpiry) {
      throw new HttpException('Código inválido o expirado', HttpStatus.UNAUTHORIZED);
    }
  
    if (user.otpForgetPass !== otp || user.otpForgetExpiry < new Date()) {
      throw new HttpException('Código inválido o expirado', HttpStatus.UNAUTHORIZED);
    }
  
    const hashedPassword = await argon2.hash(newPassword);
  
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        otpForgetPass: null,
        otpForgetExpiry: null,
      },
    });
  
    return { message: 'Contraseña restablecida con éxito' };
  }

  
}
