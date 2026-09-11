import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { setCLerkTokenGetter } from '../services/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {

  // this data from clerk
  const { isSignedIn, isLoaded, userId, getToken } = useClerkAuth();

  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {

    setCLerkTokenGetter(getToken);

    return () =>{
      setCLerkTokenGetter(null);
    }

  },[getToken]);

  useEffect(() => {

    let cancelled = false;

    const fetchCurrentUser = async () => {

      if (!isLoaded) return;

      if (!isSignedIn || !userId) {

        if (!cancelled) {

          setCurrentUser(null);
          setIsLoading(false);
        }


        return;
      }
      setIsLoading(true);

      try {

        const response = await userService.getUserById(userId);

        console.log("USER ID:", userId);
        console.log("USER API RESPONSE:", response);

        if (!cancelled) {
          if (response?.clerkId !== userId) {

            throw new Error(

              `MongoDB identity mismatch. Clerk: ${userId}, MongoDb: ${response?.clerkId}`
            );
          }
          setCurrentUser(response);
        }


      } catch (error) {


        if (!cancelled) {
          console.error("Failed to load MongoDb user", {
            clerkUserId: userId,
            status: error.response?.status,
            response: error.response?.data,
          });
          setCurrentUser(null);
        }

      } finally {


        if(!cancelled){

          setIsLoading(false);
        }

        setIsLoading(false);
      }
    };
    fetchCurrentUser();

    return () => {
      cancelled = true;

    };

  }, [userId, isSignedIn, isLoaded])



  const updateCurrentUserState = (updatedUser) => {
    setCurrentUser(updatedUser);
  };


  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!isSignedIn,
        isLoading: !isLoaded || isLoading,
        userId,
        updateCurrentUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};