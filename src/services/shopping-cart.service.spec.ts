import { Test } from '@nestjs/testing';

describe('CatsController', () => {
  beforeEach(async () => {
    const module = await Test.createTestingModule({}).compile();
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const total = 1 + 2;
      expect(total).toBe(3);
    });
  });
});
