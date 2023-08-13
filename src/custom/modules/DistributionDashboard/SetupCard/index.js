import React from 'react'
import { useSelector } from 'react-redux'
import { Card, Tabs, Button, Image } from 'antd'
import GeneralTab from './GeneralTab'
import RulesTab from './RulesTab'
import Enums from '../../../lib/enums'
import { UsergroupAddOutlined, FileAddOutlined } from '@ant-design/icons'
import DeSoNFTSearchModal from '../../../reusables/components/DeSoNFTSearchModal'
import DeSoUserSearchModal from '../../../reusables/components/DeSoUserSearchModal'
import SelectTemplateModal from '../SelectTemplateModal'

const SetupCard = ({
  desoData,
  rootState,
  onDistributeTo,
  onDistributeMyHodlers,
  onDistributeDeSoUser,
  onDistributionType,
  onTokenToUse,
  setRootState,
  onConfirmNFT,
  onConfirmCustomList,
  onSelectTemplate,
  deviceType
}) => {
  const distributionTemplates = useSelector((state) => state.custom.distributionTemplates)

  const handleButtonClick = () => {
    switch (rootState.distributeTo) {
      case Enums.values.NFT:
        setRootState({ openNftSearch: true })
        break
      case Enums.values.CUSTOM:
        setRootState({ customListModal: { ...rootState.customListModal, isOpen: true } })
        break
      case Enums.values.EMPTY_STRING:
        setRootState({ selectTemplateModal: { ...rootState.selectTemplateModal, isOpen: true } })
        break
    }
  }

  const handleCancelNFT = () => {
    setRootState({ openNftSearch: false })
  }

  const handleCancelCustomList = () => {
    setRootState({ customListModal: { ...rootState.customListModal, isOpen: false } })
  }

  const handleCancelTemplateModal = () => {
    setRootState({ selectTemplateModal: { ...rootState.selectTemplateModal, isOpen: false } })
  }

  const renderTabBarExtraContent = () => {
    let tabBarExtraContent = null

    if (rootState.distributeTo === Enums.values.NFT) {
      const nftIcon = rootState.nftMetaData.id ? (
        <Image src={rootState.nftMetaData.imageUrl} style={styleProps.nftIcon} preview={false} />
      ) : null

      tabBarExtraContent = (
        <Button style={styleProps.tabButton} onClick={handleButtonClick} icon={nftIcon}>
          Select NFT
        </Button>
      )
    } else if (rootState.distributeTo === Enums.values.CUSTOM) {
      tabBarExtraContent = (
        <Button style={styleProps.tabButton} onClick={handleButtonClick} icon={<UsergroupAddOutlined />}>
          Manage List
        </Button>
      )
    } else if (rootState.distributeTo === Enums.values.EMPTY_STRING) {
      tabBarExtraContent = (
        <Button style={styleProps.tabButton} onClick={handleButtonClick} icon={<FileAddOutlined />}>
          Load Template
        </Button>
      )
    }

    return tabBarExtraContent
  }

  const tabItems = [
    {
      key: '1',
      label: 'General',
      disabled: rootState.isExecuting,
      children: (
        <GeneralTab
          desoProfile={desoData.profile}
          rootState={rootState}
          deviceType={deviceType}
          onDistributeTo={onDistributeTo}
          onDistributeMyHodlers={onDistributeMyHodlers}
          onDistributeDeSoUser={onDistributeDeSoUser}
          onDistributionType={onDistributionType}
          setRootState={setRootState}
          onTokenToUse={onTokenToUse}
        />
      )
    },
    {
      key: '2',
      label: 'Rules',
      disabled: !rootState.rulesEnabled || rootState.isExecuting,
      children: (
        <RulesTab desoData={desoData} deviceType={deviceType} rootState={rootState} setRootState={setRootState} />
      )
    }
  ]

  const styleProps = {
    title: { fontSize: deviceType.isSmartphone ? 14 : 18 },
    headStyle: { minHeight: deviceType.isSmartphone ? 30 : 40 },
    tabButton: {
      color: '#188EFF',
      borderColor: '#188EFF',
      backgroundColor: 'white',
      fontSize: deviceType.isSmartphone ? 14 : 16,
      marginBottom: deviceType.isSmartphone ? 3 : 0
    },
    nftIcon: {
      borderRadius: 5,
      marginLeft: deviceType.isSmartphone ? -10 : -15,
      marginTop: deviceType.isSmartphone ? -0 : -3,
      width: 25,
      height: 25
    }
  }

  return (
    <>
      <Card
        size='small'
        title={<span style={styleProps.title}>👇 Start Here: Setup & Config</span>}
        headStyle={styleProps.headStyle}
      >
        <Tabs
          disabled={true}
          activeKey={rootState.activeRulesTab}
          size='small'
          tabBarGutter={deviceType.isSmartphone ? 15 : 20}
          onTabClick={(key) => setRootState({ activeRulesTab: key })}
          tabBarExtraContent={renderTabBarExtraContent()}
          items={tabItems}
        />
      </Card>
      {rootState.distributeTo === Enums.values.NFT ? (
        <DeSoNFTSearchModal
          isOpen={rootState.openNftSearch}
          deviceType={deviceType}
          publicKey={desoData.profile.publicKey}
          rootState={rootState}
          onConfirmNFT={onConfirmNFT}
          onCancelNFT={handleCancelNFT}
        />
      ) : null}
      {rootState.distributeTo === Enums.values.CUSTOM ? (
        <DeSoUserSearchModal
          isOpen={rootState.customListModal.isOpen}
          deviceType={deviceType}
          publicKey={desoData.profile.publicKey}
          rootState={rootState}
          onConfirm={onConfirmCustomList}
          onCancel={handleCancelCustomList}
        />
      ) : null}
      {rootState.distributeTo === Enums.values.EMPTY_STRING ? (
        <SelectTemplateModal
          isOpen={rootState.selectTemplateModal.isOpen}
          templates={distributionTemplates}
          onSelectTemplate={onSelectTemplate}
          onCancel={handleCancelTemplateModal}
        />
      ) : null}
    </>
  )
}

export default SetupCard
