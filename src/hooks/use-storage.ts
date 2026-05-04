import { useStorageContext } from '../context/StorageContext';

export function useStorage() {
  return useStorageContext();
}