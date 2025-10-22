// dto/result.dto.ts
export class ResultDto<T> {
    Success: boolean;
    Message: string;
    Data: T;

  constructor(data: T, message = 'Success', success = true) {
    this.Success = success;
    this.Data = data;
    this.Message = message;
  }
}
