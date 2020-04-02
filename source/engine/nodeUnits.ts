import { EvaluatedNode, mapTemporal } from './temporal'
import { convertUnit, simplifyUnit, Unit } from './units'

export function simplifyNodeUnit(node) {
	if (!node.unit) {
		return node
	}
	const unit = simplifyUnit(node.unit)

	return convertNodeToUnit(unit, node)
}

export function convertNodeToUnit(to: Unit, node: EvaluatedNode<number>) {
	return {
		...node,
		nodeValue: node.unit
			? convertUnit(node.unit, to, node.nodeValue)
			: node.nodeValue,
		temporalValue:
			node.temporalValue && node.unit
				? mapTemporal(
						value => convertUnit(node.unit, to, value),
						node.temporalValue
				  )
				: node.temporalValue,
		unit: to
	}
}
