import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { GetAdminCustomersDto } from './dto/get-admin-customers.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLE_CODE } from '../../common/utils/constant';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('admin/customers')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(ROLE_CODE.ADMIN)
  @Get()
  @ApiOperation({
    summary: '[Admin] Danh sách khách hàng (role CUSTOMER) — pagination, search, filter status, sort',
    description:
      'Không trả passwordHash/refreshTokenHash/token. Chỉ liệt kê user role CUSTOMER, đã lọc deletedDate IS NULL.',
  })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Tìm theo fullName/email/phone' })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE'] })
  @ApiQuery({ name: 'sort', required: false, enum: ['newest', 'oldest', 'name_asc', 'name_desc'] })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Mặc định 1' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Mặc định 20' })
  @ApiResponse({ status: 200, description: 'Danh sách khách hàng kèm phân trang' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Không có quyền ADMIN' })
  getAll(@Query() query: GetAdminCustomersDto) {
    return this.usersService.getAllForAdmin(query);
  }

  @Roles(ROLE_CODE.ADMIN)
  @Get(':id')
  @ApiOperation({
    summary: '[Admin] Chi tiết khách hàng — kèm số Order, tổng tiền đã mua, Payment gần nhất',
    description:
      'orderCount/totalSpent tính từ Order của chính user này (totalSpent chỉ tính Order ở trạng thái ' +
      'PAID/PROCESSING/COMPLETED). latestPayment là Payment mới nhất (bất kỳ trạng thái) trong số các Order của user.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Chi tiết khách hàng' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Không có quyền ADMIN' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khách hàng' })
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getByIdForAdmin(id);
  }
}
