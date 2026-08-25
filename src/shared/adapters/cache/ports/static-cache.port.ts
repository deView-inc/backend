export interface ICacheService {
    getOne(key: string): Promise<string | null>;
    getMany(keys: readonly string[]): Promise<readonly (string | null)[]>;
    getCollection(collectionKey: string): Promise<readonly string[]>;

    setOne(key: string, value: string, ttlSeconds?: number): Promise<void>;
    setMany(
        items: readonly { readonly key: string; readonly value: string }[],
        ttlSeconds?: number,
    ): Promise<void>;

    addOneToCollection(key: string, value: string, ttlSeconds?: number): Promise<void>;
    addManyToCollection(key: string, values: readonly string[], ttlSeconds?: number): Promise<void>;

    removeOne(key: string): Promise<void>;
    removeMany(keys: readonly string[]): Promise<void>;

    removeOneFromCollection(key: string, value: string): Promise<void>;
    removeManyFromCollection(key: string, values: readonly string[]): Promise<void>;

    getTtl(key: string): Promise<number>;
    getOneWithTtl(
        key: string,
    ): Promise<{ readonly value: string | null; readonly ttlSeconds: number }>;

    transaction(): ICacheTransaction;

    isAlive(): Promise<boolean>;
}

export interface ICacheTransaction {
    setOne(key: string, value: string, ttlSeconds?: number): this;
    setMany(
        items: readonly { readonly key: string; readonly value: string }[],
        ttlSeconds?: number,
    ): this;

    addOneToCollection(key: string, value: string, ttlSeconds?: number): this;
    addManyToCollection(key: string, values: readonly string[], ttlSeconds?: number): this;

    removeOne(key: string): this;
    removeMany(keys: readonly string[]): this;

    removeOneFromCollection(key: string, value: string): this;
    removeManyFromCollection(key: string, values: readonly string[]): this;

    execute(): Promise<void>;
}
