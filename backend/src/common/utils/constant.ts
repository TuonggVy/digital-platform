export enum ResponseCode {
  SUCCESS = 0,
  INTERNAL_ERROR = -1,
  BAD_REQUEST = -2,
  UNAUTHORIZED = -3,
  NOT_FOUND = -4,
  CONFLICT = -5,
}

export const responseMessage = {
  success: 'Thành công',
  internalError: 'Lỗi hệ thống',
  badRequest: 'Yêu cầu không hợp lệ',
  unauthorized: 'Không có quyền truy cập',
  notFound: 'Không tìm thấy dữ liệu',
  conflict: 'Dữ liệu đã tồn tại',
};

export const STATUS_CODE = {
  ACTIVE: 1,
  INACTIVE: 2,
  PENDING: 3,
  DELETED: 4,
};

export const ROLE_CODE = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
};
