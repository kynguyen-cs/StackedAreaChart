import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Button } from 'semantic-ui-react';
import './select.css';

const ControlledSelect = ({
  open = false,
  placeholder = '',
  value = '',
  activeGroup = 0,
  groups,
  onFocus,
  onBlur,
  onTabClick,
  onItemClick,
  style
}) => {
  let text

  if (!value) {
    text = placeholder
  } else {
    const [group, option] = value.split('.');
    text = groups.find(g => g.value === group)
          .options.find(o => o.value === option)
          .text;
  }

  return (
    <Dropdown
      open={open}
      text={text}
      onClick={onFocus}
      onBlur={onBlur}
      style={style}
      className="selection"
    >
      <Dropdown.Menu className="noscrolling">
        <Button.Group fluid compact basic widths={groups.length}>
          {groups.map((g, i) => {
            const active = activeGroup === i;
            return (
              <Button
                key={g.value}
                data-index={i}
                active={active}
                children={g.text}
                onClick={onTabClick}
              />
            );
          })}
        </Button.Group>
        <Dropdown.Divider />
        <Dropdown.Menu scrolling>
          {groups[activeGroup].options.map(option => {
            const value = `${groups[activeGroup].value}.${option.value}`;
            return (
              <Dropdown.Item
                {...option}
                key={value}
                value={value}
                onClick={onItemClick}
              />
            );
          })}
        </Dropdown.Menu>
      </Dropdown.Menu>
    </Dropdown>
  );
};

const control = WrappedComponent =>
  class extends Component {
    static propTypes = {
      value: PropTypes.string.isRequired,
      groups: PropTypes.array.isRequired,
      onChange: PropTypes.func.isRequired,
      style: PropTypes.object
    };

    constructor(props) {
      super(props);
      this.state = {
        open: false,
        activeGroup: 0
      };
    }

    handleFocus = () => this.setState({ open: true });

    handleBlur = () => this.setState({ open: false });

    handleTabClick = (e, data) => this.setState({ activeGroup: data['data-index'] });

    handleItemClick = (e, data) => {
      e.stopPropagation();
      this.props.onChange(data.value);
      this.setState({ open: false });
    };

    render() {
      const { open, activeGroup } = this.state;
      const { value, groups, style } = this.props;
      return (
        <WrappedComponent
          open={open}
          value={value}
          activeGroup={activeGroup}
          groups={groups}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          onTabClick={this.handleTabClick}
          onItemClick={this.handleItemClick}
          style={style}
        />
      );
    }
  };

const Select = control(ControlledSelect);

export { ControlledSelect, Select };
