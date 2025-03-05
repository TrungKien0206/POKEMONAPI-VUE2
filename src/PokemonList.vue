<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const searchQuery = ref("");
const isLoading = ref(true);
const allPokemonList = ref([]);
const visibleCount = ref(16); 
const router = useRouter();
const offset = ref(0); 

const fetchPokemon = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon?offset=${offset.value}&limit${limit}`
    );
    if (!res.ok) throw new Error("Không thể tải danh sách Pokémon!");
    const data = await res.json();

    const pokemonDetails = await Promise.all(
      data.results.map(async (p) => {
        const detailsRes = await fetch(p.url);
        const details = await detailsRes.json();
        return {
          id: details.id,
          name: details.name,
          image: details.sprites.front_default,
        };
      })
    );

    allPokemon.value = [...allPokemon.value, ...pokemonDetails]; 
    displayedPokemon.value = allPokemon.value; //  hiển thị tất cả Pokémon đã tải
    offset.value += limit; // Tăng offset để tải tiếp
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};

async function fetchAllPokemon() {
  try {
    const response = await fetch(
      "https://pokeapi.co/api/v2/pokemon?offset=0&limit=1000"
    );
    if (!response.ok) throw new Error("Không thể lấy danh sách Pokémon!");

    const data = await response.json();
    const promises = data.results.map(async (pokemon) => {
      const detailResponse = await fetch(pokemon.url);
      if (!detailResponse.ok) throw new Error(`Lỗi khi tải ${pokemon.name}`);

      const detailData = await detailResponse.json();
      return {
        id: detailData.id,
        name:
          detailData.name.charAt(0).toUpperCase() + detailData.name.slice(1),
        image:
          detailData.sprites.front_default || "https://via.placeholder.com/96",
        types: detailData.types.map((typeInfo) => typeInfo.type.name),
      };
    });

    allPokemonList.value = (await Promise.all(promises)).filter(
      (pokemon) => pokemon !== null
    );
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu Pokémon:", error.message);
    alert("Không thể tải danh sách Pokémon. Vui lòng thử lại sau.");
  } finally {
    isLoading.value = false;
  }
}

const loadMore = () => {
  if (visibleCount.value < allPokemonList.value.length) {
    visibleCount.value += 40;
  }
};

const filteredPokemon = computed(() => {
  const searchResult = allPokemonList.value.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
  return searchResult.slice(0, visibleCount.value); 
});


const goToDetail = (id) => {
  console.log("Chuyển đến Pokémon ID:", id);
  router.push(`/pokemon/${id}`);
};

onMounted(fetchAllPokemon);
</script>

<template>
  <div class="container">
    <h1 style="color: rgb(170, 49, 49)">Pokemon API</h1>

    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Tìm kiếm Pokémon..."
      />
    </div>

    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
    </div>

    <div v-else class="pokemon-list">
      <router-link
        v-for="pokemon in filteredPokemon"
        :key="pokemon.id"
        :to="`/pokemon/${pokemon.id}`"
        class="pokemon-card"
      >
        <p>#{{ pokemon.id }}</p>
        <img :src="pokemon.image" :alt="pokemon.name" />
        <h2>{{ pokemon.name }}</h2>
        <div class="types">
          <span
            v-for="type in pokemon.types"
            :key="type"
            :class="['type', type.toLowerCase()]"
          >
            {{ type }}
          </span>
        </div>
      </router-link>
    </div>

    <div
      v-if="visibleCount < allPokemonList.length"
      class="load-more-container"
    >
      <button @click="loadMore" class="load-more-btn">Load More</button>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
}

body {
  background-color: #f8f9fd;
}

.container {
  text-align: center;
  padding: 20px;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #333;
}

.search-bar input {
  width: 300px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 50px;
  font-size: 1rem;
  outline: none;
  box-shadow: 1px 2px 5px rgba(224, 22, 22, 0.1);
  transition: border-color 0.3s ease;
}
.search-bar input:focus {
  border-color: black;
}

.pokemon-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.pokemon-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
  width: 180px;
  text-align: center;
  transition: transform 0.3s ease, border 0.3s ease;
  border: 2px solid transparent;
  cursor: pointer;
}
.pokemon-card:hover {
  transform: translateY(-10px);
  border: 2px solid black;
}
.pokemon-card img {
  width: 130px;
  height: 130px;
  object-fit: contain;
  margin: 10px 0;
}
.pokemon-card h2 {
  font-size: 1.2rem;
  color: #333;
}

.pokemon-card p {
  font-size: 0.9rem;
  color: #666;
}

.types {
  margin-top: 10px;
}

.type {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 5px;
  color: white;
  font-size: 0.8rem;
  margin: 2px;
}

.type.grass {
  background-color: #78c850;
}

.type.poison {
  background-color: #a040a0;
}

.type.fire {
  background-color: #f08030;
}

.type.flying {
  background-color: #a890f0;
}

.load-more-container {
  margin-top: 20px;
  text-align: center;
}

.load-more-btn {
  padding: 12px 24px;
  font-size: 1.1rem;
  font-weight: bold;
  color: white;
  background: linear-gradient(45deg, #3498db, #6dd5fa);
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  outline: none;
}

.load-more-btn:hover {
  background: linear-gradient(45deg, #2980b9, #57c1eb);
  transform: scale(1.05);
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.15);
}

.load-more-btn:active {
  transform: scale(0.95);
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(0, 0, 0, 0.1);
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
