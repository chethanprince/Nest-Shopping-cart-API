import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Param,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt.guard';
import { UserService } from './user/user.service';
import { diskStorage } from "multer";
import { FileInterceptor } from "@nestjs/platform-express";
import { UserEntity } from './entities/user.entity';
import { v4 as uuidv4 } from "uuid";
import { join } from 'node:path';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) { }

  @Post('login')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Login Successful' })
  @ApiBadRequestResponse({
    description: 'User does not exists or invalid login details',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiCreatedResponse({ description: 'New user account created' })
  @ApiBadRequestResponse({ description: 'User already exists or server error' })
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerUser(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    // user : userId, email : from JwtStrategy
    return this.userService.findById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post("fileupload")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: "./upload/profileImage",
        filename: (req: any, file: any, callback: any) => {
          return callback(null, `${uuidv4()}${file.originalname}`);
        },
      }),
    })
  )

  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    const user: UserEntity = req.user.user;
    console.log(user);

    console.log(file);

    return of({ imagePath: file.filename });
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('image/:imagename')
  // findProfileImage(@Param('imagename') imagename, @Res() res): Observable<Object> {
  //   return of(res.sendFile(join(process.cwd(), 'uploads/profileimages/' + imagename)));
  // }

}