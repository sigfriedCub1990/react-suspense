// Cache resources
// http://localhost:3000/isolated/exercise/04.js

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

const SUSPENSE_CONFIG = {
    timeoutMs: 4000,
    busyDelayMs: 300,
    busyMinDurationMs: 700,
}

/*
 * Simple cache to store the result from
 * `createPokemonResource` function
 */

const CacheContext = React.createContext()
CacheContext.displayName = 'CacheContext'

const useCacheContext = () => {
    return React.useContext(CacheContext)
}

const PokemonCacheProvider = ({ children, cacheTime }) => {
    const pokemonResourceCache = React.useRef({})

    const getPokemonResource = React.useCallback(pokemonName => {
        let pokemonResource = pokemonResourceCache.current[pokemonName]
        if (pokemonResource) {
            return pokemonResource
        } else {
            pokemonResource = createPokemonResource(pokemonName)
            pokemonResourceCache.current[pokemonName] = pokemonResource
        }

        return pokemonResource
    }, [])

    React.useEffect(() => {
        /*
         * Simple and dumb cache invalidation strategy,
         * maybe I can (as an extra++) add LRU cache to this.
         */
        let interval = setInterval(() => {
            if (Object.keys(pokemonResourceCache.current).length !== 0) {
                const key = Object.keys(pokemonResourceCache.current).shift()
                console.log(`Clearing key: ${key}`)
                delete pokemonResourceCache.current[key]
            }
        }, cacheTime)

        return () => clearInterval(interval)
    }, [cacheTime])

    return (
        <CacheContext.Provider value={getPokemonResource}>
            {children}
        </CacheContext.Provider>
    )
}

function createPokemonResource(pokemonName) {
    return createResource(fetchPokemon(pokemonName))
}

function AppWithProvider() {
    return (
        <PokemonCacheProvider cacheTime={20_000}>
            <App />
        </PokemonCacheProvider>
    )
}

function App() {
    const [pokemonName, setPokemonName] = React.useState('')
    const [startTransition, isPending] = React.useTransition(SUSPENSE_CONFIG)
    const [pokemonResource, setPokemonResource] = React.useState(null)
    const resourcesCache = useCacheContext()

    React.useEffect(() => {
        if (!pokemonName) {
            setPokemonResource(null)
            return
        }
        startTransition(() => {
            setPokemonResource(resourcesCache(pokemonName))
        })
    }, [pokemonName, startTransition, resourcesCache])

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

export default AppWithProvider
