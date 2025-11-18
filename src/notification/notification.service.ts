import { Inject, Injectable } from '@nestjs/common';
import { sendNotificationDTO } from './dto/send-notification.dto';
import admin from "firebase-admin";
import { NotificationDto, MultipleDeviceNotificationDto, TopicNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('FIREBASE_ADMIN') private readonly firebase: any,
  ) {}

  async sendPush(notification: sendNotificationDTO) {
    try {
      await this.firebase.messaging().send({
        notification: {
          title: notification.title,
          body: notification.body,
        },
        token: notification.deviceId,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
        apns: {
          headers: {
            'apns-priority': '10',
          },
          payload: {
            aps: {
              contentAvailable: true,
              sound: 'default',
            },
          },
        },
      });

      return { success: true };
    } catch (error) {
      console.log('FCM ERROR: ', error);
      throw error;
    }
  }


  async sendNotification({ token, title, body, icon }: NotificationDto) {
    try {
      const response = await admin.messaging().send({
        token,
        webpush: {
          notification: {
            title,
            body,
            icon,
          },
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async sendNotificationToMultipleTokens({
    tokens,
    title,
    body,
    icon,
  }: MultipleDeviceNotificationDto) {
    const message = {
      notification: {
        title,
        body,
        icon,
      },
      tokens,
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log("Successfully sent messages:", response);
      return {
        success: true,
        message: `Successfully sent ${response.successCount} messages; ${response.failureCount} failed.`,
      };
    } catch (error) {
      console.log("Error sending messages:", error);
      return { success: false, message: "Failed to send notifications" };
    }
  }

  async sendTopicNotification({
    topic,
    title,
    body,
    icon,
  }: TopicNotificationDto) {
    const message = {
      notification: {
        title,
        body,
        icon,
      },
      topic,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log("Successfully sent message:", response);
      return { success: true, message: "Topic notification sent successfully" };
    } catch (error) {
      console.log("Error sending message:", error);
      return { success: false, message: "Failed to send topic notification" };
    }
  }
}
