import React, {Fragment} from 'react';
import {withCampaignData} from '../data/campaign';
import unsplashImages from '../visual/unsplash.json';
import {compose, withProps} from 'recompact';
import styled from 'styled-components';
import stringHash from 'string-hash';
import {SplashBackground, Hero, HeroTitle, HeroBlurb} from '../visual/splash';
import {withTracker} from 'meteor/react-meteor-data';
import {Meteor} from 'meteor/meteor';

const withOwnerData = key => withTracker(props => ({
	ownerUser: Meteor.users.findOne(props[key].owner),
}));

const Splash = withProps(({campaign}) => {
	const image = campaign.theme
		? unsplashImages.find(({id}) => id === campaign.theme)
		: unsplashImages[stringHash(campaign._id) % (unsplashImages.length - 1)]; // never choose the last one, so i can select it for testing purposes

	return {
		url: image.urls.regular,
		color: image.color,
	};
})(SplashBackground);

const connectCampaign = compose(
	withCampaignData,
	withOwnerData('campaign')
);

export default connectCampaign(({campaign, ownerUser}) => <Fragment>
	<Splash campaign={campaign}>
		<Hero>
			<HeroTitle>{campaign.title}</HeroTitle>
			<HeroBlurb>{campaign.tagline || `A campaign by ${ownerUser.username}`}</HeroBlurb>
		</Hero>
	</Splash>
</Fragment>);