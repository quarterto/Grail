import React from 'react';
import {observe} from '../store';
import withState from './state';
import styled from 'styled-components';
import OdreianDate from 'odreian-date';
import Ornamented from './ornamented';

const moonPhase = date => [
	'🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔',
][Math.floor(date * 8/30)];

const compassDir = heading => [
	'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
][Math.round(heading * 16/360) % 16];

const weatherCondition = ({temperature, humidity}) => [
['winter',     'sun-cloud',      'day',            'sun',       'dry',        'fire'],
['sun-snow',   'cloud-wind',     'sun-cloud',      'sun-fog',   'sun-fog',    'tornado'],
['cloud-snow', 'sun-cloud-rain', 'sun-cloud-rain', 'sun-cloud', 'heavy-rain', 'lightning'],
['snow-storm', 'cloud-rain',     'wet',            'lightning', 'lightning',  'heavy-lightning'],
]
[Math.min(3, Math.floor(humidity * 4 / 100))]
[Math.min(5, Math.floor((20 + temperature) * 6 / 80))];

const WindArrow = styled.span`
display: inline-block;
will-change: transform;
transform: rotate(${({heading}) => heading}deg);
transition: transform 2s cubic-bezier(.52,1.65,.29,.9);
`;

const WindDirection = ({heading}) => <span>
	<WindArrow heading={heading - 90}>➳</WindArrow>
	<small>{compassDir((heading + 180) % 360)}</small>
</span>;

const WeatherIcon = styled.div`
display: inline;
vertical-align: -0.85em;
font-size: 3em;
text-align: center;

img {
	width: 1em;
	height: 1em;
	vertical-align: -0.08em;
}
`;

const WeatherThings = styled.div`
display: flex;
justify-content: space-between;
margin-top: 1em;
margin-bottom: -2em;
position: relative;
z-index: 2;
`;

const WeatherThing = styled.div`
line-height: 0;
font-size: 1.25em;
`;

const Under = styled(Ornamented)`
position: relative;
z-index: 1;
`;

const WeatherWrapper = styled.div`
margin-top: 1em;
`;

const WeatherCondition = ({temperature, humidity}) => {
	const condition = weatherCondition({temperature, humidity});
	return <img src={`/weather/${condition}.png`} alt={condition} />;
}

const Weather = observe((props, {subscribe}) => {
	const {temperature, humidity, windHeading, windSpeed} = subscribe('weather');
	const date = new OdreianDate(subscribe('date'));
	const isNight = date.hour < 7 || date.hour >= 20; // TODO: seasons, sunset time

	return <WeatherWrapper>
		<WeatherThings>
			<WeatherThing large>{temperature}℃</WeatherThing>
			<WeatherThing><WindDirection heading={windHeading} /></WeatherThing>
		</WeatherThings>
		<Under ornament='k'>
			<WeatherIcon small={isNight}>
				{isNight
					? moonPhase(date.dateIndex)
					: <WeatherCondition {...{temperature, humidity}} />
				}
			</WeatherIcon>
		</Under>
	</WeatherWrapper>;
});

const FixedWidthLabel = styled.label`
display: inline-block;
width: ${({size = 3.5}) => size}em;
`;

const WeatherForm = withState(
	({weather}) => weather,
	({weather, onSubmit}, state, setState) => <div>
		<div>
			<FixedWidthLabel>{state.temperature}℃</FixedWidthLabel>
			<input
				type='range' min={-20} max={60}
				placeholder='temperature'
				value={state.temperature}
				onChange={ev => setState({temperature: ev.target.valueAsNumber})} />
		</div>
		<div>
			<FixedWidthLabel>{state.humidity}%</FixedWidthLabel>
			<input
				type='range' min={0} max={100} step={5}
				placeholder='humidity'
				value={state.humidity}
				onChange={ev => setState({humidity: ev.target.valueAsNumber})} />
		</div>
		<div>
			<FixedWidthLabel><WindDirection heading={state.windHeading} /></FixedWidthLabel>
			<input
				type='range' min={0} max={359} step={5}
				placeholder='windHeading'
				value={state.windHeading}
				onChange={ev => setState({windHeading: ev.target.valueAsNumber})} />
		</div>
		<div>
			<FixedWidthLabel>{state.windSpeed}<small>KN</small></FixedWidthLabel>
			<input
				type='range' min={0} max={120} step={5}
				placeholder='windSpeed'
				value={state.windSpeed}
				onChange={ev => setState({windSpeed: ev.target.valueAsNumber})} />
		</div>
		<button onClick={() => onSubmit(state)}>Set</button>
	</div>
);

const WeatherFormConnector = observe((props, {subscribe, dispatch}) => <WeatherForm
	weather={subscribe('weather')}
	onSubmit={weather => dispatch('weather', () => weather)}
/>);

const WeatherControl = () => <div>
	<Weather />
	<WeatherFormConnector />
</div>

export {
	WeatherControl as control,
	Weather as display
};
