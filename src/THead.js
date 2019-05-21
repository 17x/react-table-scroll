import React from 'react'

export default (
  {
    tableHeadCols = [],
    handleSelect = null,
    handleSorting = null,
    handleResizing = null,
    handleMouseDown = null,
    selectAll = false,
    showCheckbox = false,
    currentSorting = null
  }
) => (
  <div className={'rc-table-scroll-thead-tr'}>
    {
      showCheckbox
        ? <div className={'rc-table-scroll-thead-th'}
               style={{cursor: 'default', padding: '0 5px', lineHeight: '26px'}}>
          <input type="checkbox"
                 onChange={(e) => handleSelect(e, 'toggle-all')}
                 checked={selectAll} />
        </div>
        : undefined
    }
    {
      tableHeadCols.map((val, index) => {
        let sortingClassName = ''
        if (currentSorting && (val.valueKey === currentSorting.key)) {
          sortingClassName = currentSorting.sort
        }

        return <div key={val.valueKey}
                    className={'rc-table-scroll-thead-th' + ' ' + sortingClassName}
                    style={{width: val.width}}>
          <p onClick={() => handleSorting(val)}>{val.text}</p>
          <span className={'rc-table-scroll-resizing-handler'}
                onMouseDown={(event) => handleMouseDown(event, index)}></span>
        </div>
      })
    }
  </div>)