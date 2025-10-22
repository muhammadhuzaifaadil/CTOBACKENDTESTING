import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // ✅ import TypeOrmModule
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './User/User.module';
import { ConfigModule } from '@nestjs/config';
import { RolesModule } from './Roles/Roles.module';
import { CompanyModule } from './Company/Company.module';
import { ContactModule } from './Contact/Contact.module';
import { BuyerProfileModule } from './BuyerProfile/BuyerProfile.module';
import { SellerProfileModule } from './Seller/Seller.module';
import { AuthModule } from './Auth/Auth.module';
import { OTPModule } from './OTP/OTP.module';
import { UploadModule } from './Uploads/upload.module';
import { ProjectModule } from './Project/project.module';
import { BidModule } from './Bid/Bid.module';

@Module({
  imports: [OTPModule,

    ConfigModule.forRoot({ isGlobal: true }), // ✅ ensures .env is loaded globally
    UploadModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // serve /uploads folder statically
      serveRoot: '/uploads',
    }),
    AuthModule,

    TypeOrmModule.forRoot({
       type: 'postgres',
      url: process.env.DB_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined, // ✅ fixed type
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,           // ❗ Only in development
    }),  
    UserModule,
    RolesModule,
    CompanyModule,
    ContactModule,
    BuyerProfileModule,
    SellerProfileModule,
    ProjectModule,
    BidModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}