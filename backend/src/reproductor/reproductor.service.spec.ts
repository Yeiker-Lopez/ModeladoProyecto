import { Test, TestingModule } from '@nestjs/testing';
import { ReproductorService } from './reproductor.service';

describe('ReproductorService', () => {
  let service: ReproductorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReproductorService],
    }).compile();

    service = module.get<ReproductorService>(ReproductorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
