import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiResponse } from './api-response.dto';

@Injectable()
export class ResponseService {
  success(
    message: string = 'Request was successful',
    statusCode: HttpStatus = HttpStatus.OK,
    data: any = {},
  ) {
    const response: ApiResponse = {
      statusCode,
      message,
      success: true,
    };

    if (Object.keys(data).length > 0) {
      response.data = data;
    }

    return response;
  }

  error(message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST) {
    return {
      statusCode,
      message,
      success: false,
    };
  }
}
