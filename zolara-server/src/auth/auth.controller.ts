import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  UnauthorizedException,
  BadRequestException,
  Logger,
  Put,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { InitiateRegistrationDto } from './dto/initiate-registration.dto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyForgotPasswordOtpDto } from './dto/verify-forgot-password-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from './public.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateBasicInfoDto } from './dto/update-basic-info.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { InitiateUpdateEmailDto } from './dto/initiate-update-email.dto';
import { InitiateUpdatePhoneDto } from './dto/initiate-update-phone.dto';
import { VerifyUpdateOtpDto } from './dto/verify-update-otp.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('AuthController');

  constructor(private readonly authService: AuthService) {}

  @Post('register/initiate')
  @Public()
  async initiateRegistration(@Body() initiateDto: InitiateRegistrationDto) {
    return this.authService.initiateRegistration(initiateDto);
  }

  @Post('register/verify')
  @Public()
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(
      verifyOtpDto.registrationId,
      verifyOtpDto.otp,
    );
  }

  @Post('register/complete')
  @Public()
  async completeRegistration(@Body() completeDto: CompleteRegistrationDto) {
    return this.authService.completeRegistration(completeDto);
  }

  @Post('login')
  @Public()
  async login(@Body() loginDto: LoginDto, @Req() request: ExpressRequest) {
    this.logger.log(
      `Login request - Email/Phone: ${loginDto.email || loginDto.phoneNumber}, DeviceType: ${
        loginDto.deviceType
      }`,
    );

    if (!loginDto.email && !loginDto.phoneNumber) {
      this.logger.warn('Login failed - No email or phone number provided');
      throw new BadRequestException('Either email or phone number is required');
    }

    const deviceInfo = {
      deviceName: request.headers['x-device-name'],
      deviceType: loginDto.deviceType,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    };

    this.logger.debug('Device info:', deviceInfo);

    const identifier = loginDto.email || loginDto.phoneNumber;
    return this.authService.login(identifier, loginDto.password, deviceInfo);
  }

  @Post('refresh')
  @Public()
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    this.logger.log(
      `Token refresh request - DeviceId: ${refreshTokenDto.deviceId}`,
    );
    return this.authService.refreshAccessToken(
      refreshTokenDto.refreshToken,
      refreshTokenDto.deviceId,
    );
  }

  @Post('logout')
  async logout(@Headers('refresh-token') refreshToken: string) {
    this.logger.log('Logout request received');

    if (!refreshToken) {
      this.logger.warn('Logout failed - No refresh token provided');
      throw new UnauthorizedException('Refresh token is required');
    }
    return this.authService.logout(refreshToken);
  }

  @Post('forgot-password')
  @Public()
  async initiateForgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.initiateForgotPassword(forgotPasswordDto);
  }

  @Post('forgot-password/verify')
  @Public()
  async verifyForgotPasswordOtp(@Body() verifyDto: VerifyForgotPasswordOtpDto) {
    return this.authService.verifyForgotPasswordOtp(
      verifyDto.resetId,
      verifyDto.otp,
    );
  }

  @Post('forgot-password/reset')
  @Public()
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetDto.resetId,
      resetDto.newPassword,
    );
  }

  @Put('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() request: Request,
  ) {
    const userId = request['user'].sub;
    return this.authService.changePassword(
      userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Put('update-basic-info')
  async updateBasicInfo(
    @Body(new ValidationPipe({ transform: true }))
    updateBasicInfoDto: UpdateBasicInfoDto,
    @Req() request: Request,
  ) {
    const userId = request['user'].sub;
    return this.authService.updateBasicInfo(userId, updateBasicInfoDto);
  }

  @Put('update-profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
  ) {
    const userId = request['user'].sub;
    return this.authService.updateProfilePicture(userId, file);
  }

  @Put('update-cover-image')
  @UseInterceptors(FileInterceptor('file'))
  async updateCoverImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
  ) {
    const userId = request['user'].sub;
    this.logger.log(
      `Update cover image request - UserId: ${userId}, FileSize: ${file?.size || 'N/A'}`,
    );
    return this.authService.updateCoverImage(userId, file);
  }

  @Post('update-email/initiate')
  async initiateUpdateEmail(
    @Body() updateEmailDto: InitiateUpdateEmailDto,
    @Req() request: Request,
  ) {
    const userId = request['user'].sub;
    this.logger.log(
      `Initiate email update request - UserId: ${userId}, NewEmail: ${updateEmailDto.newEmail}`,
    );
    return this.authService.initiateUpdateEmail(userId, updateEmailDto);
  }

  @Post('update-email/verify')
  async verifyUpdateEmailOtp(@Body() verifyDto: VerifyUpdateOtpDto) {
    this.logger.log(
      `Verify email update OTP request - UpdateId: ${verifyDto.updateId}`,
    );
    return this.authService.verifyUpdateEmailOtp(
      verifyDto.updateId,
      verifyDto.otp,
    );
  }

  @Post('update-phone/initiate')
  async initiateUpdatePhone(
    @Body() updatePhoneDto: InitiateUpdatePhoneDto,
    @Req() request: Request,
  ) {
    const userId = request['user'].sub;
    this.logger.log(
      `Initiate phone update request - UserId: ${userId}, NewPhone: ${updatePhoneDto.newPhoneNumber}`,
    );
    return this.authService.initiateUpdatePhone(userId, updatePhoneDto);
  }

  @Post('update-phone/verify')
  async verifyUpdatePhoneOtp(@Body() verifyDto: VerifyUpdateOtpDto) {
    this.logger.log(
      `Verify phone update OTP request - UpdateId: ${verifyDto.updateId}`,
    );
    return this.authService.verifyUpdatePhoneOtp(
      verifyDto.updateId,
      verifyDto.otp,
    );
  }
}
