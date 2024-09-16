import { Body, Controller, Delete, Patch, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiResponse } from '../utils/responses/api-response.dto';
import { AuthenticationGuard } from '../auth/guard/authenticaton.guard';
import { CustomRequest } from '../utils/interface/type';
import { UpdateUserDto } from './dto/userDto';

@Controller({path:'user',version:'1'})
export class UserController {
    constructor(private userService: UserService) { }
    @UseGuards(AuthenticationGuard)
    @Patch(`/updateUser`)
    async updateUser(@Req() req: CustomRequest,@Body() data:UpdateUserDto): Promise<ApiResponse> {
      
        const id=req.user.id
        return this.userService.updateUser(id,data);
    }
    @UseGuards(AuthenticationGuard)
    @Delete(`/delete`)
    async DeteleUser(@Req() req: CustomRequest): Promise<ApiResponse> {

        return await this.userService.softDeleteUser(req);
    }
}
