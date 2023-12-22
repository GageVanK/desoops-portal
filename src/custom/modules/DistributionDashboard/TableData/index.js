import React, { useEffect, useState } from 'react'
import { Table, Popover, Image, App } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons'

import theme from '../../../../core/utils/theme'
import { setupHodlers } from '../controller'
import Enums from '../../../lib/enums'
import { copyTextToClipboard } from '../../../lib/utils'

const TableData = ({ desoData, rootState, setRootState, deviceType }) => {
  const [tableData, setTableData] = useState([])
  const { message } = App.useApp()

  const handleSelectionChange = async () => {
    const { finalHodlers, tokenTotal, selectedTableKeys } = await setupHodlers(
      rootState.finalHodlers,
      rootState,
      desoData
    )

    setRootState({ selectedTableKeys, finalHodlers, tokenTotal })
  }

  // Create a useState and useEffect hook to monitor rootState.finalHodlers and update the table data array...
  // ...to only include hodlers that have an isVisible = true
  useEffect(() => {
    const filteredHodlers = rootState.finalHodlers.filter((hodler) => hodler.isVisible)
    setTableData(filteredHodlers)
  }, [rootState.finalHodlers]) // eslint-disable-line react-hooks/exhaustive-deps

  let tableColumns = []

  if (deviceType.isSmartphone) {
    tableColumns = [
      {
        title: 'Distribute To',
        dataIndex: 'username',
        key: 'username',
        width: '100%',
        onCell: (entry) => {
          return {
            onClick: async (e) => {
              await copyTextToClipboard(entry.estimatedPaymentToken)
              message.success(`Full Payment value for ${entry.username} copied to clipboard`)
            }
          }
        },
        render: (value, entry) => {
          let estimatedPaymentLabel = entry.estimatedPaymentLabel

          if (rootState.distributionType === Enums.paymentTypes.DESO) {
            if (entry.estimatedPaymentUSD >= 0.001) {
              estimatedPaymentLabel += ` (~$${entry.estimatedPaymentUSD})`
            } else {
              estimatedPaymentLabel += ' (<$0.001)'
            }
          }

          return (
            <>
              <Image
                src={entry.profilePicUrl}
                width={18}
                height={18}
                style={{ borderRadius: '50%', marginTop: -1 }}
                fallback='https://openfund.com/images/ghost-profile-image.svg'
                preview={false}
              />
              <span style={{ color: theme.twitterBootstrap.primary, marginLeft: 5, fontSize: 14 }}>{`${
                entry.username
              } (${entry.tokenBalanceLabel}${entry.isCustom ? '' : ' token(s)'})`}</span>
              <br />
              <span
                style={{ color: theme.twitterBootstrap.primary, fontSize: 12 }}
              >{`Ownership: ${entry.percentOwnershipLabel}% - Amount: ${estimatedPaymentLabel}`}</span>
              <br />
              <span
                style={{ color: theme.twitterBootstrap.primary, fontSize: 12 }}
              >{`Last Active: ${entry.lastActiveDays} day(s) ago`}</span>
              <br />
              <span style={{ color: '#FFA07A', fontSize: 14 }}>Status: </span>
              {entry.paymentStatus === Enums.paymentStatuses.SUCCESS ? (
                <CheckCircleOutlined style={{ fontSize: 14, color: theme.twitterBootstrap.success }} />
              ) : entry.isError ? (
                <Popover content={<p>{entry.errorMessage}</p>} title='Payment Error'>
                  <CloseCircleOutlined style={{ fontSize: 14, color: theme.twitterBootstrap.danger }} />
                </Popover>
              ) : entry.paymentStatus === Enums.paymentStatuses.IN_PROGRESS ? (
                <ReloadOutlined style={{ fontSize: 14, color: theme.twitterBootstrap.primary }} spin />
              ) : (
                <span style={{ color: theme.twitterBootstrap.info, fontSize: 14 }}>{entry.paymentStatus}</span>
              )}
            </>
          )
        }
      }
    ]
  } else {
    tableColumns = [
      {
        title: 'User (Token Balance)',
        dataIndex: 'username',
        key: 'username',
        width: '30%',
        render: (value, entry) => {
          return (
            <div>
              <Image
                src={entry.profilePicUrl}
                width={20}
                height={20}
                style={{ borderRadius: '50%', marginTop: -3 }}
                fallback='https://openfund.com/images/ghost-profile-image.svg'
                preview={false}
              />
              <span style={{ color: theme.twitterBootstrap.primary, marginLeft: 5 }}>{`${value} (${
                entry.tokenBalanceLabel
              }${entry.isCustom ? '' : ' token(s)'})`}</span>
            </div>
          )
        }
      },
      {
        title: '% Ownership -> Est Payment',
        dataIndex: 'percentOwnershipLabel',
        key: 'percentOwnershipLabel',
        width: '30%',
        render: (value, entry) => {
          let estimatedPaymentLabel = entry.estimatedPaymentLabel

          if (rootState.distributionType === Enums.paymentTypes.DESO) {
            if (entry.estimatedPaymentUSD >= 0.001) {
              estimatedPaymentLabel += ` (~$${entry.estimatedPaymentUSD})`
            } else {
              estimatedPaymentLabel += '(<$0.001)'
            }
          }

          return (
            <>
              <span style={{ color: theme.twitterBootstrap.primary }}>{`${value}% -> `}</span>
              <span
                style={{ color: theme.twitterBootstrap.primary, cursor: 'pointer' }}
                onClick={async (e) => {
                  await copyTextToClipboard(entry.estimatedPaymentToken)
                  message.success(`Full payment value for ${entry.username} copied to clipboard`)
                }}
              >
                {estimatedPaymentLabel}
              </span>
            </>
          )
        }
      },
      {
        title: 'Last Active',
        dataIndex: 'lastActiveDays',
        key: 'lastActiveDays',
        width: '20%',
        render: (value, entry) => {
          let tmpVal = value === 0 ? 'Today' : value && value !== 'undefined' ? `${value} day(s) ago` : 'Unknown'
          return <span style={{ color: theme.twitterBootstrap.primary }}>{tmpVal}</span>
        }
      },
      {
        title: 'Status',
        dataIndex: 'paymentStatus',
        key: 'paymentStatus',
        render: (value, entry) => {
          if (value === Enums.paymentStatuses.SUCCESS) {
            return <CheckCircleOutlined style={{ fontSize: 20, color: theme.twitterBootstrap.success }} />
          } else if (entry.isError) {
            return (
              <Popover content={<p>{entry.errorMessage}</p>} title='Payment Error'>
                <CloseCircleOutlined style={{ fontSize: 20, color: theme.twitterBootstrap.danger }} />
              </Popover>
            )
          } else if (value === Enums.paymentStatuses.IN_PROGRESS) {
            return <ReloadOutlined style={{ fontSize: 20, color: theme.twitterBootstrap.primary }} spin />
          } else {
            return <span style={{ color: theme.twitterBootstrap.info }}>{value}</span>
          }
        }
      }
    ]
  }

  return (
    <Table
      rowKey={(hodler) => hodler.username}
      rowSelection={{
        selectedRowKeys: rootState.selectedTableKeys,
        onChange: (selectedKeys) => handleSelectionChange(selectedKeys)
      }}
      dataSource={tableData}
      loading={rootState.loading}
      style={{ width: '100%' }}
      columns={tableColumns}
      pagination={{
        position: ['topRight', 'bottomRight'],
        defaultPageSize: 50,
        size: 'small',
        showLessItems: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
      }}
    />
  )
}

const app = ({ desoData, rootState, setRootState, deviceType }) => {
  return (
    <App style={{ width: '100%' }}>
      <TableData desoData={desoData} setRootState={setRootState} rootState={rootState} deviceType={deviceType} />
    </App>
  )
}

export default app
