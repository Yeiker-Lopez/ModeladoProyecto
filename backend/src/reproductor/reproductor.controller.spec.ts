import { Test, TestingModule } from '@nestjs/testing';
import { ReproductorController } from './reproductor.controller';
import { ReproductorService } from './reproductor.service';

describe('ReproductorController', () => {
  let controller: ReproductorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReproductorController],
      providers: [ReproductorService],
    }).compile();

    controller = module.get<ReproductorController>(ReproductorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
