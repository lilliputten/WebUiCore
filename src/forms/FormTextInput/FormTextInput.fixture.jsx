/** @module FormTextInput.fixture
 *  @since 2020.10.07, 00:20
 *  @changed 2021.08.12, 12:16
 */
/* eslint-disable no-console */

import React from 'react';
import FormTextInput from './FormTextInput';
import FormGroup from '../FormGroup';
import FormLabel from '../FormLabel';

// Demo styles for cosmos engine
// import 'demo.pcss';

import './FormTextInput.fixture.pcss';

import { FormContextProvider } from 'helpers/FormContext';

// export const DemoWrapper = FormGroup // ({ children }) => {
export const DemoWrapper = <FormGroup stack id="Wrapper" />; // ({ children }) => {

const onChange = ({ id, name, value }) => {
  console.log('FormTextInput:fixture:onChange', {
    id,
    name,
    value,
  });
  // debugger;
};

class WithFormContext extends React.PureComponent {
  onInputEnterPressed = ({ id }) => {
    console.log('FormTextInput.fixture:onInputEnterPressed', id); // eslint-disable-line no-console
    debugger; // eslint-disable-line no-debugger
  }
  render() {
    return (
      <FormContextProvider value={this}>
        <FormTextInput
          className="WithFormContext"
          type="text"
          id="WithFormContext"
          inputId="inputId"
          name="inputName"
          value="With Form Context"
          placeholder="placeholder"
          title="title"
        />
      </FormContextProvider>
    );
  }
}
const wrappedWithFormContext = <WithFormContext />;

const simple = (
  <FormTextInput
    className="addClassName"
    type="text"
    id="simpleInput"
    name="inputName"
    inputId="simpleInputControl"
    value="simple"
    placeholder="placeholder"
    title="title"
    hasClear
    fullWidth
    onChange={onChange}
    // simpleValue="simpleValue"
    // onFocusOut={this.validateValues}
    // disabled={false}
  />
);
const withIcon = (
  <FormTextInput
    icon="faExclamationTriangle"
    iconTitle="Show value"
    placeholder="Themed with icon"
    theme="error"
  />
);
const disabledWithIcon = (
  <FormTextInput
    icon="faExclamationTriangle"
    iconTitle="Show value"
    placeholder="Disabled, themed with icon"
    theme="error"
    disabled
  />
);
const fullWidth = (
  <FormTextInput
    type="text"
    name="name"
    id="fullWidthInput"
    fullWidth
  />
);
const withLabel = (
  <FormGroup flow fullWidth>
    <FormLabel htmlFor="testId" title="Label title">Label</FormLabel>
    <FormTextInput
      className="addClassName"
      type="text"
      name="testName"
      inputId="testId"
      placeholder="Input placeholder"
      title="Input title"
      fullWidth
    />
  </FormGroup>
);
const numeric = (
  <FormTextInput
    className="addClassName"
    type="text"
    name="name"
    id="numeric"
    // inputId="simpleInputControl"
    value="1"
    hasClear
    fullWidth
    allowEmpty
    numericValue
    maxLength={2}
    minValue={2}
    maxValue={20}
    onChange={onChange}
  />
);

export default {
  simple,
  withIcon,
  disabledWithIcon,
  fullWidth,
  withLabel,
  wrappedWithFormContext,
  numeric,
};
