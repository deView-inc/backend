import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis, { ChainableCommander } from 'ioredis';

import { ICacheService, ICacheTransaction } from '../ports';

@Injectable()
export class RedisCacheAdapter implements ICacheService {
    private readonly defaultTtl = 259_200; // 3 days in seconds

    constructor(@InjectRedis() private readonly redis: Redis) {}

    async getOne(key: string) {
        return this.redis.get(key);
    }

    async getMany(keys: string[]): Promise<(string | null)[]> {
        if (keys.length === 0) {
            return [];
        }
        return this.redis.mget(keys);
    }

    async getCollection(key: string): Promise<string[]> {
        return this.redis.smembers(key);
    }

    async setOne(key: string, value: string, ttlSeconds: number = this.defaultTtl) {
        await this.redis.set(key, value, 'EX', ttlSeconds);
    }

    async setMany(
        items: readonly { readonly key: string; readonly value: string }[],
        ttlSeconds: number = this.defaultTtl,
    ) {
        if (!items.length) {
            return;
        }

        const pipeline = this.redis.pipeline();

        for (const item of items) {
            pipeline.set(item.key, item.value, 'EX', ttlSeconds);
        }

        await pipeline.exec();
    }

    async addOneToCollection(key: string, value: string, ttlSeconds: number = this.defaultTtl) {
        await this.redis.pipeline().sadd(key, value).expire(key, ttlSeconds).exec();
    }

    async addManyToCollection(key: string, values: string[], ttlSeconds: number = this.defaultTtl) {
        if (!values.length) {
            return;
        }

        await this.redis
            .pipeline()
            .sadd(key, ...values)
            .expire(key, ttlSeconds)
            .exec();
    }

    async removeOne(key: string) {
        await this.redis.del(key);
    }

    async removeMany(keys: string[]) {
        if (!keys.length) {
            return;
        }
        await this.redis.del(keys);
    }

    async removeOneFromCollection(key: string, value: string) {
        await this.redis.srem(key, value);
    }

    async removeManyFromCollection(key: string, values: string[]) {
        if (!values.length) {
            return;
        }
        await this.redis.srem(key, ...values);
    }

    async getTtl(key: string): Promise<number> {
        const ttl = await this.redis.ttl(key);
        return ttl > 0 ? ttl : 0;
    }

    async getOneWithTtl(key: string) {
        const [[, value], [, ttl]] = (await this.redis.pipeline().get(key).ttl(key).exec()) as [
            [Error | null, string | null],
            [Error | null, number],
        ];

        return {
            value,
            ttlSeconds: ttl && ttl > 0 ? ttl : 0,
        };
    }

    transaction(): ICacheTransaction {
        return new RedisTransaction(this.redis.multi());
    }

    async isAlive() {
        try {
            return (await this.redis.ping()) === 'PONG';
        } catch {
            return false;
        }
    }
}

class RedisTransaction implements ICacheTransaction {
    private readonly defaultTtl = 259_200; // 3 days in seconds

    constructor(private readonly multi: ChainableCommander) {}

    setOne(key: string, value: string, ttlSeconds: number = this.defaultTtl): this {
        this.multi.set(key, value, 'EX', ttlSeconds);
        return this;
    }

    setMany(
        items: readonly { readonly key: string; readonly value: string }[],
        ttlSeconds: number = this.defaultTtl,
    ): this {
        for (const item of items) {
            this.multi.set(item.key, item.value, 'EX', ttlSeconds);
        }
        return this;
    }

    addOneToCollection(key: string, value: string, ttlSeconds: number = this.defaultTtl): this {
        this.multi.sadd(key, value);
        this.multi.expire(key, ttlSeconds);
        return this;
    }

    addManyToCollection(key: string, values: string[], ttlSeconds: number = this.defaultTtl): this {
        if (!values.length) {
            return this;
        }
        this.multi.sadd(key, ...values);
        this.multi.expire(key, ttlSeconds);
        return this;
    }

    removeOne(key: string): this {
        this.multi.del(key);
        return this;
    }

    removeMany(keys: string[]): this {
        if (!keys.length) {
            return this;
        }
        this.multi.del(keys);
        return this;
    }

    removeOneFromCollection(collectionKey: string, value: string): this {
        this.multi.srem(collectionKey, value);
        return this;
    }

    removeManyFromCollection(collectionKey: string, values: string[]): this {
        if (!values.length) {
            return this;
        }
        this.multi.srem(collectionKey, ...values);
        return this;
    }

    async execute(): Promise<void> {
        await this.multi.exec();
    }
}
