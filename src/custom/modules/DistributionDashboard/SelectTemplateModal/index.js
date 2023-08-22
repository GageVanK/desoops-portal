import React from 'react'
import { Col, Modal, Row, Table } from 'antd'

const SelectTemplateModal = ({ isOpen, templates, onCancel, onSelectTemplate }) => {
  const tableColumns = [
    {
      title: 'Saved Templates',
      dataIndex: 'name',
      style: { cursor: 'pointer' },
      onCell: () => {
        return {
          style: {
            cursor: 'pointer'
          }
        }
      }
    }
  ]

  return (
    <Modal
      open={isOpen}
      title={'Select Distribution Template'}
      cancelText='Close'
      onCancel={onCancel}
      cancelButtonProps={{
        style: { color: '#188EFF' }
      }}
      okButtonProps={{ style: { display: 'none' } }}
    >
      <Row style={{ marginTop: 20, justifyContent: 'center' }}>
        {templates.length > 0 ? (
          <Col span={24}>
            <Table
              columns={tableColumns}
              dataSource={templates}
              bordered
              size='small'
              pagination={false}
              onRow={(record) => {
                return {
                  onClick: () => {
                    onSelectTemplate(record._id)
                  }
                }
              }}
            />
          </Col>
        ) : (
          <Col span={24}>
            <center>
              <p>
                You do not have any saved Distribution Templates. In the Payment Modal, once the distribution is
                completed, you will have an option to save the current distribution setup as a template.
              </p>
            </center>
          </Col>
        )}
      </Row>
    </Modal>
  )
}

export default SelectTemplateModal
