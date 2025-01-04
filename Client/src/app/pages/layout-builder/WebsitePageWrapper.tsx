import { FC } from 'react'
import { PageTitle } from '../../../_metronic/layout/core'
import  {WebsitePage}  from './WebsitePage';
import { Route, Routes } from 'react-router-dom';

const WebsitePageWrapper = () => {
  return (
    <>
      <PageTitle breadcrumbs={[]}>Layout Builder</PageTitle>
      <Routes>
        <Route path="/" element={<WebsitePage />} />
      </Routes>
    </>
  )
}

export default WebsitePageWrapper
