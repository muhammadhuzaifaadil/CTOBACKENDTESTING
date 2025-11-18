import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotificationService } from './notification.service';

import { sendNotificationDTO } from './dto/send-notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  sendNotification(@Body() pushNotification: sendNotificationDTO) {
    this.notificationService.sendPush(pushNotification);
  }
}
