import Value from 'Components/Value'
import { useEvaluation } from 'Engine/Engine'
import React, { Fragment } from 'react'
import { Trans } from 'react-i18next'
import { useSelector } from 'react-redux'
import { DottedName } from 'Rules'
import { parsedRulesSelector } from 'Selectors/analyseSelectors'
import './PaySlip.css'
import { Line, SalaireBrutSection, SalaireNetSection } from './PaySlipSections'
import RuleLink from './RuleLink'

export const SECTION_ORDER = [
	'protection sociale . santé',
	'protection sociale . accidents du travail et maladies professionnelles',
	'protection sociale . retraite',
	'protection sociale . famille',
	'protection sociale . assurance chômage',
	'protection sociale . formation',
	'protection sociale . transport',
	'protection sociale . autres'
] as const

type Section = typeof SECTION_ORDER[number]

function getSection(rule): Section {
	const section = ('protection sociale . ' +
		(rule.cotisation?.branche ?? rule.taxe?.branche)) as Section
	if (SECTION_ORDER.includes(section)) {
		return section
	}
	return 'protection sociale . autres'
}

export function getCotisationsBySection(
	parsedRules
): Array<[Section, DottedName[]]> {
	const cotisations = [
		...parsedRules['contrat salarié . cotisations . patronales'].formule
			.explanation.explanation,
		...parsedRules['contrat salarié . cotisations . salariales'].formule
			.explanation.explanation
	]
		.map(cotisation => cotisation.dottedName)
		.filter(Boolean)
		.reduce((acc, cotisation) => {
			const sectionName = getSection(parsedRules[cotisation])
			return {
				...acc,
				[sectionName]: (acc[sectionName] ?? new Set()).add(cotisation)
			}
		}, {}) as Record<Section, Set<DottedName>>

	return Object.entries(cotisations)
		.map(([section, dottedNames]) => [section, [...dottedNames.values()]])
		.sort(
			([a], [b]) =>
				SECTION_ORDER.indexOf(a as Section) -
				SECTION_ORDER.indexOf(b as Section)
		) as Array<[Section, DottedName[]]>
}

export default function PaySlip() {
	const parsedRules = useSelector(parsedRulesSelector)
	const cotisationsBySection = getCotisationsBySection(parsedRules)
	const heuresSupplémentaires = useEvaluation(
		'contrat salarié . temps de travail . heures supplémentaires'
	)

	return (
		<div
			className="payslip__container"
			css={`
				.value {
					display: flex;
					align-items: flex-end;
					justify-content: flex-end;
					padding-right: 0.2em;
				}
			`}
		>
			<div className="payslip__salarySection">
				<Line
					rule={useEvaluation('contrat salarié . temps de travail')}
					unit="heures/mois"
					maximumFractionDigits={1}
				/>
				{!!heuresSupplémentaires?.nodeValue && (
					<Line
						rule={heuresSupplémentaires}
						unit="heures/mois"
						maximumFractionDigits={1}
					/>
				)}
			</div>

			<SalaireBrutSection />
			{/* Section cotisations */}
			<div className="payslip__cotisationsSection">
				<h4>
					<Trans>Cotisations sociales</Trans>
				</h4>
				<h4>
					<Trans>Part employeur</Trans>
				</h4>
				<h4>
					<Trans>Part salarié</Trans>
				</h4>
				{cotisationsBySection.map(([sectionDottedName, cotisations]) => {
					let section = parsedRules[sectionDottedName]
					return (
						<Fragment key={section.dottedName}>
							<h5 className="payslip__cotisationTitle">
								<RuleLink {...section} />
							</h5>
							{cotisations.map(cotisation => (
								<Cotisation key={cotisation} dottedName={cotisation} />
							))}
						</Fragment>
					)
				})}

				{/* Total cotisation */}
				<div className="payslip__total">
					<Trans>Total des retenues</Trans>
				</div>
				<Value
					nilValueSymbol="—"
					{...useEvaluation('contrat salarié . cotisations . patronales')}
					unit="€"
					className="payslip__total"
				/>
				<Value
					nilValueSymbol="—"
					{...useEvaluation('contrat salarié . cotisations . salariales')}
					unit="€"
					className="payslip__total"
				/>
				{/* Salaire chargé */}
				<Line rule={useEvaluation('contrat salarié . rémunération . total')} />
				<span />
			</div>
			{/* Section salaire net */}
			<SalaireNetSection />
		</div>
	)
}

function Cotisation({ dottedName }: { dottedName: DottedName }) {
	const parsedRules = useSelector(parsedRulesSelector)
	const partSalariale = useEvaluation(
		'contrat salarié . cotisations . salariales'
	)?.explanation.formule.explanation.explanation.find(
		cotisation => cotisation.dottedName === dottedName
	)
	const partPatronale = useEvaluation(
		'contrat salarié . cotisations . patronales'
	)?.explanation.formule.explanation.explanation.find(
		cotisation => cotisation.dottedName === dottedName
	)
	if (!partPatronale?.nodeValue && !partSalariale?.nodeValue) {
		return null
	}
	return (
		<>
			<RuleLink
				{...parsedRules[dottedName]}
				style={{ backgroundColor: 'var(--lightestColor)' }}
			/>
			<Value
				nilValueSymbol="—"
				unit="€"
				customCSS="background-color: var(--lightestColor)"
			>
				{partPatronale?.nodeValue}
			</Value>
			<Value
				nilValueSymbol="—"
				unit="€"
				customCSS="background-color: var(--lightestColor)"
			>
				{partSalariale?.nodeValue}
			</Value>
		</>
	)
}
