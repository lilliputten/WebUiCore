/** @module Popup
 *  @class Popup
 *  @since 2020.10.27, 00:39
 *  @changed 2020.12.15, 21:59
 */

import React from 'react'
import PropTypes from 'prop-types'
// import connect from 'react-redux/es/connect/connect'
import { cn } from 'utils'
// import withOnClickOutside from 'react-onclickoutside' // To use?
import { strings } from 'utils'
import { debounce } from 'throttle-debounce'
import FormItemHOC from 'forms/FormItemHOC'
import { PortalWithState } from 'react-portal'

import './Popup.pcss'

const cnPopup = cn('Popup')
const cnPopupControl = cn('PopupControl')

// const delayedClickTimeout = 150
const debouncedUpdateGeometryTimeout = 50

const domNodeGeometryKeys = [
  'offsetLeft',
  'offsetTop',
  'offsetWidth',
  'offsetHeight',
  'clientWidth',
  'clientHeight',
]
const verticalGeometryKeys = [
  'contentClientHeight',
  'contentOffsetHeight',
  'contentOffsetTop',
  'controlClientHeight',
  'controlOffsetHeight',
  'controlOffsetTop',
  'scrollY',
  'viewHeight',
]
const horizontalGeometryKeys = [
  'contentClientWidth',
  'contentOffsetWidth',
  'contentOffsetLeft',
  'controlClientWidth',
  'controlOffsetWidth',
  'controlOffsetLeft',
  'scrollX',
  'viewWidth',
]

const globalGeometryKeys = {
  viewWidth: { obj: window, key: 'innerWidth' },
  viewHeight: { obj: window, key: 'innerHeight' },
  scrollX: { obj: window },
  scrollY: { obj: window },
}

// const globalClickEventName = 'mousedown'
// const globalKeyPressEventName = 'keydown'
const globalScrollEventName = 'scroll'
const globalResizeEventName = 'resize'

class Popup extends React.PureComponent /** @lends @Popup.prototype */ {

  static propTypes = {
    className: PropTypes.string,
    // closeOnClickOutside: PropTypes.oneOfType([ PropTypes.bool, PropTypes.string ]), // true, false, 'force'
    closeOnClickOutside: PropTypes.bool,
    closeOnEscPressed: PropTypes.bool,
    id: PropTypes.string,
    onControlClick: PropTypes.func,
    onEscPressed: PropTypes.func,
    onKeyPress: PropTypes.func,
    popupContent: PropTypes.oneOfType([ PropTypes.func, PropTypes.object ]).isRequired,
    popupControl: PropTypes.oneOfType([ PropTypes.func, PropTypes.object ]).isRequired,
    registerHideStopper: PropTypes.func, // registerHideStopper(handler = this.clearDelayedClickTimerHandler) -- handler stored by parent component and called when detected click on pulldown menu -- prevents popup content closing
    showPopup: PropTypes.bool,
  }

  static defaultProps = {
    className: null,
    closeOnClickOutside: true,
    closeOnEscPressed: true,
    id: null,
    onControlClick: null,
    onEscPressed: null,
    onKeyPress: null,
    // popupContent: null,
    // popupControl: null,
    registerHideStopper: null,
    showPopup: false,
  }

  delayedClickTimerHandler = null
  globalHandlersRegistered = false
  controlDomNode = null
  contentDomNode = null
  geometry = {}

  // Helpers...

  delayedGlobalClickHandler = () => { // Close popup
    // console.log('Popup:delayedGlobalClickHandler')
    this.setState({ show: false })
  }

  clearDelayedClickTimerHandler = () => {
    // console.log('Popup:clearDelayedClickTimerHandler', this.delayedClickTimerHandler)
    if (this.delayedClickTimerHandler) {
      clearTimeout(this.delayedClickTimerHandler)
      this.delayedClickTimerHandler = null
    }
  }

  /* // globalClickHandler = () => {
   *   // console.log('Popup:globalClickHandler (set handler)', this.delayedClickTimerHandler)
   *   this.clearDelayedClickTimerHandler()
   *   this.delayedClickTimerHandler = setTimeout(this.delayedGlobalClickHandler, delayedClickTimeout)
   * }
   */

