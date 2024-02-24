import { existsSync, readFileSync, writeFileSync } from "fs";
export abstract class CacheableJsonResource<T> {
    protected resource!: T;
    constructor(private path: string) {}

    fromFs(): T | null {
        if (existsSync(this.path)) {
            return JSON.parse(readFileSync(this.path, "utf-8"));
        }
        return null;
    }
    cache(resource: T) {
        writeFileSync(this.path, JSON.stringify(resource, null, 4));
    }
    abstract fromNetwork(): Promise<T>;

    async load(forceNetwork: boolean = false): Promise<T> {
        if (forceNetwork) {
            this.resource = await this.fromNetwork();
            this.cache(this.resource);
            return this.resource;
        }

        if (this.resource !== undefined) {
            return this.resource;
        }
        let retVal: T | null = this.fromFs();
        if (retVal === null) {
            retVal = await this.fromNetwork();
            this.cache(retVal);
        }
        this.resource = retVal;
        return retVal;
    }
}

export type UpdateOptions = {
    localPath?: string;
    forceNetwork?: boolean;
    localCache?: boolean;
};
