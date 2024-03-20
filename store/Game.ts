import { defineStore } from "pinia"

export type Resource = 
    "Points" | "Time" | "Builds" |
    "Wood" | "Grain" | "Stone" |
    "Fish" | "Mushroom" | "Rose"


export const getEmoji = (resource: Resource) => {
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
    if (!table[resource]) throw new Error(`Error: can't find emoji for resource ${resource}`)
    return table[resource]
}

export type ResourceCost = {
    resource: Resource,
    cost: number
}

export type ResourceGain = {
    resource: Resource,
    gain: number
}

export type ActionSpace = {
    name: string,
    active: boolean,
    cost: ResourceCost[],
    gain: ResourceGain[],
    randomGain?: ResourceGain[]
}

let startingActions: ActionSpace[] = []
let blueprintActions: ActionSpace[] = []
//not 100% sure what's needed to remove this ignore
// @ts-ignore
import yam from "assets/data/ActionSpaces.yaml?raw" //could try toml
import { parse } from 'yaml'
for (const space of parse(yam)) {
    let cost: ResourceCost[] = []
    let gain: ResourceGain[] = []
    let randomGain: ResourceGain[] = []
    //these three ifs are clunky
    if (space.cost) {
        for (const c of space.cost) {
            const n = c.hasOwnProperty("amount") ? c.amount : 1
            cost.push({resource: c.resource, cost: n})
        }
    }
    if (space.gain) {
        for (const g of space.gain) {
            const n = g.hasOwnProperty("amount") ? g.amount : 1
            gain.push({resource: g.resource, gain: n})
        }
    }
    if (space.randomGain) {
        for (const rg of space.randomGain) {
            const n = rg.hasOwnProperty("amount") ? rg.amount : 1
            randomGain.push({resource: rg.resource, gain: n})
        }
    }
    const as: ActionSpace = {
        name: space.name, 
        active: true,
        cost: cost, 
        gain: gain, 
        randomGain: randomGain
    }
    if (space.starting) {
        startingActions.push(as)
    } else {
        blueprintActions.push(as)
    }
}

//ew, mutations
let allBlueprintActions = useShuffle(blueprintActions) //probably can just use a shuffle util (currenty using nuxt/lodash)
let currentBlueprints: ActionSpace[] = []
for (let i = 0; i < 8; i++) {
    currentBlueprints.push(allBlueprintActions.pop()) //this can push undefineds probably, needs to count length
}


// export interface GameState {
//     inventory: Record<Resource, number>, //this should probably have a type alias like ResourceAmount
//     actionsTaken: ActionSpace[],
//     builtSpaces: ActionSpace[],
//     blueprintSpaces: ActionSpace[]
// }

export const useStore = defineStore("main", () => {
    const inventory = ref({
        Points: 0,
        Time: 10,
        Builds: 0,
        Wood: 0,
        Grain: 0,
        Stone: 0,
        Fish: 0,
        Mushroom: 0,
        Rose: 0,
    })
    const actionsTaken = ref([])
    const builtSpaces = ref(startingActions)
    const blueprintSpaces = ref(currentBlueprints)

    const randInt = (min: number, max: number) => { //this should maybe be from a seeded rng library
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
    const changeResource = (resource: Resource, n: number) => {
        inventory.value[resource] += n
    }
    const takeAction = (as: ActionSpace) => {
        //make sure we can pay for it, it hasn't been taken, & have time
        if (inventory.value["Time"] <= 0 || !as.active) {
            return false
        }
        for (const c of as.cost) {
            if (inventory.value[c.resource] < c.cost) {
                return false
            }
        }
        //actually take the action now
        for (const c of as.cost) {
            changeResource(c.resource, -c.cost)
        }
        for (const g of as.gain) {
            changeResource(g.resource, g.gain)
        }
        //if there are random gains, get one
        if (as.randomGain) {
            if (as.randomGain.length > 0) {
                const index = randInt(0, as.randomGain.length-1)
                const rg = as.randomGain[index]
                changeResource(rg.resource, rg.gain)
            }
        }
        //record action
        as.active = false
        return true
    }
    const buildAction = (as: ActionSpace) => {
        blueprintSpaces.value = blueprintSpaces.value.filter(s => s !== as)
        builtSpaces.value.push(as)
    }

    return { 
        inventory, actionsTaken, builtSpaces, blueprintSpaces,
        randInt, changeResource, takeAction, buildAction
    }
})