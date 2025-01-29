import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export function CompanyList() {
  const [inputCompanyName, setInputCompanyName] = useState('');
  const [yearOptions, setYearOptions] = useState([]);
  const [searchParams, setSearchParams] = useState({ companyName: '', year: '', kommuneNumber: '' });
  
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1999 }, (_, index) => currentYear - index);
    setYearOptions(years);
  }, []);

  const { isPending, error, data, refetch } = useQuery({
    queryKey: ['companies', searchParams],
    queryFn: () => {
      let url = 'https://data.brreg.no/enhetsregisteret/api/enheter?size=1000';
      if (searchParams.companyName) url += `&navn=${encodeURIComponent(searchParams.companyName)}`;
      if (searchParams.year) url += `&fraStiftelsesdato=${searchParams.year}-01-01&tilStiftelsesdato=${searchParams.year}-12-31`;
      if (searchParams.kommuneNumber) {
        url += `&kommunenummer=${searchParams.kommuneNumber}`;
      }
      return fetch(url).then((res) => res.json());
    },
    enabled: true,
  });
 
  const { data: kommuneData } = useQuery({
    queryKey: ['kommuner'],
    queryFn: () =>
      fetch('https://data.brreg.no/enhetsregisteret/api/kommuner?size=1000').then((res) =>
        res.json(),
      ),
  });
 

  const handleSearch = (e) => {
    e.preventDefault();
    console.log(kommuneData)
    const selectedKommune = kommuneData.find(k => k.navn === document.getElementById('kommune').value);
    console.log(selectedKommune)
    setSearchParams({
      companyName: inputCompanyName,
      year: document.getElementById('year').value,
      kommuneNumber: selectedKommune ? selectedKommune.nummer : ''
    });
    
    refetch();
    
  };

  
  if (isPending) return 'Loading...';
  if (error) return 'An error has occurred: ' + error.message;

  const sortedKommuner = kommuneData?._embedded?.kommuner
    .sort((a, b) => a.navn.localeCompare(b.navn, 'nb-NO')) || [];

    const filteredCompanies = data?._embedded?.enheter
    .filter(enhet => new Date(enhet.stiftelsesdato) >= new Date('2000-01-01'))
    .map((enhet) => ({
      navn: enhet.navn,
      stiftelsesdato: enhet.stiftelsesdato,
      organisasjonsnummer: enhet.organisasjonsnummer,
      kommune: enhet.forretningsadresse?.kommune || 'N/A'  // Add this line
    }))
    .sort((a, b) => a.navn.localeCompare(b.navn, 'nb-NO')) || [];
  

  return (
    <div>
      <section id="search-section">
        <form id="search" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Company Name"
            value={inputCompanyName}
            onChange={(e) => setInputCompanyName(e.target.value)}
          />
          <select id="year">
            <option value="">Select Year</option>
            {yearOptions.map((yearOption) => (
              <option key={yearOption} value={yearOption}>
                {yearOption}
              </option>
            ))}
          </select>
          <select
            id="kommune"
            onChange={(e) => {
              const selectedKommune = kommuneData.find(k => k.navn === e.target.value);
              setSearchParams(prev => ({
                ...prev,
                kommuneNumber: selectedKommune ? selectedKommune.nummer : ''
              }));
            }}
          >
            <option value="">Velg kommune</option>
            {sortedKommuner.map((kommune) => (
              <option key={kommune.nummer} value={kommune.navn}>
                {kommune.navn}
              </option>
            ))}
          </select>
          <button type="submit">Search</button>
        </form>
      </section>

      <section id="result">
        <div className="company-list">
          <div className="column">
            <h5>Company Name</h5>
            <ul>
              {filteredCompanies.map((company) => (
                <li key={`name-${company.organisasjonsnummer}`}>{company.navn}</li>
              ))}
            </ul>
          </div>
          
          <div className="column">
            <h5>Establishment Date</h5>
            <ul>
              {filteredCompanies.map((company) => (
                <li key={`date-${company.organisasjonsnummer}`}>{company.stiftelsesdato}</li>
              ))}
            </ul>
          </div>
          
          <div className="column">
            <h5>Organization Number</h5>
            <ul>
              {filteredCompanies.map((company) => (
                <li key={`org-${company.organisasjonsnummer}`}>{company.organisasjonsnummer}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
