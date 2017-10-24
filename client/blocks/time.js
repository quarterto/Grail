import React from 'react';
import OdreianDate from 'odreian-date'
import styled, {css} from 'styled-components';
import {H1, H2, H3} from '../components/heading';
import withState from '../components/state';
import SyncedSession from 'meteor/quarterto:synced-session';
import {createContainer} from 'meteor/react-meteor-data';

import Ornamented, {bordered} from '../components/ornamented';

const TimeOfDay = styled(H1)`
margin: 0;
font-size: 6em;
line-height: 1;
letter-spacing: -0.1em;
font-weight: normal;
`;

const Year = styled(H3)`
${bordered}
font-family: 'Libre Baskerville', serif;
font-variant: normal;
margin: 0;
`;

const DateGroup = styled.time`
text-align: center;
`;

const Compact = styled.div`
line-height: 0.8;
`;

const TimeButton = styled.button`
border: 2px solid #55C;
border-right: 0 none;
background: none;
font-size: 10px;
cursor: pointer;

&:first-child {
	border-top-left-radius: 3px;
	border-bottom-left-radius: 3px;
}

&:last-child {
	border: 2px solid #55C;
	border-top-right-radius: 3px;
	border-bottom-right-radius: 3px;
}

&:hover {
	background: rgba(85, 85, 204, 0.1);
}
`;

const Controls = styled.div`
line-height: 1;
`;

const ornaments = [
	'h', 'f', 'a', 't', 'n', 'c', 'o', 'p', 'e', 'r', 'k', 'l'
];

const OrnamentedMonth = ({date}) => <Ornamented ornament={ornaments[date.monthIndex]} large>
	<Compact>
		<div>{date.format`${'dddd'} ${'Do'}`}</div>
		<small>Month of {date.format`${'MM'}`}</small>
	</Compact>
</Ornamented>;

const Time = createContainer(() => ({
	date: new OdreianDate(SyncedSession.get('date') || 0)
}),
({date}) =>
	<DateGroup>
		<OrnamentedMonth date={date} />
		<TimeOfDay>{date.format`${'h'}:${'mm'}`}<small>{date.a}</small></TimeOfDay>
		<Year><span>{date.YYYY}</span></Year>
	</DateGroup>
);

const pluralize = (word, n) => Math.abs(n) > 1 ? `${word}s` : word;

const secondsInMinute = 60;
const minutesInHour = 60;
const hoursInDay = 24;
const daysInMonth = 30;
const daysInWeek = 6;
const monthsInYear = 12;

const secondsInHour = secondsInMinute * minutesInHour;
const secondsInDay = secondsInHour * hoursInDay;
const secondsInWeek = secondsInDay * daysInWeek;
const secondsInMonth = secondsInDay * daysInMonth;
const secondsInYear = secondsInMonth * monthsInYear;

const secondsIn = {
	minute: secondsInMinute,
	hour: secondsInHour,
	day: secondsInDay,
	week: secondsInWeek,
	month: secondsInMonth,
	year: secondsInYear,
};

const Inc = createContainer(({period, multiplier = 1}) => ({
	onIncrement() {
		const date = SyncedSession.get('date') || 0;
		SyncedSession.set('date', date + secondsIn[period] * multiplier);
	},
}), ({onIncrement, multiplier = 1, period}) => <TimeButton
	onClick={onIncrement}>
	{multiplier > 0 && '+'}{multiplier}{period[0]}
</TimeButton>);

const DateForm = withState(({date}) => ({date}), ({date, onSubmit}, state, setState) => <div>
	<input value={state.date || date} onChange={ev => setState({date: ev.target.value})} size={35} />
	<button onClick={() => onSubmit(OdreianDate.parse(state.date).timestamp)}>Set</button>
</div>);

const DateFormConnector = createContainer(() => ({
	date: new OdreianDate(SyncedSession.get('date') || 0).llll,
	setDate(date) {
		SyncedSession.set('date', date);
	}
}), ({date, setDate}) => <DateForm date={date} onSubmit={setDate} />);

const TimeControl = () => <div>
	<Time />

	<Controls>
		<div>
			<Inc period='minute' />
			<Inc period='minute' multiplier={5} />
			<Inc period='minute' multiplier={15} />
			<Inc period='minute' multiplier={30} />
		</div>

		<div>
			<Inc period='hour' />
			<Inc period='hour' multiplier={2} />
			<Inc period='hour' multiplier={4} />
			<Inc period='hour' multiplier={8} />
			<Inc period='hour' multiplier={12} />
		</div>

		<div>
			<Inc period='day' />
			<Inc period='day' multiplier={2} />
		</div>

		<div>
			<Inc period='week' />
			<Inc period='week' multiplier={2} />
		</div>

		<div>
			<Inc period='month' />
			<Inc period='month' multiplier={2} />
			<Inc period='month' multiplier={6} />
		</div>

		<div>
			<Inc period='year' />
			<Inc period='year' multiplier={2} />
		</div>

		<DateFormConnector />
	</Controls>
</div>;

export {
	Time as display,
	TimeControl as control
};
