import dotenv from 'dotenv';
dotenv.config();

const config = {
  database: {
    host: process.env.REDIS_DB_HOST,
    port: process.env.REDIS_DB_PORT,
    auth: process.env.REDIS_DB_AUTH,
  },
};

import RedisService from '../lib/redis.service';

let redisService;

describe('test redis service', () => {
  test('connect to redis', async () => {
    const {host, port, auth} = config.database;
    redisService = new RedisService({host, port, auth});
    redisService.setValue('1', 'thanks');
    const value = await redisService.getValue('1');
    redisService.end();
    expect(value).toBe('thanks');
  });
});