import { EvaluatedRule } from 'Types/rule'
import {
	areUnitConvertible,
	convertUnit,
	simplifyUnitWithValue,
	Unit,
	unitCompatibleWithDenominator
} from './units'

type Node = Pick<EvaluatedRule, 'unit' | 'nodeValue'>

export function simplifyNodeUnit(node: Node) {
	if (!node.unit || !node.nodeValue) {
		return node
	}
	const [unit, nodeValue] = simplifyUnitWithValue(node.unit, node.nodeValue)
	return {
		...node,
		unit,
		nodeValue
	}
}
export const getNodeDefaultUnit = (node: EvaluatedRule, cache) => {
	if (
		node.question &&
		node.unit == null &&
		node.defaultUnit == null &&
		node.formule?.unit == null
	) {
		return false
	}

	return (
		node.unit ||
		cache._meta.defaultUnits.find(unit =>
			areUnitConvertible(node.defaultUnit, unit)
		) ||
		node.defaultUnit
	)
}

export function convertNodeToUnit(to: Unit, node: Node) {
	return {
		...node,
		nodeValue:
			node.unit && node.nodeValue
				? convertUnit(node.unit, to, node.nodeValue)
				: node.nodeValue,
		unit: to
	}
}

type Multiplier = {
	duration: number
	unit: string
}

// This function is useful to display values in a given timeframe (eg 1 month)
export function nodeView(multiplier: Multiplier, node: Node) {
	if (!node?.unit || (node.unit as any) === '%') {
		return node
	}
	const comptabileUnit = unitCompatibleWithDenominator(
		node.unit,
		multiplier.unit
	)
	if (comptabileUnit === null) {
		return node
	} else {
		const convertedNode = convertNodeToUnit(comptabileUnit, node)
		const unit = {
			numerators: convertedNode.unit.numerators,
			denominators: convertedNode.unit.denominators.filter(
				x => x !== multiplier.unit
			)
		}
		const nodeValue = convertedNode.nodeValue
			? multiplier.duration * convertedNode.nodeValue
			: node.nodeValue

		return { ...convertedNode, unit, nodeValue }
	}
}
