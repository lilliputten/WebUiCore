/** @module demo
 *  @desc Demo app entry point
 *  @since 2020.05.19, 17:16
 *  @changed 2020.12.15, 21:59
 */

import 'es5-shim/es5-shim'
import 'es5-shim/es5-sham'
import 'react-app-polyfill/ie9'
import 'react-app-polyfill/stable'

import React from 'react'
import { render } from 'react-dom'

import * as demoSupport from './demoSupport'

// Demo app styles
import './demo.pcss'

// import * as build from './build'
import './build'

/* // DEBUG: Check strings module
 * import { strings } from 'utils'
 * console.log(strings)
 * debugger
 * const x = strings.toType('number', '11')
 * debugger
 */

/* DEBUG: Check configure module
 * import { configure } from 'utils'
 * console.log(configure && configure.cssMapping)
 * debugger
 */


/* // DEBUG: Test css-module mappings substitution
 * import { utils } from './build'
 * utils.setConfigOptions({
 *   useCssModules: true,
 *   cssMappings: {
 *     WebUiCoreTest: '__MODULE__WebUiCoreTest',
 *     Test: '__MODULE__Test',
 *     Hello: '__MODULE__Hello',
 *     FormLabel: '__MODULE__FormLabel',
 *   },
 * })
 */


const fixtureComponentsList = {

  Hello: require('demo/Hello/Hello.fixture'),

  InlineIcon: require('elements/InlineIcon/InlineIcon.fixture'),
  Popup: require('elements/Popup/Popup.fixture'),
  Menu: require('elements/Menu/Menu.fixture'),
  MenuItem: require('elements/MenuItem/MenuItem.fixture'),

  FormButton: require('forms/FormButton/FormButton.fixture'),
  FormButtonThemes: require('forms/FormButton/FormButton-Themes.fixture'),
  FormButtonDark: require('forms/FormButton/FormButton-Dark.fixture'),

  FormLabel: require('forms/FormLabel/FormLabel.fixture'),
  FormTextInput: require('forms/FormTextInput/FormTextInput.fixture'),
  FormPasswordInput: require('forms/FormPasswordInput/FormPasswordInput.fixture'),
  FormGroup: require('forms/FormGroup/FormGroup.fixture'),
  FormButtonGroup: require('forms/FormButtonGroup/FormButtonGroup.fixture'),
  FormInputGroup: require('forms/FormInputGroup/FormInputGroup.fixture'),
  FormSelect: require('forms/FormSelect/FormSelect.fixture'),
  FormText: require('forms/FormText/FormText.fixture'),

  // Booleans:
  FormRadio: require('forms/FormRadio/FormRadio.fixture'),
  FormRadioThemes: require('forms/FormRadio/FormRadio-Themes.fixture'),
  // FormCheck: require('forms/FormCheck/FormCheck.fixture'),
  // FormSwitch: require('forms/FormSwitch/FormSwitch.fixture'),

}

const findFixture = window.location.search && window.location.search.match(/\bfixture=(([^&:]+)(?::([^&]+))?)/)
// const fullFixtureId = findFixture && findFixture[1]
const fixtureId = findFixture && findFixture[2]
const fixtureItemId = findFixture && findFixture[3]
const fixtureModuleExports = fixtureId && fixtureComponentsList[fixtureId]

let content

if (fixtureModuleExports) { // Found fixture
  const {
    default: fixture,
    demoTitle = 'Demo fixture: ' + fixtureId, // fullFixtureId,
    DemoWrapper,
  } = fixtureModuleExports
  content = demoSupport.PlaceFixture({ fixture, fixtureItemId, demoTitle, DemoWrapper })
}
else if (fixtureId) { // Fixture specified but not found!
  content = 'Fixture for id "' + fixtureId + '" not found!'
}
else { // List all available fixtures to display
  const fixtures = demoSupport.FixturesContents(fixtureComponentsList)
  content = (
    <div className="demoIndex">
      <h3 className="demoIndex-Title">Available fixtures</h3>
      {fixtures}
      <h3 className="demoIndex-Title">Available demos</h3>
      (TODO)
      <p className="demoIndex-Comment">TODO: Navigation, styles, hierarchical components structure</p>
    </div>
  )
}

const demoContent = (
  <div className="demo">
    {content}
  </div>
)

render(demoContent, document.getElementById('Root'))
