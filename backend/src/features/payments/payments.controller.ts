import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { SandboxCompleteDto } from './dto/sandbox-complete.dto';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('payments')
  @ApiOperation({
    summary: 'Tạo giao dịch thanh toán mới cho một Order',
    description:
      'Backend tự lấy amount/currency từ Order.totalAmount/Order.currency — không nhận amount/currency/status ' +
      'từ client. Chỉ chủ sở hữu Order mới tạo được. Order phải đang PENDING/AWAITING_PAYMENT/FAILED và chưa có ' +
      'Payment SUCCEEDED nào. Tạo Payment (status PENDING) và chuyển Order sang AWAITING_PAYMENT trong cùng transaction.',
  })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 201, description: 'Tạo giao dịch thanh toán thành công, Order chuyển sang AWAITING_PAYMENT' })
  @ApiResponse({ status: 400, description: 'Order không ở trạng thái có thể thanh toán, hoặc đã có Payment thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Order không thuộc về user hiện tại' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  createPayment(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPayment(user.id, dto);
  }

  @Get('orders/:orderId/payments')
  @ApiOperation({
    summary: 'Danh sách giao dịch thanh toán của một Order',
    description: 'Customer chỉ xem được Order của chính mình (403 nếu không phải chủ sở hữu). Admin xem được mọi Order.',
  })
  @ApiParam({ name: 'orderId', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Danh sách Payment, mới nhất trước, có thể rỗng nếu chưa có giao dịch nào' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Order không thuộc về user hiện tại (và không phải Admin)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  getPaymentsForOrder(
    @CurrentUser() user: CurrentUserPayload,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ) {
    return this.paymentsService.getPaymentsForOrder(user.id, user.role, orderId);
  }

  @Post('payments/:id/sandbox/complete')
  @ApiOperation({
    summary: '[Sandbox — development/test only] Giả lập kết quả thanh toán',
    description:
      'Bị vô hiệu hoá hoàn toàn khi NODE_ENV=production (trả 403). Cho phép SUCCESS/FAILURE/CANCEL. ' +
      'SUCCESS chuyển Payment sang SUCCEEDED + Order sang PAID. FAILURE/CANCEL chuyển Payment sang FAILED/CANCELLED, ' +
      'Order giữ nguyên AWAITING_PAYMENT (không tự sửa FAILED thành SUCCESS, không cho payment terminal cập nhật lại).',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Payment ID' })
  @ApiBody({ type: SandboxCompleteDto })
  @ApiResponse({ status: 201, description: 'Cập nhật kết quả sandbox thành công' })
  @ApiResponse({ status: 400, description: 'Payment đã ở trạng thái cuối, hoặc Order không còn hợp lệ để xác nhận' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Sandbox bị vô hiệu hoá ở production, hoặc không có quyền' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giao dịch thanh toán' })
  @ApiResponse({ status: 409, description: 'Order đã được thanh toán thành công bởi một giao dịch khác' })
  sandboxComplete(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SandboxCompleteDto,
  ) {
    return this.paymentsService.sandboxComplete(user.id, user.role, id, dto);
  }
}
