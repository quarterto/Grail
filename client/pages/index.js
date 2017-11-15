import React from 'react';
import {injectGlobal} from 'styled-components'
import {background} from '../colors';
import {route} from '../router';
import {mount} from 'react-mounter';
import {steel, sky} from '@quarterto/colours';
import {rgba} from 'polished';
import {setsCampaign} from '../components/campaign';

const App = setsCampaign(({content}) => <main>
	{content}
</main>);

import Dashboard from './dashboard';
import Control from './control';
import Grail from './grail';
import Home from './home';

//TODO: card search
//TODO: integrate Menagerie (monsters & spells, with JSON import/export)
//TODO: sidebar
//TODO: time and location as a first class concept
//TODO: reinstate metadata
//TODO: search by metadata

injectGlobal`
	@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,400i,700,700i|Libre+Baskerville');

	@font-face {
		font-family: 'PC Ornaments';
		src: url('/fonts/pc-ornaments.woff2') format('woff2');
	}

	body {
		font-family: 'Source Sans Pro', sans-serif;
		margin: 0;
		background: ${background};
		color: ${steel[0]};
	}

	* {
		box-sizing: border-box;
	}

	a, a:visited {
		color: ${sky[3]};
		text-decoration-skip: ink;
	}

	a:hover {
		color: ${sky[4]};
	}

	a:active {
		color: ${sky[2]};
	}
`;

route('/:campaignId/dashboard', {
	name: 'Dashboard',
	action({campaignId}) {
		mount(App, {
			campaignId,
			content: <Dashboard />
		});
	}
});

route('/:campaignId/dashboard-control', {
	name: 'Control',
	action({campaignId}) {
		mount(App, {
			campaignId,
			content: <Control />
		});
	}
});

route('/:campaignId', {
	name: 'Grail',
	action({campaignId}) {
		mount(App, {
			campaignId,
			content: <Grail />
		});
	}
});

route('/', {
	name: 'Home',
	action() {
		mount(App, {
			content: <Home />
		});
	}
});
