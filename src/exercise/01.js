// Simple Data-fetching
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'
import {
    PokemonDataView,
    PokemonErrorBoundary,
    PokemonInfoFallback,
    fetchPokemon,
} from '../pokemon'
import { createResource } from '../utils'

const pokemonName = 'charizard'
const resource = createResource(fetchPokemon(pokemonName))

// App renders this component
function PokemonInfo() {
    const pokemon = resource.read()

    return (
        <div>
            <div className="pokemon-info__img-wrapper">
                <img src={pokemon.image} alt={pokemon.name} />
            </div>
            <PokemonDataView pokemon={pokemon} />
        </div>
    )
}

function App() {
    return (
        <div className="pokemon-info-app">
            <div className="pokemon-info">
                <PokemonErrorBoundary>
                    <React.Suspense fallback={<PokemonInfoFallback name={pokemonName} />}>
                        <PokemonInfo />
                    </React.Suspense>
                </PokemonErrorBoundary>
            </div>
        </div>
    )
}

export default App
