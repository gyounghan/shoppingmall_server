import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { BrandsModule } from './brands/brands.module';
import { Product } from './entities/product.entity';
import { Brand } from './entities/brand.entity';
import { envVariableKeys } from './common/env-variable-keys';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>(envVariableKeys.dbType) as 'mysql',
        host: configService.get<string>(envVariableKeys.dbHost),
        port: configService.get<number>(envVariableKeys.dbPort),
        username: configService.get<string>(envVariableKeys.dbUsername),
        password: configService.get<string>(envVariableKeys.dbPassword),
        database: configService.get<string>(envVariableKeys.dbDatabase),
        entities: [Product, Brand],
        synchronize: true, // 개발 환경에서만 사용, 프로덕션에서는 false
        logging: true,
        extra: {
          connectionLimit: 10,
          maxIdle: 5,
          idleTimeout: 30000,
        },
      }),
      inject: [ConfigService],
    }),
    ProductsModule,
    BrandsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

