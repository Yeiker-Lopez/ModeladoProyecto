import { Test, TestingModule } from '@nestjs/testing';
import { RecuperarPasswordService } from './recuperar-password.service';

describe('RecuperarPasswordService', () => {
  let service: RecuperarPasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecuperarPasswordService],
    }).compile();

    service = module.get<RecuperarPasswordService>(RecuperarPasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
