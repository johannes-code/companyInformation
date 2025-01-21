import  {useQuery} from '@tanstack/react-query'
  
  export function CompanyList() {
    const { isPending, error, data } = useQuery({
      queryKey: ['repoData'],
      queryFn: () =>
        fetch('https://data.brreg.no/enhetsregisteret/api/enheter').then((res) =>
          res.json(),
        ),
    })
  
    if (isPending) return 'Loading...'
  
    if (error) return 'An error has occurred: ' + error.message
    console.log(data)
    
    return (
      <div>
        <ul>
          {data._embedded.enheter
            .map((navn) => navn.navn)
            .sort((a, b) => a.localeCompare(b,'nb-NO'))
            .map((navn, index) => (
              <li key={index}>{navn}</li>
            ))}
        </ul>
      </div>
    )
}  