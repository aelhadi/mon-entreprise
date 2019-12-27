import { T } from 'Components'
import { formatValue, formatValueOptions } from 'Engine/format'
import { nodeView } from 'Engine/nodeUnits'
import { Unit } from 'Engine/units'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { EvaluatedRule } from 'Types/rule'

// let booleanTranslations = { true: '✅', false: '❌' }

let booleanTranslations = {
	fr: { true: 'Oui', false: 'Non' },
	en: { true: 'Yes', false: 'No' }
}

let style = customStyle => `
		font-family: 'Courier New', Courier, monospace;

		${customStyle}
`

export type ValueProps = Partial<
	Pick<
		formatValueOptions,
		'maximumFractionDigits' | 'minimumFractionDigits'
	> & {
		nodeValue: EvaluatedRule['nodeValue']
		unit: Unit | string
		nilValueSymbol: string
		children: number
		negative: boolean
		customCSS: string
	}
>

export default function Value({
	nodeValue: value,
	unit: providedUnit,
	nilValueSymbol,
	maximumFractionDigits,
	minimumFractionDigits,
	children,
	negative,
	customCSS = ''
}: ValueProps) {
	const { language } = useTranslation().i18n

	/* Either an entire rule object is passed, or just the right attributes and the value as a JSX  child*/
	let providedValue = value === undefined ? children : value
	let { nodeValue, unit } = nodeView(
		{ duration: 1, unit: 'mois' },
		{ nodeValue: providedValue, unit: providedUnit as any }
	)

	if (
		(nilValueSymbol !== undefined && nodeValue === 0) ||
		(nodeValue && Number.isNaN(nodeValue)) ||
		nodeValue === null
	)
		return (
			<span css={style(customCSS)} className="value">
				-
			</span>
		)
	let valueType = typeof nodeValue,
		formattedValue =
			valueType === 'string' ? (
				<T>{nodeValue}</T>
			) : valueType === 'object' ? (
				(nodeValue as any).nom
			) : valueType === 'boolean' ? (
				booleanTranslations[language][nodeValue]
			) : nodeValue !== undefined ? (
				formatValue({
					minimumFractionDigits,
					maximumFractionDigits,
					language,
					unit,
					value: nodeValue
				})
			) : null
	return nodeValue == undefined ? null : (
		<span css={style(customCSS)} className="value">
			{negative ? '-' : ''}
			{formattedValue}
		</span>
	)
}
