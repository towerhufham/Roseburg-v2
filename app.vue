<template>
  <div class="flex flex-col max-h-screen h-screen bg-gradient-to-b from-green-100 to-green-200">
    <NavBar/>
    <div class="flex flex-grow">
      <SideBar/>
      <div class="w-full flex flex-col">
        <Inventory/>
        <BuiltSpaces/>
        <Blueprints/>
      </div>
    </div>
  </div>
  <p>data: {{ data }}</p>
  <p>pending: {{ pending }}</p>
  <p>error: {{ error }}</p>
</template>

<script setup>
const { data, pending, error, refresh } = await useFetch("./assets/data/ActionSpaces.yaml")

</script>