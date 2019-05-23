import React, {Component} from 'react'
// import {uniqBy, cloneDeep, orderBy, some,isNumber} from 'lodash'
import uniqBy from 'lodash/uniqBy'
import cloneDeep from 'lodash/cloneDeep'
import orderBy from 'lodash/orderBy'
import some from 'lodash/some'
import isNumber from 'lodash/isNumber'

import update from 'immutability-helper'
import THead from './THead'
import TBody from './TBody'
import './style.css'

// The Unique id for each table instance
let id = 0
// Throttling
let throttling = null
// Throttling for scroll event
let scrollEndTimer = null

// add properties
const handlePropsData = (data = []) => {
  if (data.length === 0) return

  let copyData = cloneDeep(data)

  copyData.map((val, idx) => {
    val.selected = false
    val._id = idx + 1
  })

  return copyData
}

class ReactTableScroll extends Component {
  constructor(props) {
    super(props)
    id++
  }

  // Table row's height
  defaultRowHeight = 34
  // Resizing- index of table head ths
  resizingColIndex = NaN
  // Resizing- mouse down mouse point
  startPointX = NaN
  // Table scroll container ref
  scrollContain

  state = ({
    cols: uniqBy(cloneDeep(this.props.cols), 'valueKey'),
    data: handlePropsData(this.props.data),
    selectAll: false,
    // Current Sorting col's key and asc
    currentSorting: {
      key: '_id',
      sort: 'asc'
    },
    // default set : 0 to 100
    renderingRowMinIndex: 0,
    renderingRowMaxIndex: 100
  })

  componentDidMount() {
    // Binding events
    document.addEventListener('mouseup', this.handleTHeadThMouseUp)
    document.addEventListener('mousemove', this.handleTHeadThMouseMove)
  }

  componentWillUnmount() {
    // Unbinding events
    document.removeEventListener('mouseup', this.handleTHeadThMouseUp)
    document.removeEventListener('mousemove', this.handleTHeadThMouseMove)
  }

  componentWillReceiveProps(nextProps) {
    let newData = nextProps.data
    let currentData = this.state.data

    // determine diff
    if (newData && currentData && (newData.length === currentData.length)) {
      let equals = true

      newData.map(val => {
        equals = some(currentData, val)
      })

      if (equals) return
    }

    this.setState({
      data: handlePropsData(nextProps.data)
    })
  }

  // Handle checkbox select event
  // select-all and per-row
  handleSelect = (event, handleCode, idx) => {
    if (throttling) return

    throttling = true
    setTimeout(() => {throttling = false}, 100)

    let currEleCheckedState = event.target.checked
    let newData
    let partialState
    let {data} = this.state
    if (!data || !data.length) return

    if (handleCode === 'toggle-all') {
      newData = cloneDeep(data)
      // 已勾选
      // 应用到所有数据行
      newData.map(val => {
        val.selected = currEleCheckedState
      })

      partialState = {
        selectAll: currEleCheckedState,
        data: newData
      }

    } else if (handleCode === 'handle-row') {
      newData = update(data, {[idx]: {$merge: {selected: currEleCheckedState}}})
      partialState = {data: newData}
    } else {
      return
    }

    this.setState(partialState, () => {
      const {onTableSelected} = this.props

      onTableSelected && onTableSelected(
        newData.filter(val => val.selected)
      )
    })

  }

  // 处理并决定哪些数据展示在页面上
  handleRenderingRows = () => {
    const wrapDom = this.scrollContain
    let wrapDomsHeight = wrapDom.offsetHeight
    // let wrapDomsScrollHeight = wrapDom.scrollHeight
    let wrapDomScrollTop = wrapDom.scrollTop
    // 缓冲展示, 上一下一，共三屏
    let lineTop = wrapDomScrollTop - wrapDomsHeight
    let lineBottom = wrapDomScrollTop + wrapDomsHeight * 2
    let minIndex = parseInt(lineTop / this.defaultRowHeight)
    let maxIndex = parseInt(lineBottom / this.defaultRowHeight)

    minIndex = Math.max(minIndex, 0)
    maxIndex = Math.min(maxIndex, this.state.data.length)

    this.setState({
      renderingRowMinIndex: minIndex,
      renderingRowMaxIndex: maxIndex
    })
  }

  handleScroll = () => {
    if (scrollEndTimer) {
      clearTimeout(scrollEndTimer)
    }

    scrollEndTimer = setTimeout(() => {
      this.handleRenderingRows()
    }, 100)
  }

  handleSorting = (col) => {
    let currSortCol = cloneDeep(this.state.currentSorting)
    let newData = cloneDeep(this.state.data)

    // 升序降序的高亮状态控制
    if (col.valueKey === currSortCol.key) {
      currSortCol.sort = currSortCol.sort === 'asc' ? 'desc' : 'asc'
    } else {
      currSortCol = {key: col.valueKey, sort: 'asc'}
    }

    //  do sorting
    newData = orderBy(newData, currSortCol.key, currSortCol.sort)

    this.setState({
      currentSorting: currSortCol,
      data: newData
    })
  }

  handleTHeadThMouseUp = (event) => {
    this.resizingColIndex = NaN
    this.startPointX = NaN

    document.documentElement.style.cursor = ''

    event.stopPropagation()
    event.preventDefault()
  }

  handleTHeadResizingMouseDown = (event, i) => {
    this.resizingColIndex = i
    this.startPointX = event.screenX

    document.documentElement.style.cursor = 'col-resize'

    event.stopPropagation()
    event.preventDefault()
  }

  handleTHeadThMouseMove = (event) => {
    // console.log(this.resizingColIndex, this.startPointX)
    if (!isNumber(this.resizingColIndex) || !this.startPointX || throttling) return

    throttling = true
    setTimeout(() => {
      throttling = false
    }, 100)

    let newCols = cloneDeep(this.state.cols)
    let deltaX = event.screenX - this.startPointX
    let currCol = newCols[this.resizingColIndex]
    this.startPointX = event.screenX

    let newWidth = deltaX + currCol.width
    currCol.width = newWidth < 20 ? 20 : newWidth
    // console.log(deltaX, newWidth)

    this.setState({
      cols: newCols
    })

    event.stopPropagation()
    event.preventDefault()
  }

  render() {
    const {
      // ref,
      showCheckbox,
      // sortable,
      // onRowClick,
      // onRowDoubleClick,
      rowsClickHighlight,
      cellWithTitleAttr
    } = this.props

    const {
      cols,
      data,
      selectAll,
      currentSorting,
      renderingRowMinIndex,
      renderingRowMaxIndex
    } = this.state

    return <div id={'rc-table-scroll-' + id}
                className={'rc-table-scroll'}
                ref={(e) => this.scrollContain = e}
                onScroll={this.handleScroll}>
      <THead tableHeadCols={cols}
             showCheckbox={showCheckbox}
             selectAll={selectAll}
             currentSorting={currentSorting}
             handleSelect={this.handleSelect}
             handleSorting={this.handleSorting}
             handleMouseDown={this.handleTHeadResizingMouseDown} />
      <TBody data={data}
             cols={cols}
             rowHeight={this.defaultRowHeight}
             handleSelect={this.handleSelect}
             renderingRowMinIndex={renderingRowMinIndex}
             renderingRowMaxIndex={renderingRowMaxIndex}
             showCheckbox={showCheckbox}
             rowsClickHighlight={rowsClickHighlight}
             cellWithTitleAttr={cellWithTitleAttr} />
    </div>
  }
}

export default ReactTableScroll