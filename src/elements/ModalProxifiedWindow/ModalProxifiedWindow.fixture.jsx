/** @module ModalProxifiedWindow.fixture
 *  @since 2021.05.07, 13:04
 *  @changed 2021.05.31, 21:32
 */
/* eslint-disable react/jsx-max-depth, react/no-multi-comp, no-console */

import React from 'react';

// import ModalsProxy from 'elements/ModalsProxy';
import ModalProxifiedWindow from './ModalProxifiedWindow';
import FormGroup from 'forms/FormGroup';
// import FormActions from 'forms/FormActions';
import FormText from 'forms/FormText';
import FormButton from 'forms/FormButton';

import config from 'config';
import * as dates from 'utils/dates';

// Demo styles for cosmos engine
// import 'demo.pcss';

// import './ModalProxifiedWindow.fixture.pcss';

// export const DemoWrapper = FormGroup; // ({ children }) => {
export const DemoWrapper = <FormGroup flow wrap />; // ({ children }) => {

// const onAction = (params) => {
//   const { id, modalId } = params;
//   console.log('ModalProxifiedWindow.fixture:onAction', { id, modalId, params });
// };

// const modalId = 'testModal';
// const modalProps = {
// };
class ProxifiedModal extends ModalProxifiedWindow {
  constructor(props) {
    super({ modalId: 'localTestModal', ...props });
    console.log('ModalProxifiedWindow:fixture', {
      modalId: this.modalId,
    });
    this.state = {
      test: 'Initial state value',
    };
    // setTimeout(() => {
    //   this.setProps({ open: true });
    // }, 0); // DEBUG: Open with delay
    this.setProps({ open: true });
  }
  componentWillUnmount() {
    console.log('ModalProxifiedWindow:fixture:componentWillUnmount');
  }
  componentDidMount() {
    console.log('ModalProxifiedWindow:fixture:componentDidMount');
  }
  componentDidUpdate(prevProps, prevState) {
    console.log('ModalProxifiedWindow:fixture:componentDidUpdate', {
      modalId: this.modalId,
      props: this.props,
      prevProps,
      state: this.state,
      prevState,
    });
  }
  mapStateToProps(store) {
    console.log('ModalProxifiedWindow:mapStateToProps', {
      store,
    });
    return {
      store,
      test: store.demo.stateTest,
    };
  }
  updateModal = () => {
    const test = dates.formatDateTimeToString(new Date(), { format: config.constants.dateTimeMsFormat });
    console.log('ModalProxifiedWindow:fixture:updateModal', {
      test,
    });
    this.setState({ test }, () => {
      console.log('ModalProxifiedWindow:fixture:updateModal: setState callback', {
        test,
        state: this.state,
      });
      // debugger;
    });
    const { store } = config.app;
    store && store.dispatch({ type: 'SET_TEST', payload: test });
  }
  render() {
    const { test } = this.state;
    console.log('ModalProxifiedWindow:fixture:render', {
      test,
    });
    return (
      <FormGroup flow wrap>
        <FormText wrap>
          ModalProxifiedWindow
          {'; '}
          props: {this.props.test}
          {'; '}
          state: {this.state.test}
        </FormText>
        <FormButton
          text="Update"
          onClick={this.updateModal}
          theme="default"
          inline
        />
      </FormGroup>
    );
  }
}

// eslint-disable-next-line react/require-optimization
class Test extends React.Component {
  createProxyModal = () => {
    this.proxifiedModal = new ProxifiedModal({
      open: false,
      windowWidth: 'md',
    });
  }
  render() {
    return (
      <FormGroup flow wrap>
        <FormButton
          text="Create proxified modal"
          onClick={this.createProxyModal}
          theme="default"
          inline
        />
      </FormGroup>
    );
  }
}

export default {
  bootstrap: <Test />,
  // proxifiedModal,
};
