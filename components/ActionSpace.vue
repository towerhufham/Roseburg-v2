<template>
    <div v-bind:class="activeClasses" class="flex flex-col items-center border-2 border-yellow-500 rounded-lg shadow-md p-1 hover:bg-yellow-50">
      <h2 class="text-xl">{{ action.name }}</h2>
      <hr class="w-20 m-2 border-yellow-500" />
      <div class="text-center">
        <span v-for="cost in action.cost" :key="cost.resource" class="text-xl">
            {{ formatResourceCost(cost) }}
        </span>
        <span v-if="action.cost.length > 0" class="text-xl text-yellow-400">
          🠊
        </span>
        <span v-for="gain in action.gain" :key="gain.resource" class="text-xl">
            {{ formatResourceGain(gain) }}
        </span>
        <span v-if="action.randomGain" class="text-xl">
            {{ formatRandomGain(action.randomGain) }}
        </span>
      </div>
    </div>
</template>

<script setup lang="ts">
    import { ResourceCost, ResourceGain, getEmoji } from "@/store/Game"
    const props = defineProps(['action']);
    function formatResourceCost(rc: ResourceCost): string {
        return `-${rc.cost}${getEmoji(rc.resource)}`
    }
    function formatResourceGain(rg: ResourceGain): string {
        return `+${rg.gain}${getEmoji(rg.resource)}`
    }
    function formatRandomGain(rgs: ResourceGain[]): string {
        let str = ""
        for (const rg of rgs) {
            str += `/${rg.gain >= 0 ? "+" : ""}${rg.gain}${getEmoji(rg.resource)}`
        }
        return str.substring(1);
    }
    const activeClasses = computed(() => {
        return {
            "bg-yellow-100": props.action.active,
            "bg-slate-300": !props.action.active
        }
    })
</script>