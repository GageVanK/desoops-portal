import React from 'react'
import { Row, Col, Card } from 'antd'
import '../index.css'
import Login from './login'

const Landing = () => {
  return (
    <Row
      className='background-test'
      justify='center'
      style={{
        minHeight: '100vh',
        alignItems: 'center'
      }}
    >
      <Col span={24}>
        <Row justify='center'>
          <Col span={24}>
            <Card
              bodyStyle={{ border: 'none', background: 'none' }}
              style={{
                border: 'none',
                paddingTop: 24,
                paddingBottom: 24,
                background: 'none'
              }}
              type='inner'
              size='small'
            >
              <Login />
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default Landing
