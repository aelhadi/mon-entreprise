/* @flow */
import { directorIsInAMinority } from 'Actions/companyStatusActions'
import { React, T } from 'Components'
import { compose } from 'ramda'
import Helmet from 'react-helmet'
import { translate } from 'react-i18next'
import { connect } from 'react-redux'
import { SkipButton } from 'Ui/Button'
import type { TFunction } from 'react-i18next'

type Props = {
	directorIsInAMinority: (?boolean) => void,
	t: TFunction
}

const MinorityDirector = ({ directorIsInAMinority, t }: Props) => (
	<>
		<Helmet>
			<title>
				{t(
					'gérant minoritaire.page.titre',
					'Gérant majoritaire ou minoritaire'
				)}{' '}
			</title>
			<meta
				name="description"
				content={t(
					'gérant minoritaire.page.description',
					`Certaines règles particulières s'appliquent en fonction du nombre d'actions détenues par l'administrateur, ce qui peut conduire à un statut différent lors de la création de votre société`
				)}
			/>
		</Helmet>
		<h2>
			<T k="gérant minoritaire.titre">Gérant majoritaire ou minoritaire</T>{' '}
		</h2>
		<T k="gérant minoritaire.description">
			<p>
				Certaines règles spéciales s'appliquent selon le nombre d'actions
				détenues par le gérant.
			</p>
			<ul>
				<li>
					<strong>Gérant majoritaire</strong> : L'administrateur est majoritaire
					ou fait partie d'un conseil d'administration majoritaire.
				</li>
				<li>
					<strong>Gérant minoritaire</strong> : L'administrateur est minoritaire
					(ou égalitaire), ou fait partie d'un conseil d'administration
					minoritaire (ou égalitaire).
				</li>
			</ul>
		</T>

		<div className="ui__ answer-group">
			<button
				onClick={() => {
					directorIsInAMinority(false)
				}}
				className="ui__ button">
				<T>Gérant majoritaire</T>
			</button>
			<button
				onClick={() => {
					directorIsInAMinority(true)
				}}
				className="ui__ button">
				<T>Gérant minoritaire</T>
			</button>
			<SkipButton onClick={() => directorIsInAMinority(null)} />
		</div>
	</>
)

export default compose(
	translate(),
	connect(
		null,
		{ directorIsInAMinority }
	)
)(MinorityDirector)
