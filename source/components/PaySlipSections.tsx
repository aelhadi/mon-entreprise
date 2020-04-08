import Value from 'Components/Value'
import { useEvaluation } from 'Engine/Engine'
import React from 'react'
import { Trans } from 'react-i18next'
import RuleLink from './RuleLink'

export let SalaireBrutSection = () => {
	const salaireDeBase = useEvaluation(
		'contrat salarié . rémunération . brut de base'
	)

	const rémunérationBrute = useEvaluation(
		'contrat salarié . rémunération . brut'
	)

	return (
		<div className="payslip__salarySection">
			<h4 className="payslip__salaryTitle">
				<Trans>Salaire</Trans>
			</h4>
			<Line rule={salaireDeBase} />
			<Line
				rule={useEvaluation(
					'contrat salarié . rémunération . avantages en nature . montant'
				)}
			/>
			<Line
				rule={useEvaluation(
					'contrat salarié . activité partielle . retrait absence'
				)}
			/>
			<Line
				rule={useEvaluation(
					'contrat salarié . activité partielle . indemnités'
				)}
			/>
			<Line
				rule={useEvaluation(
					'contrat salarié . rémunération . heures supplémentaires'
				)}
			/>
			<Line
				rule={useEvaluation(
					'contrat salarié . rémunération . heures complémentaires'
				)}
			/>
			<Line rule={useEvaluation('contrat salarié . rémunération . primes')} />
			<Line rule={useEvaluation('contrat salarié . frais professionnels')} />
			<Line
				rule={useEvaluation('contrat salarié . CDD . indemnités salarié')}
			/>
			{rémunérationBrute?.nodeValue !== salaireDeBase?.nodeValue && (
				<Line rule={rémunérationBrute} />
			)}
		</div>
	)
}

export let Line = ({ rule, className = '', ...props }) => {
	if (!rule?.nodeValue) {
		return null
	}
	return (
		<>
			<RuleLink {...rule.explanation} className={className} />
			<Value
				{...rule}
				nilValueSymbol="—"
				unit="€"
				className={className}
				{...props}
			/>
		</>
	)
}

export let SalaireNetSection = () => {
	let avantagesEnNature = useEvaluation(
		'contrat salarié . rémunération . avantages en nature . montant'
	)
	let impôt = useEvaluation('impôt', '€/mois')
	let netImposable = useEvaluation(
		'contrat salarié . rémunération . net imposable'
	)
	const retenueTitresRestaurant = useEvaluation(
		'contrat salarié . frais professionnels . titres-restaurant . montant'
	)
	return (
		<div className="payslip__salarySection">
			<h4 className="payslip__salaryTitle">
				<Trans>Salaire net</Trans>
			</h4>
			<Line rule={netImposable} />
			{(avantagesEnNature?.nodeValue || retenueTitresRestaurant?.nodeValue) && (
				<Line
					rule={useEvaluation(
						'contrat salarié . rémunération . net de cotisations'
					)}
				/>
			)}
			<Line negative rule={avantagesEnNature} />
			<Line negative rule={retenueTitresRestaurant} />

			<Line
				rule={useEvaluation('contrat salarié . rémunération . net')}
				className="payslip__total"
			/>
			{!!impôt && (
				<>
					<Line negative rule={impôt} />
					<Line
						className="payslip__total"
						rule={useEvaluation(
							'contrat salarié . rémunération . net après impôt'
						)}
					/>
				</>
			)}
		</div>
	)
}
