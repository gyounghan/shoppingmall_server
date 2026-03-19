import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { BrandsModule } from './brands/brands.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CategoriesModule } from './categories/categories.module';
import { Product } from './products/entities/product.entity';
import { Brand } from './brands/entities/brand.entity';
import { User } from './auth/entities/user.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { Category } from './categories/entities/category.entity';
import { ProductImage } from './products/entities/product-image.entity';
import { ProductOption } from './products/entities/product-option.entity';
import { ProductCompatibility } from './products/entities/product-compatibility.entity';
import { ProductRecommendation } from './products/entities/product-recommendation.entity';
import { CartItem } from './cart/entities/cart-item.entity';
import { WishlistItem } from './wishlist/entities/wishlist-item.entity';
import { SimulatorSet } from './simulator/entities/simulator-set.entity';
import { SimulatorSetItem } from './simulator/entities/simulator-set-item.entity';
import { ConsultingRequest } from './consulting/entities/consulting-request.entity';
import { UsabilityServiceRequest } from './usability-service/entities/usability-service-request.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { Payment } from './payments/entities/payment.entity';
import { envVariableKeys } from './common/env-variable-keys';
import { SimulatorModule } from './simulator/simulator.module';
import { ConsultingModule } from './consulting/consulting.module';
import { UsabilityServiceModule } from './usability-service/usability-service.module';
import { OrdersModule } from './orders/orders.module';

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
        entities: [
          Product,
          Brand,
          User,
          RefreshToken,
          Category,
          ProductImage,
          ProductOption,
          ProductCompatibility,
          ProductRecommendation,
          CartItem,
          WishlistItem,
          SimulatorSet,
          SimulatorSetItem,
          ConsultingRequest,
          UsabilityServiceRequest,
          Order,
          OrderItem,
          Payment,
        ],
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
    AuthModule,
    CartModule,
    WishlistModule,
    CategoriesModule,
    SimulatorModule,
    ConsultingModule,
    UsabilityServiceModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

