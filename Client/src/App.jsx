// import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from '../src/context/DataCOntext';
import { AppLayout } from './layout/AppLayout';

export default function App() {
  return (

    <>
      <BrowserRouter>
        <AuthProvider>  
          <DataProvider>
            <AppLayout />
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>


   

    </>
  );
}








