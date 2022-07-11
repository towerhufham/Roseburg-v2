import { defineStore } from "pinia";

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
        this.randomGain = []
    }
}

export interface GameState {
    inventory: Record<Resource, number>,
    actionsTaken: ActionSpace[],
    builtSpaces: ActionSpace[],
    blueprintSpaces: ActionSpace[]
}

export const useStore = defineStore("main", {
    state: (): GameState => {
        //stochastic for now
        return {
            inventory: {
                Points: 0,
                Time: 10,
                Builds: 0,
                Wood: 0,
                Grain: 0,
                Stone: 0,
                Fish: 0,
                Mushroom: 0,
                Rose: 0,
            },
            actionsTaken: [],
            builtSpaces: [
                new ActionSpace(
                    "Building", 
                    [
                        {resource: Resource.Wood, cost: 2}, 
                        {resource: Resource.Grain, cost: 1}
                    ], 
                    [
                        {resource: Resource.Builds, gain: 1}
                    ]
                ),
                new ActionSpace(
                    "Woodcutting", 
                    [], 
                    [
                        {resource: Resource.Wood, gain: 2}
                    ]
                ),
                new ActionSpace(
                    "Planting", 
                    [], 
                    [
                        {resource: Resource.Grain, gain: 1}
                    ]
                ),
            ],
            blueprintSpaces: [
                {
                    name: "Farming", 
                    active: true,
                    cost: [
                        {resource: Resource.Wood, cost: 1}
                    ], gain: [
                        {resource: Resource.Grain, gain: 2}
                    ]
                },
                {
                    name: "Digging", 
                    active: true,
                    cost: [], 
                    gain: [
                        {resource: Resource.Stone, gain: 1}
                    ]
                },
                {
                    name: "Foraging", 
                    active: true,
                    cost: [], 
                    gain: [],
                    randomGain: [
                        {resource: Resource.Wood, gain: 2},
                        {resource: Resource.Grain, gain: 2},
                        {resource: Resource.Stone, gain: 2},
                    ]
                },
                {
                    name: "Stonework", 
                    active: true,
                    cost: [{resource: Resource.Stone, cost: 2}], 
                    gain: [],
                    randomGain: [
                        {resource: Resource.Builds, gain: 1},
                    ]
                },
                {
                    name: "Carving", 
                    active: true,
                    cost: [{resource: Resource.Stone, cost: 2}], 
                    gain: [],
                    randomGain: [
                        {resource: Resource.Points, gain: 1},
                    ]
                },
                {
                    name: "Fishing", 
                    active: true,
                    cost: [{resource: Resource.Wood, cost: 1}], 
                    gain: [],
                    randomGain: [
                        {resource: Resource.Fish, gain: 1},
                        {resource: Resource.Fish, gain: 2},
                        {resource: Resource.Fish, gain: 3},
                    ]
                },
                {
                    name: "Cooking", 
                    active: true,
                    cost: [
                        {resource: Resource.Fish, cost: 1},
                        {resource: Resource.Grain, cost: 1},
                    ], 
                    gain: [
                        {resource: Resource.Points, gain: 2}
                    ],
                    randomGain: []
                },
                {
                    name: "Pond", 
                    active: true,
                    cost: [
                        {resource: Resource.Fish, cost: 4},
                    ], 
                    gain: [
                        {resource: Resource.Points, gain: 2}
                    ],
                    randomGain: []
                },
                {
                    name: "Stew", 
                    active: true,
                    cost: [
                        {resource: Resource.Mushroom, cost: 1},
                        {resource: Resource.Fish, cost: 1},
                    ], 
                    gain: [
                        {resource: Resource.Points, gain: 4},
                    ],
                    randomGain: []
                },
                {
                    name: "Rose Picking", 
                    active: true,
                    cost: [], 
                    gain: [],
                    randomGain: [
                        {resource: Resource.Rose, gain: 0},
                        {resource: Resource.Rose, gain: 1},
                    ]
                },
                {
                    name: "Rose Viewing", 
                    active: true,
                    cost: [
                        {resource: Resource.Rose, cost: 1},
                    ], 
                    gain: [
                        {resource: Resource.Points, gain: 2},
                    ],
                    randomGain: []
                },
                {
                    name: "'Shrooms", 
                    active: true,
                    cost: [
                        {resource: Resource.Mushroom, cost: 1},
                    ], 
                    gain: [],
                    randomGain: [
                        {resource: Resource.Points, gain: -1},
                        {resource: Resource.Points, gain: 3}
                    ]
                },
                {
                    name: "Composting", 
                    active: true,
                    cost: [
                        {resource: Resource.Wood, cost: 3},
                    ], 
                    gain: [],
                    randomGain: [
                        {resource: Resource.Mushroom, gain: 1},
                    ]
                },
            ]
        }
    },
    actions: {
        randInt(min: number, max: number) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        changeResource(resource: Resource, n: number) {
            this.inventory[resource] += n;
        },
        takeAction(as: ActionSpace): boolean {
            //make sure we can pay for it, it hasn't been taken, & have time
            if (this.inventory["Time"] <= 0 || !as.active) {
                return false;
            }
            for (const c of as.cost) {
                if (this.inventory[c.resource] < c.cost) {
                    return false;
                }
            }
            //actually take the action now
            for (const c of as.cost) {
                this.changeResource(c.resource, -c.cost);
            }
            for (const g of as.gain) {
                this.changeResource(g.resource, g.gain);
            }
            //if there are random gains, get one
            if (as.randomGain) {
                if (as.randomGain.length > 0) {
                    const index = this.randInt(0, as.randomGain.length-1);
                    const rg = as.randomGain[index];
                    this.changeResource(rg.resource, rg.gain);
                }
            }
            //time tick
            //this.inventory["Time"]--;
            //record action
            as.active = false;
            return true
        },
        buildAction(as: ActionSpace) {
            this.blueprintSpaces = this.blueprintSpaces.filter(s => s !== as);
            this.builtSpaces.push(as);
        }
    }
})