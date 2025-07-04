export class GQueue<T> {
    private items: T[] = [];

    // Add to the end
    enqueue(item: T): void {
        this.items.push(item);
    }

    // Remove from the front
    dequeue(): T | undefined {
        return this.items.shift();
    }

    // Peek at the front
    peek(): T | undefined {
        return this.items[0];
    }

    // Check if empty
    isEmpty(): boolean {
        return this.items.length === 0;
    }

    // Size of the queue
    size(): number {
        return this.items.length;
    }

    // Clear the queue
    clear(): void {
        this.items = [];
    }

    // Check if the queue contains an item
    contains(item: T): boolean {
        return this.items.includes(item);
    }
}