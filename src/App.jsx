import './App.css'
import { CompanyList } from './Company/Company'
import {
  
  QueryClient,
  QueryClientProvider,
  } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {<CompanyList/>}
    </QueryClientProvider>
  )
}

