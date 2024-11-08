import { PageTitle } from '../../../_metronic/layout/core'
import { Route, Routes } from 'react-router-dom';
import { WebsiteUrlpage } from './WebsiteUrlpage';
import { AddWebsiteUrl } from './AddWebsiteUrl';
import { UpdateWebsiteUrl } from './UpdateWebsiteUrl';

const WebsitesUrlPageWrapper = () => {
  return (
    <>
      <PageTitle breadcrumbs={[]}>Layout Builder</PageTitle>
      <Routes>
        <Route path="/" element={<WebsiteUrlpage />} />
        <Route path=":id" element={<WebsiteUrlpage/>} />
        <Route path="add-WebsiteUrl" element={<AddWebsiteUrl />}/>
        <Route path='update-websiteUrl/:id' element={<UpdateWebsiteUrl/>}/> 
      </Routes>
    </>
  )
}

export default WebsitesUrlPageWrapper
