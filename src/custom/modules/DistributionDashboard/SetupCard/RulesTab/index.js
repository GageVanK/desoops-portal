// Create a ReactJS Functional Component called StepOneCard
// Use Ant Design's Card Component, with a title of 'Start Here' and size of 'small'
// Use Ant Design's Row and Col Components to create a 2x2 grid

import React from 'react'
import { Row, Col, Select, Divider, InputNumber, Radio, Switch, message } from 'antd'
import { updateHodlers } from '../../controller'

const styleParams = {
  col1XS: 24,
  labelColSM: 12,
  labelColMD: 9,
  valueColXS: 24,
  valueColSM: 12,
  valueColMD: 15,
  colRightXS: 24,
  labelColStyle: { marginTop: 4 },
  dividerStyle: { margin: '7px 0' }
}

const RulesTab = ({ state, onSetState }) => {
  const handleFilterUsers = async (propType, propValue) => {
    // propType could be either 'filterUsers' or 'filterAmountIs' or 'filterAmount'
    // propValue could be either true/false or '>'/'<' or a number based on propType
    // if filterUsers is true, filterAmount is a valid number, and filterAmountIs is not empty, then we can run the updateHolders function
    // if filterUsers is false, then we can run the updateHolders function
    // The final step is to update the state with with either the current state values or the new values from updateHolders and propType/propValue

    let newState = {}
    let runUpdateHolders = false
    let tmpHodlers = null
    let tmpSelectedTableKeys = null

    try {
      if (propType === 'filterUsers') {
        newState.filterUsers = propValue
      } else {
        newState.filterUsers = state.filterUsers
      }

      if (propType === 'filterAmountIs') {
        newState.filterAmountIs = propValue
      } else {
        newState.filterAmountIs = state.filterAmountIs
      }

      if (propType === 'filterAmount') {
        newState.filterAmount = propValue
      } else {
        newState.filterAmount = state.filterAmount
      }

      // If state.filterUsers is true and newState.filterUsers is set to false, then we can run updateHolders
      if (state.filterUsers && !newState.filterUsers) {
        runUpdateHolders = true
        newState.filterAmount = ''
        newState.filterAmountIs = '>'
      } else if (newState.filterUsers) {
        runUpdateHolders = true
      }

      if (runUpdateHolders) {
        tmpHodlers = Array.from(state.finalHodlers)
        tmpSelectedTableKeys = Array.from(state.selectedTableKeys)

        const { finalHodlers, selectedTableKeys, tokenTotal } = await updateHodlers(
          tmpHodlers,
          tmpSelectedTableKeys,
          newState
        )

        newState.finalHodlers = finalHodlers
        newState.selectedTableKeys = selectedTableKeys
        newState.tokenTotal = tokenTotal
      }

      onSetState(newState)
    } catch (e) {
      message.error(e.message)
    }
  }

  return (
    <>
      <Row>
        <Col xs={styleParams.col1XS} style={{ marginBottom: 5 }}>
          <span style={{ fontSize: 16 }}>
            <b>Spread amount based on:</b>
          </span>
        </Col>
        <Col xs={styleParams.col1XS}>
          <Radio.Group
            value={state.spreadAmountBasedOn}
            buttonStyle='solid'
            onChange={(e) => onSetState({ spreadAmountBasedOn: e.target.value })}
          >
            <Radio.Button value={'Ownership'}>% Ownership</Radio.Button>
            <Radio.Button value={'Equal Spread'}>Equal Spread</Radio.Button>
          </Radio.Group>
        </Col>
      </Row>
      <Divider style={styleParams.dividerStyle} />
      <Row>
        <Col xs={styleParams.col1XS} style={{ marginBottom: 5 }}>
          <span style={{ fontSize: 16 }}>
            <b>Filter users based on Tokens owned?</b>
          </span>
        </Col>
        <Col xs={styleParams.col1XS}>
          <Switch
            style={{ width: 65 }}
            checkedChildren='Yes'
            unCheckedChildren='No'
            onChange={(checked) => {
              handleFilterUsers('filterUsers', checked)
            }}
          />
        </Col>
      </Row>
      {state.filterUsers ? (
        <>
          <Divider style={styleParams.dividerStyle} />
          <Row>
            <Col xs={24} sm={7} md={5} lg={24} style={{ paddingTop: 3, paddingBottom: 3 }}>
              <span style={{ fontSize: 16 }}>
                <b>Where Token Balance is</b>
              </span>
            </Col>
            <Col xs={5} sm={4} md={3} lg={5}>
              <Select
                style={{ width: 70 }}
                value={state.filterAmountIs}
                onChange={(filterAmountIs) => {
                  handleFilterUsers('filterAmountIs', filterAmountIs)
                }}
              >
                <Select.Option value={'>'}>{'>'}</Select.Option>
                <Select.Option value={'>='}>{'>='}</Select.Option>
                <Select.Option value={'<'}>{'<'}</Select.Option>
                <Select.Option value={'<='}>{'<='}</Select.Option>
              </Select>
            </Col>
            <Col>
              <InputNumber
                min={0}
                placeholder='amount'
                style={{ width: 150 }}
                onChange={(filterAmount) => {
                  handleFilterUsers('filterAmount', filterAmount)
                }}
              />
            </Col>
          </Row>
        </>
      ) : null}
    </>
  )
}

export default RulesTab
