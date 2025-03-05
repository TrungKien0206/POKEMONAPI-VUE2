<template>
  <div class="pokemon-detail">
    <button @click="router.push('/')" class="back-button">⬅ Back</button>

    <div v-if="isLoading" class="loading">Đang tải...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else>
      <img :src="pokemon.image" :alt="pokemon.name" class="pokemon-image" />

      
      <h1 class="pokemon-name">{{ pokemon.name }}</h1>

     
      <div class="pokemon-types">
        <span
          v-for="type in pokemon.types"
          :key="type"
          class="type"
          :class="type.toLowerCase()"
        >
          {{ type }}
        </span>
      </div>

     
      <p class="pokemon-description">
        {{ pokemon.description }}
      </p>

     
      <div class="info-container">
        <div class="info-box">
          <span class="info-label">Height</span>
          <div class="info-value">{{ pokemon.height }}</div>
        </div>
        <div class="info-box">
          <span class="info-label">Weight</span>
          <div class="info-value">{{ pokemon.weight }}</div>
        </div>
      </div>

     
      <h3>Abilities</h3>
      <div class="abilities">
        <span
          v-for="ability in pokemon.abilities"
          :key="ability"
          class="ability"
        >
          {{ ability }}
        </span>
      </div>

    
      <h3>Stats</h3>
      <div class="stats-container">
        <div v-for="(value, key) in statLabels" :key="key" class="stat">
          <div class="stat-oval" :class="key">
            <span class="stat-label">{{ statLabels[key] }}</span>
          </div>
          <div class="stat-value">{{ pokemon.stats[key] }}</div>
        </div>
      </div>

      <h3>Evolution</h3>
      <div class="evolution-container">
        <div class="evolution-chain">
          <div
            v-for="(evo, index) in evolutionChain"
            :key="evo.name"
            class="evolution-item"
          >
            <img
              :src="evo.image"
              :alt="evo.name"
              @click="goToPokemon(evo.id)"
            />
            <span>{{ evo.name }}</span>
            <span v-if="index !== evolutionChain.length - 1" class="arrow">
              >
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const isLoading = ref(true);
const error = ref(null);
const pokemon = ref({});
const evolutionChain = ref([]);

const fetchPokemonData = async (id) => {
  isLoading.value = true;
  error.value = null;
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!res.ok) throw new Error("Không tìm thấy Pokémon!");
    const data = await res.json();

    const speciesRes = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${id}`
    );
    if (!speciesRes.ok) throw new Error("Không thể lấy mô tả Pokémon!");
    const speciesData = await speciesRes.json();

    pokemon.value = {
      id: data.id,
      name: data.name,
      image: data.sprites.other["official-artwork"].front_default,
      height: data.height,
      weight: data.weight,
      types: data.types.map((t) => t.type.name),
      abilities: data.abilities.map((a) => a.ability.name),
      description:
        speciesData.flavor_text_entries.find(
          (entry) => entry.language.name === "en"
        )?.flavor_text || "No description available.",
      stats: {
        hp: data.stats[0].base_stat,
        attack: data.stats[1].base_stat,
        defense: data.stats[2].base_stat,
        special_attack: data.stats[3].base_stat,
        special_defense: data.stats[4].base_stat,
        speed: data.stats[5].base_stat,
      },
    };

    await fetchEvolutionChain(id);
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};

const fetchEvolutionChain = async (id) => {
  try {
    const speciesRes = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${id}`
    );
    if (!speciesRes.ok) throw new Error("Không thể lấy dữ liệu tiến hóa!");

    const speciesData = await speciesRes.json();
    const evoRes = await fetch(speciesData.evolution_chain.url);
    const evoData = await evoRes.json();

    let evoChain = [];
    let evoStep = evoData.chain;

    while (evoStep) {
      const evoId = evoStep.species.url.split("/").slice(-2, -1)[0];
      evoChain.push({
        id: evoId,
        name: evoStep.species.name,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evoId}.png`,
      });
      evoStep = evoStep.evolves_to[0];
    }

    evolutionChain.value = evoChain;
  } catch (err) {
    error.value = err.message;
  }
};

const goToPokemon = (id) => {
  router.push(`/pokemon/${id}`);
};

onMounted(() => {
  fetchPokemonData(route.params.id);
});

watch(
  () => route.params.id,
  (newId) => {
    fetchPokemonData(newId);
  }
);

const statLabels = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  special_attack: "SPA",
  special_defense: "SPD",
  speed: "SPD",
};
</script>
<style scoped>
.pokemon-detail {
  max-width: 500px;
  margin: 40px auto;
  text-align: center;
  font-family: Arial, sans-serif;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  background: #f5f5f5;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
}

.pokemon-image {
  width: 120px;
}

.types {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.type {
  padding: 5px 12px;
  border-radius: 7px;
  color: white;
  font-size: 14px;
  font-weight: bold;
  margin: 0 5px;
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
.type.water {
  background-color: #6890f0;
}
.type.bug {
  background-color: #a8b820;
}
.type.normal {
  background-color: #a8a878;
}
.type.electric {
  background-color: #f8d030;
}
.type.ground {
  background-color: #e0c068;
}
.type.fairy {
  background-color: #ee99ac;
}
.type.fighting {
  background-color: #c03028;
}
.type.psychic {
  background-color: #f85888;
}
.type.rock {
  background-color: #b8a038;
}
.type.steel {
  background-color: #b8b8d0;
}
.type.ice {
  background-color: #98d8d8;
}
.type.ghost {
  background-color: #705898;
}
.type.dragon {
  background-color: #7038f8;
}
.type.dark {
  background-color: #705848;
}
.type.unknown {
  background-color: #68a090;
}
.type.shadow {
  background-color: #705898;
}

.info-container {
  display: flex;
  justify-content: center;
  gap: 100px;
  margin: 20px 0;
  padding: 8px 12px;
  /* border-radius: 12px;
  font-size: 14px;
  margin-bottom: 20px; */
}

.info-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
  padding: 12px 12px;
}

.info-label {
  font-size: 14px;
  font-weight: bold;
  color: #555;
  margin-bottom: 5px;
}

.info-value {
  background: #f5f5f5;
  width: 80px;
  padding: 10px;
  text-align: center;
  font-weight: bold;
  font-size: 16px;
  border-radius: 15px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
}

.stats-container {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 10px;
}

.stat {
  text-align: center;
}

.stat-oval {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  border-radius: 50%; 
  font-size: 12px;
  text-transform: uppercase;
}

.stat-value {
  margin-top: 5px;
  font-weight: bold;
  font-size: 14px;
}


.hp {
  background: #e63946;
}
.attack {
  background: #f4a261;
} 
.defense {
  background: #f4d35e;
} 
.special_attack {
  background: #48cae4;
} 
.special_defense {
  background: #90be6d;
} 
.speed {
  background: #f72585;
} 

.evolution-container {
  margin-top: 30px;
}

.evolution-chain {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.evolution-item {
  text-align: center;
}

.evolution-item img {
  width: 50px;
  cursor: pointer;
}

.arrow {
  font-size: 20px;
}
.abilities {
  display: flex;
  justify-content: center;
  gap: 110px;
}

.ability {
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  margin-bottom: 20px;
  color: black;
}
</style>
