import { defineStore } from "pinia";

export enum Resource { //should be a union type of strings
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

export function getEmoji(resource: Resource): string { //can be a switch
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

export class ActionSpace { //make type, not class
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

let startingActions = [];
let blueprintActions = [];
//can probably remove the @ts-ignore with "as" 
// @ts-ignore
import yam from "assets/data/ActionSpaces.yaml?raw" //should make toml
import { parse } from 'yaml'
for (const space of parse(yam)) {
    let cost: ResourceCost[] = [];
    let gain: ResourceGain[] = [];
    let randomGain: ResourceGain[] = [];
    //these three ifs are clunky
    if (space.cost) {
        for (const c of space.cost) {
            const n = c.hasOwnProperty("amount") ? c.amount : 1;
            cost.push({resource: c.resource, cost: n})
        }
    }
    if (space.gain) {
        for (const g of space.gain) {
            const n = g.hasOwnProperty("amount") ? g.amount : 1;
            gain.push({resource: g.resource, gain: n})
        }
    }
    if (space.randomGain) {
        for (const rg of space.randomGain) {
            const n = rg.hasOwnProperty("amount") ? rg.amount : 1;
            randomGain.push({resource: rg.resource, gain: n})
        }
    }
    const a = new ActionSpace(space.name, cost, gain, randomGain);
    if (space.starting) {
        startingActions.push(a)
    } else {
        blueprintActions.push(a)
    }
}
let allBlueprintActions = useShuffle(blueprintActions); //probably can just use a util
let currentBlueprints = [];
for (let i = 0; i < 8; i++) {
    currentBlueprints.push(allBlueprintActions.pop()) //this can push undefineds probably, needs to count length
}


export interface GameState {
    inventory: Record<Resource, number>, //this should probably have a type alias like ResourceAmount
    actionsTaken: ActionSpace[],
    builtSpaces: ActionSpace[],
    blueprintSpaces: ActionSpace[]
}

export const useStore = defineStore("main", { //is this pinia??
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
            builtSpaces: startingActions,
            blueprintSpaces: currentBlueprints
        }
    },
    actions: {
        randInt(min: number, max: number) { //this should be util, or maybe from a seeded rng library
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