  /* // globalKeyPressHandler = (event) => {
   *   var { keyCode } = event
   *   const {
   *     id,
   *     onKeyPress,
   *     onEscPressed,
   *     closeOnEscPressed,
   *   } = this.props
   *   const cbProps = { event, id, keyCode }
   *   if (typeof onKeyPress === 'function') {
   *     onKeyPress(cbProps)
   *   }
   *   const isEsc = keyCode === 27 // Esc?
   *   if (isEsc) {
   *     if (typeof onEscPressed === 'function') {
   *       onEscPressed(cbProps)
   *     }
   *     if (closeOnEscPressed) {
   *       this.setState({ show: false })
   *     }
   *   }
   * }
   */

  globalScrollHandler = (/* event */) => {
    this.updateGeometryDebounced()
  }

  globalResizeHandler = (/* event */) => {
    this.updateGeometryDebounced()
  }

  getDomNodeGeometry(domNode, id) {
    id = id || 'default'
    const geometry = domNodeGeometryKeys.reduce((geometry, key) => {
      const val = domNode && domNode[key]
      if (val != null) {
        const resultKey = id + strings.ucFirst(key)
        geometry[resultKey] = val
      }
      return geometry
    }, {})
    return geometry
  }

  getGlobalGeometry() {
    const geometry = Object.entries(globalGeometryKeys).reduce((geometry, [id, descr]) => {
      const obj = descr.obj
      const key = descr.key || id
      const val = obj[key]
      // const isUpdated = (val !== origGeometry[id])
      // if (isUpdated && !updatedGeometryKeys.includes[id]) {
      //   updatedGeometryKeys.push(id)
      // }
      return { ...geometry, [id]: val }
    }, {})
    return geometry
  }

  getUpdatedGeometryKeys(geometry) {
    const origGeometry = this.geometry
    const updatedKeys = []
    Object.entries(geometry).forEach(([key, val]) => {
      if (val !== origGeometry[key]) {
        updatedKeys.push(key)
      }
    })
    return updatedKeys
  }

  updateShowContentAbove(geometry, updatedGeometryKeys) {
    // Calcs: see `201215-PopupLayout.psd`
    const controlViewOffsetTop = geometry.controlOffsetTop - geometry.scrollY // = 914 - 25 = 889
    const controlViewOffsetBottom = controlViewOffsetTop + geometry.controlOffsetHeight // = 889 + 32 = 921
    const controlViewBottomRest = geometry.viewHeight - controlViewOffsetBottom
    // Is it better to show content above control?
    const showAbove = controlViewBottomRest < controlViewOffsetTop && geometry.contentClientHeight > controlViewBottomRest - 5
    // Default position: from (bottom, left) -> down
    console.log('Popup:updateGeometry', { // eslint-disable-line no-console
      showAbove,
      controlViewOffsetTop,
      controlViewOffsetBottom,
      controlViewBottomRest,
      updatedGeometryKeys,
      geometry,
    })
    // debugger
    // TODO?
  }

  updateContentWidth(geometry, updatedGeometryKeys) {
    if (updatedGeometryKeys.includes('controlClientWidth')) {
      const domNode = this.contentDomNode
      const width = geometry.controlClientWidth
      // console.log('Popup:updatedGeometryKeys: Update content wrapper width', width, geometry, updatedGeometryKeys)
      domNode.style.width = width + 'px'
    }
  }

