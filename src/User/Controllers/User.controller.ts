import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  UseGuards,
  ForbiddenException,
  Query,
  ParseIntPipe
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdatePasswordDto } from '../../Auth/DTOs/update-userpass.dto';
import { AuthService } from '../../Auth/Service/auth.service';
import { CurrentUser } from '../../Common/Decorator/user.decorator';
import { TokenUserDTO } from 'src/Auth/DTOs/token-user.dto';
import { ResultDto } from 'src/Common/Utility/ResultModel';
import { updateProfileDTO } from '../DTOs/updateprofile.dto';
import { UserService } from '../Service/user.service';

@ApiTags('Users')
@ApiBearerAuth('access-token') // Match this with 'access-token' in main.ts
@UseGuards(AuthGuard('jwt'))  
@Controller('users')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService) {}

  
 @Post('update-password')
  @ApiOperation({ summary: 'Update user password' })
  @ApiResponse({ status: 200, description: 'Password successfully updated' })
  @ApiResponse({ status: 400, description: 'Invalid data or password criteria not met' })
  
  async updatePassword(@Body() dto: UpdatePasswordDto,@CurrentUser('userId') userId: number) {
    return this.authService.updatePassword(dto,userId);
  }
 


@Post('logout')
@ApiOperation({ summary: 'Logout and clear refresh token' })
async logout(@CurrentUser('userId') userId: number) {
  return this.authService.logout(userId);
}
// Profile managment CRUD

@Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUserDto:updateProfileDTO,
  ): Promise<ResultDto<any>> {
    return this.userService.updateUser(id, updateUserDto);
  }


// Project management CRUD

@Get()
@ApiOperation({ summary: 'Get all users with profiles' })
async getAllUsers() {
  return this.userService.getAllUsers();
}

// 🟢 NEW: Paginated & Filterable GET endpoint
  @Get('paginated/all')
  @ApiQuery({ name: 'filterKey', required: false, type: String, description: 'Field name to filter by (e.g. firstName, email)' })
  @ApiQuery({ name: 'filterBy', required: false, type: String, description: 'Value to search for' })
  @ApiQuery({ name: 'page', required: true, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: true, type: Number, description: 'Items per page' })
  async getPaginatedUsers(
    @Query('filterKey') filterKey?: string,
    @Query('filterBy') filterBy?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ResultDto<any>> {
    return this.userService.getUsersPaginated(filterBy, filterKey, page, limit);
  }

@Get(':id')
@ApiOperation({ summary: 'Get user by ID with profile' })
async getUserById(@Param('id', ParseIntPipe) id: number) {
  return this.userService.getUserById(id);
}

}