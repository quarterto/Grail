import { Meteor } from 'meteor/meteor'
import {
	Cards,
	Campaigns,
	Session,
	Layouts,
	CardHistory,
} from '../lib/collections'
import access from '../lib/access'
import * as unsplash from '../lib/utils/unsplash'
import publish from './utils/publish'

const ownedCampaigns = ({ userId }) =>
	Campaigns.find({
		owner: userId,
	})

const memberCampaigns = ({ userId }) =>
	Campaigns.find({
		$or: [{ owner: userId }, { member: userId }],
	})

const visibleDocs = collection => ({ userId }) => {
	const campaignIds = memberCampaigns({ userId }).map(c => c._id)

	return collection.find({
		$or: [{ owner: userId }, { campaignId: { $in: campaignIds } }],
	})
}

const visibleCardQuery = ({ userId }) => {
	const ownedCampaignIds = ownedCampaigns({ userId }).map(c => c._id)
	const memberCampaignIds = memberCampaigns({ userId }).map(c => c._id)
	return {
		$or: [
			{ owner: userId },
			{ campaignId: { $in: ownedCampaignIds } },
			{
				campaignId: { $in: memberCampaignIds },
				'access.view': access.CAMPAIGN,
			},
			{ 'access.view': access.PUBLIC },
		],
	}
}

publish({
	users: {
		all: () => Meteor.users.find({}, { fields: { username: 1 } }),
	},

	campaigns: {
		all: memberCampaigns,

		join({ args: [{ campaignId, secret }] }) {
			return Campaigns.find({
				_id: campaignId,
				inviteSecret: secret,
			})
		},

		members({ userId }) {
			const campaigns = memberCampaigns({ userId }).fetch()

			const allCampaignUsers = campaigns.reduce(
				(users, campaign) =>
					users
						.concat(campaign.owner)
						.concat(campaign.member)
						.concat(campaign.removedMember || []),
				[],
			)

			return Meteor.users.find({
				_id: { $in: allCampaignUsers },
			})
		},
	},

	cards: {
		/*
		I can see a card if:

		- i'm the owner or the GM
		- it's visible to the campaign, it's in a campaign i'm a member of
		- it's public
		*/
		all({ userId, args: [query] }) {
			return Cards.find(
				{
					$and: [
						query && { $text: { $search: query } },
						visibleCardQuery({ userId }),
					].filter(part => part),
				},
				query
					? {
							fields: {
								score: { $meta: 'textScore' },
							},
							sort: {
								score: { $meta: 'textScore' },
							},
					  }
					: {},
			)
		},

		history({ userId }) {
			const visibleCards = Cards.find(visibleCardQuery({ userId })).fetch()
			const visibleCardIDs = visibleCards.map(card => card._id)
			return CardHistory.find({
				'data._id': { $in: visibleCardIDs },
			})
		},
	},

	session: {
		all: visibleDocs(Session),
	},

	layout: {
		all: visibleDocs(Layouts),
	},

	unsplash: {
		search({ args: [query], added, ready }) {
			const photos = unsplash.search(query)

			photos.forEach(photo => {
				photo.fromSearch = query
				added('unsplash-photos', photo.id, photo)
			})

			ready()
		},

		getCollectionPhotos({ args: [collectionId], added, ready }) {
			const photos = unsplash.getCollectionPhotos(collectionId)

			photos.forEach(photo => {
				photo.fromCollection = collectionId
				added('unsplash-photos', photo.id, photo)
			})

			ready()
		},

		getPhoto({ args: [photoId], added, ready }) {
			const photo = unsplash.getPhoto(photoId)
			added('unsplash-photos', photo.id, photo)
			ready()
		},
	},
})
