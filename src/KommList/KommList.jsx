import  {useQuery} from '@tanstack/react-query'
  
  export function KommList() {
    const { isPending, error, data } = useQuery({
      queryKey: ['repoData'],
      queryFn: () =>
        fetch('https://data.brreg.no/enhetsregisteret/api/kommuner?size=1000').then((res) =>
          res.json(),
        ),
    })
  
    if (isPending) return 'Loading...'
  
    if (error) return 'An error has occurred: ' + error.message
    
    return (
      <div>
        <ul>
          {data._embedded.kommuner
            .map((by) => by.navn)
            .sort((a, b) => a.localeCompare(b,'nb-NO'))
            .map((navn, index) => (
              <li key={index}>{navn}</li>
            ))}
        </ul>
      </div>
    )
}  