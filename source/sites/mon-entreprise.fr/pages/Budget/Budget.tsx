import { icons } from 'Components/ui/SocialIcon'
import { Markdown } from 'Components/utils/markdown'
import { ScrollToTop } from 'Components/utils/Scroll'
import { SitePathsContext } from 'Components/utils/withSitePaths'
import { formatCurrency } from 'Engine/format'
import { sum, uniq } from 'ramda'
import React, { useContext, useState } from 'react'
import emoji from 'react-easy-emoji'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import prose from './budget.md'
import budget from './budget.yaml'

const [
	intro,
	ressources2019,
	ressources2020,
	ressourcesDescription
] = prose.split('---')

const ressources = {
	2019: ressources2019,
	2020: ressources2020
}

export default function Budget() {
	const [selectedYear, setSelectedYear] = useState('2020')
	const years = ['2019', '2020']
	const quarters = ['T1', 'T2', 'T3', 'T4']
	const categories = uniq(
		quarters
			.map(q => Object.keys(budget[2020][q] ?? {}))
			.reduce((acc, curr) => [...acc, ...curr], [])
	)

	const { language } = useTranslation().i18n
	return (
		<>
			<ScrollToTop />
			<h1>Budget {emoji('💶')}</h1>
			<Markdown source={intro} />
			<h2>Ressources</h2>
			<label>
				Année{' '}
				<select
					value={selectedYear}
					onChange={event => setSelectedYear(event.target.value)}
				>
					{years.map(year => (
						<option key={year}>{year}</option>
					))}
				</select>
			</label>
			<br />
			<br />
			<Markdown source={ressources[selectedYear]} />
			<ul></ul>
			<h2>Emploi des ressources</h2>
			<RessourcesAllocationTable>
				<thead>
					<tr>
						<td>2020</td>
						{quarters.map(q => (
							<td key={q}>{q}</td>
						))}
					</tr>
				</thead>
				<tbody>
					{categories.map(label => (
						<tr key={label}>
							<td>{label}</td>
							{quarters.map(q => {
								const value = budget[2020]?.[q]?.[label]
								return (
									<td key={q}>
										{value ? formatCurrency(value, language) : '-'}
									</td>
								)
							})}
						</tr>
					))}
				</tbody>
				<tfoot>
					<tr>
						<td>Total</td>
						<td>
							{formatCurrency(sum(Object.values(budget[2020]['T1'])), language)}
						</td>
						<td>-</td>
						<td>-</td>
						<td>-</td>
					</tr>
				</tfoot>
			</RessourcesAllocationTable>
			<Markdown source={ressourcesDescription} />
			<MoreInfosSection />
		</>
	)
}

function MoreInfosSection() {
	const sitePaths = useContext(SitePathsContext)
	return (
		<section className="ui__ full-width light-bg center-flex">
			<h3 style={{ textAlign: 'center', width: '100%' }}>
				Plus d'infos sur mon-entreprise.fr
			</h3>
			<Link className="ui__ interactive card box" to={sitePaths.nouveautés}>
				<div className="ui__ big box-icon">{emoji('✨')}</div>
				<h3>Les nouveautés</h3>
				<p className="ui__ notice" css="flex: 1">
					Qu'avons-nous mis en production ces derniers mois ?
				</p>
				<div className="ui__ small simple button">Découvrir</div>
			</Link>
			<Link className="ui__ interactive card box " to={sitePaths.gérer.index}>
				<div className="ui__ big box-icon">{emoji('📊')}</div>
				<h3>Les statistiques</h3>
				<p className="ui__ notice" css="flex: 1">
					Quel est notre impact ?
				</p>
				<div className="ui__ small simple button">Découvrir</div>
			</Link>
			<Link
				className="ui__ interactive card box"
				to={sitePaths.économieCollaborative.index}
			>
				<div className="ui__ big box-icon">
					{' '}
					<svg
						viewBox="15 15 34 34"
						style={{
							width: '3rem',
							height: '3rem',
							margin: 0
						}}
					>
						<g>
							<path d={icons['github'].icon} />
						</g>
					</svg>
				</div>
				<h3>Le code source</h3>
				<p className="ui__ notice" css="flex: 1">
					Nos travaux sont ouverts et libres de droit, ça se passe sur GitHub
				</p>
				<div className="ui__ small simple button">Découvrir</div>
			</Link>
		</section>
	)
}

const RessourcesAllocationTable = styled.table`
	width: 100%;
	text-align: left;
	td {
		padding: 6px;
	}

	td:not(:first-child) {
		width: 100px;
	}

	tbody tr:nth-child(2n + 1),
	tfoot tr {
		background: var(--lighterColor);
	}

	thead,
	tfoot {
		font-weight: bold;
	}
`
