import { Test, TestingModule } from '@nestjs/testing';
import { RecuperarPasswordController } from './recuperar-password.controller';
import { RecuperarPasswordService } from './recuperar-password.service';

describe('RecuperarPasswordController', () => {
  let controller: RecuperarPasswordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecuperarPasswordController],
      providers: [RecuperarPasswordService],
    }).compile();

    controller = module.get<RecuperarPasswordController>(RecuperarPasswordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
