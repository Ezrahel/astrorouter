export class PortAllocator {
    private availablePorts: number[] = [];
    private usedPorts = new Set<number>();
    private portIndex = new Map<number, boolean>();
    private min: number;
    private max: number;

    constructor(min: number, max: number) {
        this.min = min;
        this.max = max;
        this.initializePorts();
    }

    private initializePorts(): void {
        const ports: number[] = [];
        for (let p = this.min; p <= this.max; p++) {
            ports.push(p);
        }
        for (let i = ports.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [ports[i], ports[j]] = [ports[j], ports[i]];
        }
        this.availablePorts = ports;
        for (const port of ports) {
            this.portIndex.set(port, false);
        }
    }

    allocate(requestedPort?: number): number | null {
        if (requestedPort !== undefined) {
            const inUse = this.portIndex.get(requestedPort);
            if (inUse === undefined) {
                return null;
            }
            if (inUse) {
                return null;
            }
            if (!Number.isFinite(requestedPort) || !Number.isInteger(requestedPort)) {
                return null;
            }
            if (requestedPort < this.min || requestedPort > this.max) {
                return null;
            }

            this.portIndex.set(requestedPort, true);
            this.usedPorts.add(requestedPort);
            return requestedPort;
        }

        while (this.availablePorts.length > 0) {
            const port = this.availablePorts.pop()!;
            if (!this.portIndex.get(port)) {
                this.portIndex.set(port, true);
                this.usedPorts.add(port);
                return port;
            }
        }
        return null;
    }

    release(port: number): void {
        if (this.usedPorts.has(port)) {
            this.usedPorts.delete(port);
            this.portIndex.set(port, false);
            this.availablePorts.push(port);
        }
    }

    isInUse(port: number): boolean {
        return this.usedPorts.has(port);
    }

    availableCount(): number {
        return this.availablePorts.length;
    }

    usedCount(): number {
        return this.usedPorts.size;
    }
}