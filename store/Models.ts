export enum Resource {
    Points = "Points",
    Time = "Time",
    Builds = "Builds",
    Wood = "Wood",
    Grain = "Grain",
    Stone = "Stone",
    Fish = "Fish",
    Mushroom = "Mushroom",
    Rose = "Rose"
}

export function getEmoji(resource: Resource): string {
    const table: Record<Resource, string> = {
        Points: "⚜️",
        Time: "⌛",
        Builds: "🔨",
        Wood: "🪵",
        Grain: "🌾",
        Stone: "🪨",
        Fish: "🐟",
        Mushroom: "🍄",
        Rose: "🌹",

    }
    return table[resource];
}

export interface ResourceCost {
    resource: Resource,
    cost: number
}

export interface ResourceGain {
    resource: Resource,
    gain: number
}

export class ActionSpace {
    name: string;
    active: boolean;
    cost: ResourceCost[];
    gain: ResourceGain[];
    randomGain?: ResourceGain[];

    constructor(name: string, cost: ResourceCost[], gain: ResourceGain[], randomGain?: ResourceGain[]) {
        this.name = name;
        this.active = true;
        this.cost = cost;
        this.gain = gain;
        this.randomGain = randomGain;
    }
}

export interface GameState {
    inventory: Record<Resource, number>,
    actionsTaken: ActionSpace[],
    builtSpaces: ActionSpace[],
    blueprintSpaces: ActionSpace[]
}