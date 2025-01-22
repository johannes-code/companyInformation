import  {useQuery} from '@tanstack/react-query'
  
  export function CompanyList() {
    const { isPending, error, data } = useQuery({
      queryKey: ['repoData'],
      queryFn: () =>
        fetch('https://data.brreg.no/enhetsregisteret/api/enheter?size=1000').then((res) =>
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
    .filter(enhet => new Date(enhet.stiftelsesdato) >= new Date('2000-01-01'))
  .map((enhet) => ({
    navn: enhet.navn,
    stiftelsesdato: enhet.stiftelsesdato,
    organisasjonsnummer: enhet.organisasjonsnummer
  }))
  .sort((a, b) => a.navn.localeCompare(b.navn, 'nb-NO'))
  .map((enhet, index) => (
    <li key={index}>{enhet.navn} || {enhet.stiftelsesdato} || {enhet.organisasjonsnummer}</li>
  ))
}



            
        </ul>
      
      </div>
    )
}  