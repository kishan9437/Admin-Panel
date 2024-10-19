import {FC} from 'react'
import {PageTitle} from '../../../_metronic/layout/core'
import { BuilderPage } from './BuilderPage'
// import {BuilderPage} from './BuilderPage'

const BuilderPageWrapper: FC = () => {
  return (
    <>
      <PageTitle breadcrumbs={[]}>Layout Builder</PageTitle>
      {/* <BuilderPage /> */}
     <BuilderPage/>
    </>
  )
}

export default BuilderPageWrapper