  updateGeometry = () => { // UNUSED? TODO? Update geometry
    const { fullWidth } = this.props
    // TODO: Call `updateGeometry` on content update? How? Use timer?
    const controlGeometry = this.getDomNodeGeometry(this.controlDomNode, 'control')
    const contentGeometry = this.getDomNodeGeometry(this.contentDomNode, 'content')
    const globalGeometry = this.getGlobalGeometry()
    const geometry = { ...globalGeometry, ...controlGeometry, ...contentGeometry }
    /* Sample geometry keys:
     * contentClientHeight
     * contentClientWidth
     * contentOffsetHeight
     * contentOffsetLeft
     * contentOffsetTop
     * contentOffsetWidth
     * controlClientHeight
     * controlClientWidth
     * controlOffsetHeight
     * controlOffsetLeft
     * controlOffsetTop
     * controlOffsetWidth
     * scrollX
     * scrollY
     * viewHeight
     * viewWidth
     */
    const updatedGeometryKeys = this.getUpdatedGeometryKeys(geometry)
    const changedHorizontalKeys = horizontalGeometryKeys.some(key => updatedGeometryKeys.includes(key))
    const changedVerticalKeys = verticalGeometryKeys.some(key => updatedGeometryKeys.includes(key))
    console.log('Popup:updateGeometry', { updatedGeometryKeys, changedHorizontalKeys, changedVerticalKeys, geometry })
    // if (changedVerticalKeys) { // UNUSED
    //   this.updateShowContentAbove(geometry, updatedGeometryKeys)
    // }
    if (changedHorizontalKeys && fullWidth) {
      this.updateContentWidth(geometry, updatedGeometryKeys)
    }
    // Store geometry data object
    this.geometry = geometry
  }

  registerGlobalHandlers() {
    if (!this.globalHandlersRegistered) {
      this.globalHandlersRegistered = true
      // this.updateGeometryDebounced() // ???
      // if (this.props.closeOnClickOutside) {
      //   document.addEventListener(globalClickEventName, this.globalClickHandler)
      // }
      // document.addEventListener(globalKeyPressEventName, this.globalKeyPressHandler)
      document.addEventListener(globalScrollEventName, this.globalScrollHandler)
      window.addEventListener(globalResizeEventName, this.globalResizeHandler)
    }
  }
  unregisterGlobalHandlers() {
    if (this.globalHandlersRegistered) {
      this.globalHandlersRegistered = false
      // if (this.props.closeOnClickOutside) {
      //   this.clearDelayedClickTimerHandler()
      //   document.removeEventListener(globalClickEventName, this.globalClickHandler)
      // }
      // document.removeEventListener(globalKeyPressEventName, this.globalKeyPressHandler)
      document.removeEventListener(globalScrollEventName, this.globalScrollHandler)
      window.removeEventListener(globalResizeEventName, this.globalResizeHandler)
    }
  }

  updateGlobalClickHandlerByState = (state) => {
    const { show } = state
    if (show) {
      this.registerGlobalHandlers()
    }
    else {
      this.unregisterGlobalHandlers()
    }
  }

  // Lifecycle...

  constructor(props) {
    super(props)
    // const { defaultOpen } = props
    // const { showPopup, registerHideStopper } = props
    this.state = {
      // show: showPopup, // Is content element displaying now?
      // wasShown: showPopup, // Memorized state: did content element once displayed?
    }
    // if (typeof registerHideStopper === 'function') { // External hide canceler (FormSelect: on Menu click etc)
    //   registerHideStopper(this.clearDelayedClickTimerHandler)
    // }
    this.updateGeometryDebounced = debounce(debouncedUpdateGeometryTimeout, this.updateGeometry)
  }

  // componentDidMount() {
  //   const { show } = this.state
  //   if (show) {
  //     this.registerGlobalHandlers()
  //   }
  // }

  componentWillUnmount() {
    this.unregisterGlobalHandlers()
    // TODO: unregisterHideStopper -- is it required?
  }

  // componentDidUpdate(prevProps, prevState) {
  //   const prevShowPopup = prevProps.showPopup
  //   const showPopup = this.props.showPopup
  //   if (this.state && !prevState.wasShown) {
  //     this.updateGeometryDebounced()
  //   }
  //   if (prevShowPopup !== showPopup) {
  //     this.setState(({ wasShown }) => {
  //       // if (!prevShowPopup.wasShown && showPopup) {
  //       // }
  //       return {
  //         show: showPopup,
  //         wasShown: wasShown || showPopup,
  //       }
  //     }, this.updateGlobalClickHandlerByState)
  //   }
  //   else if (prevState.show !== this.state.show) {
  //     this.updateGlobalClickHandlerByState(this.state)
  //   }
  // }

  // Handlers...

