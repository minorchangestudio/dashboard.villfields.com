"use client"
import React, { useEffect, useState } from 'react'
import { useApiClient } from '@/lib/axios';

const page = () => {

    const apiClient = useApiClient();


    useEffect(() => {
        const fetchUsers = async () => {
            const response = await apiClient.get('/api/v1/users');
            console.log(response.data);
            // setUsers(response.data);
        }
        fetchUsers();
    }, []);


  return (
    <div>
      
    </div>
  )
}

export default page
