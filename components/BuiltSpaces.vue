<script setup lang="ts">
import { useStore } from "@/store/Game"
const store = useStore()
function refresh() {
    if (store.inventory.Time > 0) {
        store.inventory.Time--;
        for (const as of store.builtSpaces) {
            as.active = true;
        }
    }
}
</script>

<template>
  <div class="h-full items-start flex flex-wrap gap-5 p-3">
    <button @click="refresh" class="border-2 border-green-400 bg-green-50 rounded-lg shadow-md p-1 hover:bg-white text-xl">
      ⌛
    </button>
    <ActionSpace v-for="action in store.builtSpaces" v-bind:action="action" :key="action.name" @click="store.takeAction(action)" />
  </div>
</template>