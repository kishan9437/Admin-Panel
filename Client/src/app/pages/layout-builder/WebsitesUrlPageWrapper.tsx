import { PageTitle } from '../../../_metronic/layout/core'
import { Route, Routes } from 'react-router-dom';
import { WebsiteUrlpage } from './WebsiteUrlpage';

const WebsitesUrlPageWrapper = () => {
  return (
    <>
      <PageTitle breadcrumbs={[]}>Layout Builder</PageTitle>
      <Routes>
        <Route path="/" element={<WebsiteUrlpage />} />
        {/* <Route path=":id" element={<WebsiteUrlpage/>} /> */}
      </Routes>
    </>
  )
}

export default WebsitesUrlPageWrapper
