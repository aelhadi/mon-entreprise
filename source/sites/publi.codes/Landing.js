import { Markdown } from 'Components/utils/markdown'
import { ScrollToTop } from 'Components/utils/Scroll'
import publicodeReadme from 'Engine/README.md'
import React, { useEffect } from 'react'
import { Header } from './Header'

export default function Landing() {
	useEffect(() => {
		var css = document.createElement('style')
		css.type = 'text/css'
		css.innerHTML = `
		#js {
			animation: appear 0.5s;
			opacity: 1;
		}
		#loading {
			display: none !important;
		}`
		document.body.appendChild(css)
	})
	return (
		<div className="app-content ui__ container" css="margin: 2rem 0">
			<ScrollToTop />
			<Header />
			<br />
			<br />
			<Markdown source={publicodeReadme} />
		</div>
	)
}
