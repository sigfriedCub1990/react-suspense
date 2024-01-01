// Render as you fetch
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react'
import {
    fetchPokemon,
    PokemonInfoFallback,
    PokemonForm,
    PokemonDataView,
    PokemonErrorBoundary,
} from '../pokemon'
import { createResource } from '../utils'

function PokemonInfo({ pokemonResource }) {
    const pokemon = pokemonResource.read()

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
    const [pokemonName, setPokemonName] = React.useState('')
    const [pokemonResource, setPokemonResource] = React.useState()

    React.useEffect(() => {
        if (!pokemonName) {
            setPokemonResource(null)
        } else {
            setPokemonResource(createResource(fetchPokemon(pokemonName)))
        }
    }, [pokemonName])

    function handleSubmit(newPokemonName) {
        setPokemonName(newPokemonName)
    }

    return (
        <div className="pokemon-info-app">
            <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
            <hr />
            <div className="pokemon-info">
                {pokemonResource ? (
                    /* NOTE: For some reason this isn't working properly */
                    <PokemonErrorBoundary onReset={() => setPokemonName('')}>
                        <React.Suspense
                            fallback={<PokemonInfoFallback name={pokemonName} />}
                        >
                            <PokemonInfo pokemonResource={pokemonResource} />
                        </React.Suspense>
                    </PokemonErrorBoundary>
                ) : (
                    'Submit a pokemon'
                )}
            </div>
        </div>
    )
}

export default App
