import './App.css'
import { KommList } from './Company/Company'
import { CompanyList } from './Company/Company'
import {
  
  QueryClient,
  QueryClientProvider,
  } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      { <KommList /> }
      {<CompanyList/>}
    </QueryClientProvider>
  )
}

