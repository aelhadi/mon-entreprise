import { evaluateControls } from 'Engine/controls'
import { convertNodeToUnit, simplifyNodeUnit } from 'Engine/nodeUnits'
import { parse } from 'Engine/parse'
import { EvaluatedRule, ParsedRules, Rules } from 'Engine/types'
import { parseUnit } from 'Engine/units'
import { mapObjIndexed } from 'ramda'
import { Simulation } from 'Reducers/rootReducer'
import { evaluationError, warning } from './error'
import { collectDefaults, evaluateNode } from './evaluation'
import parseRules from './parseRules'

const emptyCache = () => ({
	_meta: { contextRule: [] }
})

type EngineConfig<Names extends string> = {
	rules: string | Rules<Names> | ParsedRules<Names>
	useDefaultValues?: boolean
}

type Cache = {
	_meta: {
		contextRule: Array<string>
		inversionFail?: {
			given: string
			estimated: string
		}
	}
}

export { default as translateRules } from './translateRules'
export { parseRules }
export default class Engine<Names extends string> {
	parsedRules: ParsedRules<Names>
	defaultValues: Simulation['situation']
	situation: Simulation['situation'] = {}
	cache: Cache = emptyCache()

	constructor({ rules, useDefaultValues = true }: EngineConfig<Names>) {
		this.parsedRules =
			typeof rules === 'string' || !(Object.values(rules)[0] as any)?.dottedName
				? parseRules(rules)
				: (rules as ParsedRules<Names>)

		this.defaultValues = mapObjIndexed(
			(value, name) =>
				typeof value === 'string'
					? this.evaluateExpression(value, `[valeur par défaut] ${name}`)
					: value,
			useDefaultValues ? collectDefaults(this.parsedRules) : {}
		)
	}

	private resetCache() {
		this.cache = emptyCache()
	}

	private evaluateExpression(
		expression: string,
		context
	): EvaluatedRule<Names> {
		const result = simplifyNodeUnit(
			evaluateNode(
				this.cache,
				this.situationGate,
				this.parsedRules,
				parse(
					this.parsedRules,
					{ dottedName: context },
					this.parsedRules
				)(expression)
			)
		)

		if (Object.keys(result.defaultValue?.missingVariable ?? {}).length) {
			throw new evaluationError(
				context,
				"Impossible d'évaluer l'expression car celle ci fait appel à des variables manquantes"
			)
		}
		return result
	}

	setSituation(situation: Simulation['situation'] = {}) {
		this.resetCache()
		this.situation = mapObjIndexed(
			(value, name) =>
				typeof value === 'string'
					? this.evaluateExpression(value, `[situation] ${name}`)
					: value,
			situation
		)
		return this
	}

	evaluate(expression: string, unit?: string): EvaluatedRule<Names> {
		const result = this.evaluateExpression(
			expression,
			`[evaluation] ${expression}`
		)
		if (unit) {
			try {
				return convertNodeToUnit(parseUnit(unit), result)
			} catch (e) {
				warning(
					`[evaluation] ${expression}`,
					"L'unité demandée est incompatible avec l'expression évaluée",
					e.message
				)
			}
		}
		return result
	}
	controls() {
		return evaluateControls(this.cache, this.situationGate, this.parsedRules)
	}

	inversionFail(): boolean {
		return !!this.cache._meta.inversionFail
	}

	// TODO : this should be private
	getCache(): Cache {
		return this.cache
	}
	situationGate = (dottedName: string) =>
		this.situation[dottedName] ?? this.defaultValues[dottedName]
}
