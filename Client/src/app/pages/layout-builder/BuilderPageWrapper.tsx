import { FC } from 'react'
import { PageTitle } from '../../../_metronic/layout/core'
// import { BuilderPage } from './BuilderPage.jsx'
import { BuilderPage } from './BuilderPage';
import { AddWebsite } from './AddWebsite';
import { Route, Routes } from 'react-router-dom';

const BuilderPageWrapper = () => {
  return (
    <>
      <PageTitle breadcrumbs={[]}>Layout Builder</PageTitle>
      <Routes>
        <Route path="/" element={<BuilderPage />} />
        <Route path="add-websites" element={<AddWebsite />} />
      </Routes>
      {/* <BuilderPage /> */}
      {/* <BuilderPage />
      <AddWebsite /> */}
    </>
  )
}

export default BuilderPageWrapper
