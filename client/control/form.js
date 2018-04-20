import React, {Component} from 'react';
import PropTypes from 'prop-types';

// TODO: split into module

export const getInputValue = el =>
	el[
		{
			number: 'valueAsNumber',
			range: 'valueAsNumber',
			date: 'valueAsDate',
			checkbox: 'checked',
		}[el.type] || 'value'
	];

export const getSelectValue = el => el.options[el.selectedIndex].value;

export const Field = (
	{name, fieldRef, tag: Tag = 'input', ...props},
	context
) =>
	<Tag
		ref={fieldRef}
		name={name}
		type="text"
		{...props}
		value={name in context.fields ? context.fields[name] : ''}
		onChange={ev => {
			if (props.onChange) {
				props.onChange(ev);
			}

			context.setFields({
				[name]: getInputValue(ev.target),
			});
		}}
	/>;

export const Select = ({tag: Tag = 'select', ...props}, context) => {
	return <Tag
		{...props}
		value={context.fields[props.name] || ''}
		onChange={ev => {
			context.setFields({
				[props.name]: getSelectValue(ev.target),
			});
		}}
	>
		{props.children}
	</Tag>;
}

export class Form extends Component {
	state = {
		fields: this.props.initialData
	};

	setFields = (f) => {
		this.setState({
			fields: Object.assign(this.fields, f),
		}, () => {
			if (this.context.setFields && this.props.name) {
				this.context.setFields({
					[this.props.name]: this.fields,
				});
			}

			if (this.props.onChange) {
				this.props.onChange(this.fields);
			}
		});
	}

	get fields() {
		return this.state.fields;
	}

	static get childContextTypes() {
		return {
			fields: PropTypes.object,
			setFields: PropTypes.func,
		};
	}

	static get defaultProps() {
		return {
			initialData: {},
			onSubmit() {},
			tagName: 'form',
		};
	}

	componentDidMount() {
		this.mounted = true;
	}

	componentWillUnount() {
		this.mounted = false;
	}

	getChildContext() {
		return {
			fields: this.fields,
			setFields: this.setFields,
		};
	}

	onSubmit = ev => {
		//TODO validation
		ev.preventDefault();
		Promise.resolve(this.props.onSubmit(this.fields))
			.then(() => {
				if(this.mounted) {
					this.setState({
						fields: this.props.initialData
					});
				}
			})
			.then(() => {
				if(this.props.onDidSubmit) {
					this.props.onDidSubmit(this.fields);
				}
			});
	};

	render() {
		return (
			<this.props.tagName onSubmit={this.onSubmit}>
				{this.props.children}
			</this.props.tagName>
		);
	}
}

export const fieldLike = {
	fields: PropTypes.object,
	setFields: PropTypes.func,
};

Field.contextTypes = Select.contextTypes = Form.contextTypes = fieldLike;