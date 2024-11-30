import { FC } from 'react'
import { PageTitle } from '../../../_metronic/layout/core'
// import { BuilderPage } from './BuilderPage.jsx'
import { BuilderPage } from './BuilderPage';
import { Route, Routes } from 'react-router-dom';
import { UpdateWebsite } from './UpdateWebsite';

const BuilderPageWrapper = () => {
  return (
    <>
      <PageTitle breadcrumbs={[]}>Layout Builder</PageTitle>
      <Routes>
        <Route path="/" element={<BuilderPage />} />
        <Route path='update-website/:id' element={<UpdateWebsite/>}/>
      </Routes>
    </>
  )
}

export default BuilderPageWrapper
