/** @module InlineIcon
 *  @class InlineIcon
 *  @since 2020.10.07, 02:08
 *  @changed 2021.01.25, 03:35
 */

import React from 'react';
import PropTypes from 'prop-types';
// import connect from 'react-redux/es/connect/connect'
import { cn } from 'utils/configure';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import * as regularIcons from '@fortawesome/free-regular-svg-icons';
import * as brandsIcons from '@fortawesome/free-brands-svg-icons';

const iconGroups = {
  solid: solidIcons,
  regular: regularIcons,
  brands: brandsIcons,
};

import './InlineIcon.pcss';

const cnInlineIcon = cn('InlineIcon');

class InlineIcon extends React.PureComponent /** @lends @InlineIcon.prototype */ {

  static propTypes = {
    id: PropTypes.string,
    tag: PropTypes.string,
    title: PropTypes.string,
    icon: PropTypes.oneOfType([ PropTypes.string, PropTypes.object ]),
    onClick: PropTypes.func,
    theme: PropTypes.string,
    plain: PropTypes.bool, // Is it used???
    onDark: PropTypes.bool, // Is it used???
    largeIcon: PropTypes.bool, // Large icon. Is it used???
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  }

  getClassName() {
    const {
      id,
      theme,
      plain, // ???
      largeIcon, // ???
      onDark, // ???
    } = this.props;
    const className = cnInlineIcon({
      id,
      theme,
      plain, // ???
      largeIcon, // ???
      onDark, // ???
    }, [this.props.className]);
    return className;
  }

  getIconComponent(id) {
    let iconId = id;
    let icons = solidIcons;
    const matchGroup = iconId.match(/^(\w+):(.*)/);
    if (matchGroup) {
      const [, groupId, nextId] = matchGroup;
      if (groupId && iconGroups[groupId] && nextId) {
        icons = iconGroups[groupId];
        iconId = nextId;
      }
    }
    const component = icons && icons[iconId] || icons['faQuestionCircle'];
    return component;
  }

  render() {

    const {
      id,
      tag,
      title,
      icon,
      onClick,
      // key,
      style,
    } = this.props;

    const iconType = typeof icon;
    // if (iconType !== 'string') {
    //   debugger
    // }

    // Create fortawesome icon element if passed icon image (svg icon)
    const iconComponent = (icon && iconType === 'string') ? this.getIconComponent(icon) : icon;
    const content = (iconComponent && iconComponent.iconName) ? <FontAwesomeIcon className={cnInlineIcon('IconImg')} icon={iconComponent} /> : iconComponent;

    const renderProps = {
      id,
      className: this.getClassName(),
      title,
      onClick,
      style,
      // key,
    };

    const tagName = tag || 'span';
    const element = React.createElement(tagName, renderProps, content);
    return element;
  }

}

export default InlineIcon;
