import PropTypes from 'prop-types';
import React, {Component} from 'react';

export const withCampaign = Child => {
	const Wrapped = (props, {campaignId}) => <Child {...props} campaignId={campaignId} />;
	Wrapped.contextTypes = {
		campaignId: PropTypes.string,
	};
	return Wrapped;
};

export const setsCampaign = Child => class Wrapped extends Component {
	static childContextTypes = {
		campaignId: PropTypes.string,
	};

	getChildContext() {
		return {
			campaignId: this.props.campaignId,
		};
	}

	render() {
		const {campaignId, ...props} = this.props;
		return <Child {...props} />;
	}
};
