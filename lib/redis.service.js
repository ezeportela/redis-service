import {createClient} from 'redis';

class RedisService {

  constructor(options) {
    if (!options.host || !options.port) {
      throw new Error('redis is not configured');
    }

    this.client = createClient(options.port, options.host);

    if (options.auth) {
      this.client.auth(options.auth);
    }
  }

  setValue(key, value) {
    this.client.set(key, value);
  }

  getValue(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (error, result) => {
        resolve(result);
      });
    });
  }

  setJsonValue(key, json) {
    if (json) {
      this.setValue(key, JSON.stringify(json));
    }
  }

  async getJsonValue(key) {
    const result = await this.getValue(key);
    return JSON.parse(result);
  }

  end() {
    this.client.end(true);
    this.client.quit();
  }

  getAllKeys() {
    return new Promise((resolve, reject) => {
      this.client.keys('*', (err, keys) => {
        resolve(keys);
      });
    });
  }

  deleteAllKeys() {
    return new Promise((resolve, reject) => {
      this.client.flushdb((err, succeeded) => {
        resolve();
      });
    });
  }
}

export default RedisService;