  // onControlClick = ({ show }) => {
  //   this.clearDelayedClickTimerHandler()
  //   if (show == null) { // Toggle state if no value passed
  //     show = !this.state.show
  //   }
  //   // console.log('Popup:onControlClick', { show })
  //   this.setState(({ wasShown }) => ({
  //     show,
  //     wasShown: wasShown || show,
  //   }))
  //   const { onControlClick } = this.props
  //   if (typeof onControlClick === 'function') {
  //     onControlClick({ show })
  //   }
  // }

  /* // UNUSED? handleClickOutside -- form withOnClickOutside
   * handleClickOutside = (ev) => {
   *   console.log(ev)
   *   debugger
   * }
   */

  // Render helpers...

  getClassName(params) {
    const {
      isOpen,
      cnCtx,
      // openPortal,
      // closePortal,
      // portal,
    } = params
    const {
      id,
      fullWidth,
    } = this.props
    // const {
    //   show,
    //   // wasShown,
    // } = this.state
    const className = cnCtx && cnCtx({
      id,
      show: isOpen,
      fullWidth,
    }, [this.props.className])
    return className
  }

  // Handlers...

  setDomRef = (domNode) => {
    this.domNode = domNode
  }

  setControlRef = (domNode) => {
    this.controlDomNode = domNode
  }

  setContentRef = (domNode) => {
    this.contentDomNode = domNode
  }

  // Render...

  renderPopupControl(portalParams) {
    const {
      isOpen,
      openPortal,
      closePortal,
      // portal,
    } = portalParams
    const { id, popupControl } = this.props
    // const {
    //   show,
    //   // wasShown,
    // } = this.state

    const controlProps = popupControl && popupControl.props

    const content = {
      ...popupControl,
      props: {
        ...controlProps,
        onClick: isOpen ? closePortal : openPortal,
        // onClick: [> controlProps.onControlClick || <] this.onControlClick,
        checked: isOpen,
        setDomRef: this.setControlRef,
      },
    }

    const renderProps = {
      id,
      className: this.getClassName({ cnCtx: cnPopupControl, ...portalParams }),
      ref: this.setControlRef,
    }
    return (
      <div {...renderProps}>
        {content}
      </div>
    )
  }

  renderPopupContent(portalParams) {
    const {
      isOpen,
      // openPortal,
      // closePortal,
      portal,
    } = portalParams
    const { id, popupContent } = this.props
    // const {
    //   show,
    //   wasShown,
    // } = this.state
    // if (!show && !wasShown) { // Content hidden and was not initialized
    //   return null
    // }
    const renderProps = {
      id,
      className: this.getClassName({ cnCtx: cnPopup, ...portalParams }),
      ref: this.setContentRef,
    }
    return portal(
      <div {...renderProps}>
        {popupContent}
      </div>
    )
  }

  renderContent = (portalParams) => {
    const {
      isOpen,
      // openPortal,
      // closePortal,
      // portal,
    } = portalParams
    if (isOpen !== this.isOpen) {
      if (isOpen) {
        this.updateGeometryDebounced()
        this.registerGlobalHandlers()
      }
      else {
        this.wasOpen = true
        this.unregisterGlobalHandlers()
      }
      this.isOpen = isOpen
    }
    // const { id } = this.props
    // const renderProps = {
    //   id,
    //   className: this.getClassName({ isOpen }),
    //   ref: this.setDomRef,
    // }
    // return (
    //   <div {...renderProps}>
    //     {this.renderPopupControl(portalParams)}
    //     {this.renderPopupContent(portalParams)}
    //   </div>
    // )
    return (
      <React.Fragment>
        {this.renderPopupControl(portalParams)}
        {this.renderPopupContent(portalParams)}
      </React.Fragment>
    )
  }

  render() {
    const node = document && document.getElementById('Popups')
    return (
      <PortalWithState node={node} closeOnOutsideClick closeOnEsc>
        {this.renderContent}
      </PortalWithState>
    )
  }

}

export default Popup

export const FormItemPopup = FormItemHOC(Popup)

// export default withOnClickOutside(Popup) // To use?
