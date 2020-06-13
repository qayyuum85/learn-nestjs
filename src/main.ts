import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as config from 'config'

async function bootstrap() {
  const logger = new Logger('bootstrap')
  const app = await NestFactory.create(AppModule);

  const serverConfig =  config.get('server');
  await app.listen(process.env.PORT || serverConfig.port);
  logger.log(`Application is listening on port ${process.env.PORT || serverConfig.port}`)
}
bootstrap();
