import React, { createContext, useContext, useReducer, useCallback } from 'react';
import * as db from '../database/db';

const ArisanContext = createContext();

const initialState = {
  arisans: [],
  currentArisan: null,
  members: [],
  payments: [],
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_ARISANS':
      return { ...state, loading: false, arisans: action.payload };
    case 'SET_CURRENT_ARISAN':
      return {
        ...state,
        loading: false,
        currentArisan: action.payload,
        members: action.payload?.members || [],
        payments: action.payload?.payments || [],
      };
    case 'ADD_ARISAN':
      return { ...state, loading: false, arisans: [...state.arisans, action.payload] };
    case 'REMOVE_ARISAN':
      return { ...state, loading: false, arisans: state.arisans.filter(a => a.id !== action.payload) };
    default:
      return state;
  }
}

export function ArisanProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchArisans = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const rows = await db.getArisans();
      const enriched = await Promise.all(
        rows.map(async (a) => {
          const members = await db.getMembers(a.id);
          return { ...a, memberCount: members.filter(m => m.isActive).length };
        })
      );
      dispatch({ type: 'SET_ARISANS', payload: enriched });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const fetchArisan = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const data = await db.getArisan(id);
      dispatch({ type: 'SET_CURRENT_ARISAN', payload: data });
      return data;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      return null;
    }
  }, []);

  const createArisan = useCallback(async (data) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      await db.createArisan(data);
      await fetchArisans();
      return true;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      return false;
    }
  }, [fetchArisans]);

  const deleteArisan = useCallback(async (id) => {
    try {
      await db.deleteArisan(id);
      dispatch({ type: 'REMOVE_ARISAN', payload: id });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const joinArisan = useCallback(async (data) => {
    try {
      await db.joinArisan(data);
      return true;
    } catch (err) {
      throw err;
    }
  }, []);

  const drawWinner = useCallback(async (id) => {
    try {
      const result = await db.drawWinner(id);
      await fetchArisan(id);
      return result;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      return null;
    }
  }, [fetchArisan]);

  const payContribution = useCallback(async ({ memberId, arisanId, period, amount }) => {
    try {
      await db.payContribution({ memberId, arisanId, period, amount });
      return true;
    } catch (err) {
      throw err;
    }
  }, []);

  return (
    <ArisanContext.Provider value={{
      ...state,
      fetchArisans,
      fetchArisan,
      createArisan,
      deleteArisan,
      joinArisan,
      drawWinner,
      payContribution,
    }}>
      {children}
    </ArisanContext.Provider>
  );
}

export function useArisan() {
  const context = useContext(ArisanContext);
  if (!context) {
    throw new Error('useArisan harus digunakan di dalam ArisanProvider');
  }
  return context;
}
