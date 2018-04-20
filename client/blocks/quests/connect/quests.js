import {Cards} from '../../../../shared/collections';
import {withHandlers} from 'recompose';
import formJson from '@quarterto/form-json';
import generateSlug from '../../../utils/generate-slug';

const questsActions = withHandlers({
	onCreateQuest: ({campaignId, campaignSession}) => ev => {
		ev.preventDefault();
		const data = formJson(ev.target);
		ev.target.reset();

		Cards.insert({
			...generateSlug(data),
			type: 'quest',
			campaignId,
		});

		campaignSession.set('splashQuest', {
			action: 'startQuest',
			quest: data,
		});
	},
});

export default questsActions;