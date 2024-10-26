import { FC } from 'react'
import { PageTitle } from '../../../_metronic/layout/core'
// import { BuilderPage } from './BuilderPage.jsx'
import { BuilderPage } from './BuilderPage';
import { AddWebsite } from './AddWebsite';
import { Route, Routes } from 'react-router-dom';
import { UpdateWebsite } from './UpdateWebsite';
import { WebsiteUrlpage } from './WebsiteUrlpage';
import { AddWebsiteUrl } from './AddWebsiteUrl';
import { UpdateWebsiteUrl } from './UpdateWebsiteUrl';

const WebsitesUrlPageWrapper = () => {
  return (
    <>
      <PageTitle breadcrumbs={[]}>Layout Builder</PageTitle>
      <Routes>
        <Route path="/" element={<WebsiteUrlpage />} />
        <Route path="add-WebsiteUrl" element={<AddWebsiteUrl />}/>
        <Route path='update-websiteUrl/:id' element={<UpdateWebsiteUrl/>}/> 
      </Routes>
    </>
  )
}

export default WebsitesUrlPageWrapper
