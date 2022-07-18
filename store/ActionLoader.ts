import { ResourceCost, ResourceGain, ActionSpace } from "./Models";
// @ts-ignore
import rawData from "assets/data/ActionSpaces.yaml?raw"
import { parse } from 'yaml'

function parseSpace(space): ActionSpace {
    let cost: ResourceCost[] = [];
    let gain: ResourceGain[] = [];
    let randomGain: ResourceGain[] = [];
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
    return new ActionSpace(space.name, cost, gain, randomGain);
}

const loadedData = parse(rawData)
const startingActions = loadedData.starting.map(space => parseSpace(space))
const allBlueprintActions = loadedData.age1.map(space => parseSpace(space))

let shuffledBlueprintActions = useShuffle(allBlueprintActions);
let startingBlueprints = [];
for (let i = 0; i < 8; i++) {
    startingBlueprints.push(shuffledBlueprintActions.pop())
}

export default {startingActions, startingBlueprints};