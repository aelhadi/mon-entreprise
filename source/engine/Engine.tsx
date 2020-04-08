import Value from 'Components/Value'
import React, { createContext, useContext, useMemo } from 'react'
import rules, { DottedName } from 'Rules'
import Engine from '.'
export const EngineContext = createContext<{
	engine: Engine<DottedName> | null
	error: string | null
}>({ engine: new Engine({ rules }), error: null })

type InputProps = {
	rules?: any
	situation?: any
	children: React.ReactNode
}

export function Provider({ rules, situation, children }: InputProps) {
	const [engine, error] = useMemo(() => {
		try {
			return [new Engine({ rules }), null]
		} catch (err) {
			return [null, (err?.message ?? err.toString()) as string]
		}
	}, [rules])
	if (engine !== null && !Object.is(situation, engine.situation)) {
		engine.setSituation(situation)
	}
	return (
		<EngineContext.Provider value={{ engine, error }}>
			{children}
		</EngineContext.Provider>
	)
}

// TODO : assess the need for additional abstractions. Maybe we should just use context
// to fetch the current Engine instead ?
export function useEvaluation(expression: string, unit?: string) {
	return useContext(EngineContext).engine?.evaluate(expression, unit)
}

export function useEngine() {
	return useContext(EngineContext).engine
}

export function useInversionFail() {
	return useContext(EngineContext).engine?.inversionFail()
}

export function useError() {
	return useContext(EngineContext).error
}

export function useControls() {
	return useContext(EngineContext).engine?.controls()
}

export function Evaluation({ expression }) {
	const value = useEvaluation(expression)
	return value === null ? null : <Value {...value} />
}
