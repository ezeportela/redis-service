import dotenv from 'dotenv';
import RedisService from '../lib/redis.service';
import axios from 'axios';

dotenv.config();

const config = {
  database: {
    host: process.env.REDIS_DB_HOST,
    port: process.env.REDIS_DB_PORT,
    auth: process.env.REDIS_DB_AUTH,
  },
};

let redisService;

beforeAll(() => {
  const {host, port, auth} = config.database;
  
  // Test without auth
  new RedisService({host, port});

  redisService = new RedisService({host, port, auth});
});

afterAll(() => redisService.end());

describe('test redis service', () => {
  test('test connect to redis', async (done) => {
    redisService.setValue('ping', 'pong');
    const ping = await redisService.getValue('ping');
    expect(ping).toBe('pong');
    done();
  });

  test('error to connect to redis', () => {
    try {
      new RedisService({});
    } catch (err) {
      expect(err.message).toBe('redis is not configured');
    }
  });

  test('delete all keys', async (done) => {
    await redisService.deleteAllKeys();
    const keys = await redisService.getAllKeys();
    expect(keys.length).toEqual(0);
    done();
  });

  test('populate redis', async (done) => {
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
    expect(response.status).toEqual(200);
    
    const posts = response.data;

    for (let post of posts) {
      redisService.setJsonValue(post.id, post);
    }

    const keys = await redisService.getAllKeys();
    expect(keys.length).toBeGreaterThanOrEqual(100);
    done();
  });

  test('get and set json', async (done) => {
    const cuit = '20123456786';
    const subscription = {
      'NRO_DNI': '12345678',
      'NRO_CUIT': cuit,
      'SEXO': 'M',
      'Q_ID': '1-1234',
      'Q_MEMBER_NUMBER': '1-12345678',
    };

    // Test set null
    redisService.setJsonValue(cuit);

    redisService.setJsonValue(cuit, subscription);

    const json = await redisService.getJsonValue(cuit);
    expect(json).toEqual(subscription);
    done();
  });
});