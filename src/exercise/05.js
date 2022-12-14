// Suspense Image
// http://localhost:3000/isolated/exercise/05.js

import * as React from 'react'
import {
    fetchPokemon,
    PokemonInfoFallback,
    PokemonForm,
    PokemonDataView,
    PokemonErrorBoundary,
    getImageUrlForPokemon,
} from '../pokemon'
import { createResource, preloadImage } from '../utils'

const PokemonInfo = React.lazy(() =>
    import('../lazy/pokemon-info-render-as-you-fetch'),
)

const SUSPENSE_CONFIG = {
    timeoutMs: 4000,
    busyDelayMs: 300,
    busyMinDurationMs: 700,
}

const pokemonResourceCache = {}

function getPokemonResource(name) {
    const lowerName = name.toLowerCase()
    let resource = pokemonResourceCache[lowerName]
    if (!resource) {
        resource = {
            data: createPokemonResource(lowerName),
            image: createResource(preloadImage(getImageUrlForPokemon(lowerName))),
        }
    }
    return resource
}

function createPokemonResource(pokemonName) {
    return createResource(fetchPokemon(pokemonName))
}

function App() {
    const [pokemonName, setPokemonName] = React.useState('')
    const [startTransition, isPending] = React.useTransition(SUSPENSE_CONFIG)
    const [pokemonResource, setPokemonResource] = React.useState(null)

    React.useEffect(() => {
        if (!pokemonName) {
            setPokemonResource(null)
            return
        }
        startTransition(() => {
            setPokemonResource(getPokemonResource(pokemonName))
        })
    }, [pokemonName, startTransition])

    function handleSubmit(newPokemonName) {
        setPokemonName(newPokemonName)
    }

    function handleReset() {
        setPokemonName('')
    }

    return (
        <div className="pokemon-info-app">
            <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
            <hr />
            <div className={`pokemon-info ${isPending ? 'pokemon-loading' : ''}`}>
                {pokemonResource ? (
                    <PokemonErrorBoundary
                        onReset={handleReset}
                        resetKeys={[pokemonResource]}
                    >
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
