import React from 'react'
import { useSubscription, useCursor } from '../utils/hooks'
import styled from 'styled-components'
import { Link } from 'use-history'

import { Campaigns } from '../../lib/collections'
import { useUser } from '../utils/logged-in'
import { SplashBackground, Hero, HeroTitle, HeroBlurb } from '../visual/splash'
import { MainGrid } from '../visual/grid'
import { useImage } from '../data/image'
import Splash from './splash'

const useCampaigns = () => {
	const ready = useSubscription('campaigns.all')
	const campaigns = useCursor(Campaigns.find({}), [ready])
	return { ready, campaigns }
}

const CampaignTileImage = styled(SplashBackground)`
	height: 25vmin;
	border-radius: 3px;
	text-decoration: none;
	transition: filter 0.2s;
	will-change: filter;

	&:hover {
		filter: contrast(120%) brightness(95%) saturate(110%);
	}
`

const CampaignTile = ({ campaign, ...props }) => {
	const { image } = useImage(campaign.theme)

	return <CampaignTileImage {...props} image={image} as={Link} />
}

export default () => {
	const user = useUser()
	const { campaigns } = useCampaigns()

	if (!user) {
		return <Splash />
	}

	return (
		<MainGrid>
			{campaigns.map(campaign => (
				<CampaignTile
					key={campaign._id}
					campaign={campaign}
					href={`/${campaign._id}`}
				>
					<Hero>
						<HeroTitle>{campaign.title}</HeroTitle>
						<HeroBlurb>{campaign.tagline}</HeroBlurb>
					</Hero>
				</CampaignTile>
			))}

			<Link href='/new-campaign'>Add a campaign</Link>
		</MainGrid>
	)
}
