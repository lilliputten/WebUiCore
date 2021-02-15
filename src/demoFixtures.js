/** @module demoFixtures
 *  @desc Demo fixtures list
 *  @since 2021.02.15, 18:05
 *  @changed 2021.02.15, 18:05
 */

// import * as build from './build'

export const demoFixtures = {

  Hello: require('demo/Hello/Hello.fixture'),

  Loader: require('elements/Loader/Loader.fixture'),

  DateTimeSelector: require('elements/DateTimeSelector/DateTimeSelector.fixture'),
  InlineIcon: require('elements/InlineIcon/InlineIcon.fixture'),
  ModalWindow: require('elements/ModalWindow/ModalWindow.fixture'),
  ModalPopup: require('elements/ModalPopup/ModalPopup.fixture'),
  Menu: require('elements/Menu/Menu.fixture'),
  MenuItem: require('elements/MenuItem/MenuItem.fixture'),

  FormButton: require('forms/FormButton/FormButton.fixture'),
  FormButtonThemes: require('forms/FormButton/FormButton-Themes.fixture'),
  FormButtonDark: require('forms/FormButton/FormButton-Dark.fixture'),

  FormLabel: require('forms/FormLabel/FormLabel.fixture'),
  FormTextInput: require('forms/FormTextInput/FormTextInput.fixture'),
  FormPasswordInput: require('forms/FormPasswordInput/FormPasswordInput.fixture'),
  FormSelect: require('forms/FormSelect/FormSelect.fixture'),
  FormText: require('forms/FormText/FormText.fixture'),

  // Booleans:
  FormRadio: require('forms/FormRadio/FormRadio.fixture'),
  FormRadioThemes: require('forms/FormRadio/FormRadio-Themes.fixture'),
  // FormCheck: require('forms/FormCheck/FormCheck.fixture'),
  // FormSwitch: require('forms/FormSwitch/FormSwitch.fixture'),

  FormDateTime: require('forms/FormDateTime/FormDateTime.fixture'),
  FormDateRange: require('forms/FormDateRange/FormDateRange.fixture'),

  FormGroup: require('forms/FormGroup/FormGroup.fixture'),
  FormButtonGroup: require('forms/FormButtonGroup/FormButtonGroup.fixture'),
  FormInputGroup: require('forms/FormInputGroup/FormInputGroup.fixture'),

  FormActions: require('forms/FormActions/FormActions.fixture'),

};
