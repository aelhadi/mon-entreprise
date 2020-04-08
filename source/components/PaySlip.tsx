import { ThemeColorsContext } from 'Components/utils/colors'
import Value from 'Components/Value'
import { useEvaluation } from 'Engine/Engine'
import React, { Fragment, useContext } from 'react'
import { Trans } from 'react-i18next'
import { useSelector } from 'react-redux'
import { parsedRulesSelector } from 'Selectors/analyseSelectors'
import { analysisToCotisationsSelector } from 'Selectors/ficheDePaieSelectors'
import './PaySlip.css'
import { Line, SalaireBrutSection, SalaireNetSection } from './PaySlipSections'
import RuleLink from './RuleLink'

export default function PaySlip() {
	const { lightestColor } = useContext(ThemeColorsContext)
	const cotisations = useSelector(analysisToCotisationsSelector)
	const parsedRules = useSelector(parsedRulesSelector)

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
				{cotisations.map(([brancheDottedName, cotisationList]) => {
					let branche = parsedRules[brancheDottedName]
					return (
						<Fragment key={branche.dottedName}>
							<h5 className="payslip__cotisationTitle">
								<RuleLink {...branche} />
							</h5>
							{cotisationList.map(cotisation => (
								<Fragment key={cotisation.dottedName}>
									<RuleLink
										style={{ backgroundColor: lightestColor }}
										{...cotisation}
									/>
									<Value
										nilValueSymbol="—"
										unit="€"
										customCSS="background-color: var(--lightestColor)"
									>
										{cotisation.montant.partPatronale}
									</Value>
									<Value
										nilValueSymbol="—"
										unit="€"
										customCSS="background-color: var(--lightestColor)"
									>
										{cotisation.montant.partSalariale}
									</Value>
								</Fragment>
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
					{...getRule('contrat salarié . cotisations . patronales')}
					unit="€"
					className="payslip__total"
				/>
				<Value
					nilValueSymbol="—"
					{...getRule('contrat salarié . cotisations . salariales')}
					unit="€"
					className="payslip__total"
				/>
				{/* Salaire chargé */}
				<Line rule={getRule('contrat salarié . rémunération . total')} />
				<span />
			</div>
			{/* Section salaire net */}
			<SalaireNetSection getRule={getRule} />
		</div>
	)
}
