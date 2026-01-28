"use client"
import React, { createContext, useEffect, useState } from 'react'
import { useApiClient } from '@/lib/axios';


export const GlobalContext = createContext();

const GlobalContextProvider = ({ children }) => {

  const apiClient = useApiClient();

  const [siteInfo, setSiteInfo] = useState(null);

  useEffect(() => {
    const fetchSiteInfo = async () => {
      const response = await apiClient.get('/site-info');
      setSiteInfo(response.data);
    }
    fetchSiteInfo();
  }, []);

  return (
    <GlobalContext.Provider value={{ siteInfo, setSiteInfo }}>
      {children}
    </GlobalContext.Provider>
  )
}

export default GlobalContextProvider
