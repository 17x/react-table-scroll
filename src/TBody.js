import React from 'react'

export default (
  {
    data = [],
    cols = [],
    handleSelect = null,
    showCheckbox = false,
    renderingRowMinIndex = NaN,
    renderingRowMaxIndex = NaN,
    rowHeight = NaN,
    rowsClickHighlight = false,
    cellWithTitleAttr = false
  }
) => {
  return <div className={'rc-table-scroll-tbody'} style={{height: data.length * rowHeight}}>{
    data.map((row, index) => {
      if (index < renderingRowMinIndex || index > renderingRowMaxIndex) {
        return undefined
      }

      let trRestProps = {}
      let tdRestProps = {}

      // for click highlight
      if (rowsClickHighlight) {
        trRestProps.tabIndex = '0'
      }

      return <div className="rc-table-scroll-tbody-tr"
                  key={index}
                  style={{top: rowHeight * index}}
                  {...trRestProps}>
        {
          /*load checkbox*/
          showCheckbox &&
          <div className={'rc-table-scroll-tbody-th-select'}
               style={{height: rowHeight, lineHeight: rowHeight + 'px'}}>
            <input type="checkbox"
                   onChange={(e) => handleSelect(e, 'handle-row', index)}
                   checked={row.selected} />
          </div>
        }
        {
          /*cells*/
          cols.map(col => {

            if (cellWithTitleAttr) {
              tdRestProps.title = row[col.valueKey]
            }

            return <div key={col.valueKey}
                        style={{width: col.width, height: rowHeight, lineHeight: rowHeight + 'px'}}
                        {...tdRestProps}>{row[col.valueKey]}</div>
          })
        }
      </div>
    })
  }</div>
}