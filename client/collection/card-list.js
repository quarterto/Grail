import {Meteor} from 'meteor/meteor';
import React from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import _ from 'lodash';
import {withCampaignSession} from '../data/campaign';
import {compose, withHandlers} from 'recompact';
import {render} from 'react-dom';
import styled from 'styled-components';

import {Cards} from '../../shared/collections';
import {Card} from '../../shared/methods';
import subscribe from '../utils/subscribe';
import idFirst from '../utils/id-first';
import {buildGraph, distances} from '../utils/graph';

import ShowCard, {EditCard} from '../document/card';
import {Card as CardPrimitive, List, Label, LabelBody} from '../visual/primitives';
import {FlexGrid} from '../visual/grid';

const withCardListActions = withTracker(props => {
	const {campaignSession, campaignId} = props;
	const selectedCard = campaignSession.get('selectedCard');
	// TODO: use withCard
	const cards = Cards.find({campaignId}).fetch();

	if (selectedCard) {
		const graph = buildGraph(cards);
		const d = distances(graph, selectedCard);

		cards.forEach(card => (card.sortedIndex = d[card._id]));
	}

	console.log(selectedCard);

	return {
		ready: subscribe('cards.all'),
		cards: _.orderBy(cards, ['sortedIndex', 'title']),
		addCard(card) {
			Card.create({...card, campaignId});
		}
	};
});

const connectCardList = compose(
	withCampaignSession,
	withCardListActions
);

const CardList = connectCardList(({cards, addCard}) => <FlexGrid>
	{cards.map(card => <ShowCard key={card._id} card={card} />)}

	<CardPrimitive>
		<EditCard card={{}} saveCard={addCard} />
	</CardPrimitive>
</FlexGrid>);

export default CardList;
