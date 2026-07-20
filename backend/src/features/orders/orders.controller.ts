import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetMyOrdersDto } from './dto/get-my-orders.dto';
import { GetAdminOrdersDto } from './dto/get-admin-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from './enums/order-status.enum';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLE_CODE } from '../../common/utils/constant';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ── Customer ──────────────────────────────────────────────────────────

  @Post('orders')
  @ApiOperation({
    summary: 'Tạo đơn hàng mới',
    description:
      'Backend tự tra Product theo productId, validate Product tồn tại/chưa xoá/đang ACTIVE, ' +
      'tự lấy giá (packageId bắt buộc nếu Product có package) và tự tính subtotal/totalAmount. ' +
      'Không nhận totalAmount hay bất kỳ giá trị tiền nào từ client.',
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Tạo đơn hàng thành công, trạng thái ban đầu PENDING' })
  @ApiResponse({ status: 400, description: 'Product không tồn tại/không active, thiếu packageId, quantity không hợp lệ...' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  createOrder(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(user.id, dto);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Danh sách đơn hàng của chính user đang đăng nhập' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Mặc định 1' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Mặc định 20' })
  @ApiResponse({ status: 200, description: 'Danh sách Order kèm phân trang' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  getMyOrders(@CurrentUser() user: CurrentUserPayload, @Query() query: GetMyOrdersDto) {
    return this.ordersService.getMyOrders(user.id, query);
  }

  @Get('orders/:id')
  @ApiOperation({
    summary: 'Chi tiết một đơn hàng của chính user',
    description: 'Trả 404 nếu Order không tồn tại hoặc thuộc về user khác — không lộ thông tin Order người khác.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Chi tiết Order kèm danh sách OrderItem' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  getOrderDetail(@CurrentUser() user: CurrentUserPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.getOrderDetail(user.id, id);
  }

  @Post('orders/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Huỷ đơn hàng',
    description: 'Chỉ cho phép huỷ khi Order đang ở trạng thái PENDING hoặc AWAITING_PAYMENT.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Huỷ đơn hàng thành công, status chuyển sang CANCELLED' })
  @ApiResponse({ status: 400, description: 'Order đã thanh toán hoặc không ở trạng thái có thể huỷ' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  cancelOrder(@CurrentUser() user: CurrentUserPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.cancelOrder(user.id, id);
  }

  // ── Admin ─────────────────────────────────────────────────────────────

  @Roles(ROLE_CODE.ADMIN)
  @Get('admin/orders')
  @ApiOperation({ summary: '[Admin] Danh sách toàn bộ đơn hàng — pagination, search, filter status, sort' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Tìm theo orderCode/customerName/customerEmail/customerPhone' })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiQuery({ name: 'sort', required: false, enum: ['newest', 'oldest', 'total_asc', 'total_desc'] })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Mặc định 1' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Mặc định 20' })
  @ApiResponse({ status: 200, description: 'Danh sách Order kèm phân trang' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Không có quyền ADMIN' })
  getAllForAdmin(@Query() query: GetAdminOrdersDto) {
    return this.ordersService.getAllForAdmin(query);
  }

  @Roles(ROLE_CODE.ADMIN)
  @Get('admin/orders/:id')
  @ApiOperation({ summary: '[Admin] Chi tiết một đơn hàng bất kỳ' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Chi tiết Order kèm danh sách OrderItem' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Không có quyền ADMIN' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  getByIdForAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.getByIdForAdmin(id);
  }

  @Roles(ROLE_CODE.ADMIN)
  @Patch('admin/orders/:id/status')
  @ApiOperation({
    summary: '[Admin] Cập nhật trạng thái đơn hàng',
    description:
      'Chỉ cập nhật status, không cho sửa các field khác của Order. ' +
      'Transition phải hợp lệ theo state machine hiện tại (vd: không thể chuyển từ COMPLETED về PENDING).',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Order ID' })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công' })
  @ApiResponse({ status: 400, description: 'Transition trạng thái không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Không có quyền ADMIN' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }
}
