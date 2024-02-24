import { Matcher } from "./Matcher.js";

/**
 * Aggregatates multiple items into a single one. The concept is similar to a
 * Collector/Combiner/Accumulator/Builder.
 * @template T the result type of the aggregation
 * @template K the type of the item being aggregated
 */
export abstract class Aggregator<T, K> {
    abstract build(): T;
    abstract aggregate(item: K): void;
    aggregateAll(items: K[]): void {
        items.forEach((item) => this.aggregate(item));
    }
}

class NullAggregator<T, K> extends Aggregator<T, K> {
    override build(): T {
        throw new Error("Null class is not supposed to be used.");
    }
    override aggregate(item: K): void {
        throw new Error("Null class is not supposed to be used.");
    }
}

export const NULL_AGGREGATOR = new NullAggregator();

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Aggregate {
    /**
     * Aggregator that delegates all the aggregation to another aggregator.
     * @see {@link InGroup}
     */
    export abstract class Forwarding<T, K> extends Aggregator<T, K> {
        constructor(private aggregator: Aggregator<Partial<T>, K>) {
            super();
        }
        override aggregate(item: K): void {
            this.aggregator.aggregate(item);
        }
    }
    /**
     * Aggregator that delegates the aggregation task to an array of aggregators.
     * Ordering between aggregators relies on array iteration order.
     * @see {@link Forwarding}
     */
    export abstract class InGroup<T, K> extends Aggregator<T, K> {
        constructor(private aggregators: Aggregator<object, K>[]) {
            super();
        }
        override aggregate(item: K): void {
            this.aggregators.forEach((agg) => agg.aggregate(item));
        }
    }

    /**
     * Aggregator that delegates the aggregation task to a dynamically
     * assigned aggregator.
     */
    export abstract class Dynamically<T, K> extends Aggregator<T, K> {
        constructor(private current: Aggregator<object, K>) {
            super();
        }
        override aggregate(item: K): void {
            this.current = this.getNextAggregator(item, this.current);
            this.current.aggregate(item);
        }
        protected abstract getNextAggregator(newItem: K, currAggregator: Aggregator<object, K>): Aggregator<object, K>;
    }

    export abstract class BasedOnPredicate<T, K> extends Aggregator<T, K> {
        constructor(private matcher: Matcher<K>) {
            super();
        }
        override aggregate(item: K): void {
            this.beforeMatching(item);
            if (this.matcher.match(item)) {
                this.onMatched(item);
            }
            this.afterMatching(item);
        }
        /**
         * Will always run before object matching is done.
         */
        protected beforeMatching(item: K): void {}
        /**
         * Callback to be run when item match the criteria.
         */
        protected abstract onMatched(item: K): void;
        /**
         * Will always run after {@link onMatched} regardless of {@link matcher} result.
         */
        protected afterMatching(item: K) {}
    }

    export class ToSimpleArray<K> extends Aggregator<K[], K> {
        constructor(private arr: K[] = []) {
            super();
        }
        override build(): K[] {
            return this.arr;
        }
        override aggregate(item: K): void {
            this.arr.push(item);
        }
    }
}
