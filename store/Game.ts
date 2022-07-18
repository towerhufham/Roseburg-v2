import { defineStore } from "pinia";
import { GameState, Resource, ActionSpace } from "./Models";

//get loaded actions
import loaded from './ActionLoader';
const { startingActions, startingBlueprints } = loaded;

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
            builtSpaces: startingActions,
            blueprintSpaces: startingBlueprints
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