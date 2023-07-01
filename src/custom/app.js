import { useContext } from 'react'
import { Row, Spin } from 'antd'
import { DeSoIdentityContext } from 'react-deso-protocol'
import BatchTransactionsForm from './batch-transactions/components/form'
import Landing from './landing/components/landing'

const App = () => {
  const { currentUser, isLoading } = useContext(DeSoIdentityContext)

  // useEffect(() => {
  //   if (currentUser) desoLogout()
  // }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {isLoading ? (
        <Row justify='center' style={{ marginTop: 100 }}>
          <Spin tip='Initializing DeSo Ops Portal...' size='large'></Spin>
        </Row>
      ) : currentUser ? (
        <BatchTransactionsForm />
      ) : (
        <Landing />
      )}
    </>
  )
}

export default App
