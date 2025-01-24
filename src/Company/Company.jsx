import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export function CompanyList() {
  const [inputCompanyName, setInputCompanyName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [year, setYear] = useState('');
  const [yearOptions, setYearOptions] = useState([]);
  const [selectedKommune, setSelectedKommune] = useState('');

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1999 }, (_, index) => currentYear - index);
    setYearOptions(years);
  
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
        event.preventDefault();
      }
    }
  
    document.addEventListener('keydown', handleKeyDown);
  
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  

  const { isPending: companiesPending, error: companiesError, data: companiesData } = useQuery({
    queryKey: ['companies', companyName, year, selectedKommune],
    queryFn: () =>
      fetch('https://data.brreg.no/enhetsregisteret/api/enheter?size=1000').then((res) =>
        res.json(),
      ),
  });

  const { isPending: kommunePending, error: kommuneError, data: kommuneData } = useQuery({
    queryKey: ['kommuner'],
    queryFn: () =>
      fetch('https://data.brreg.no/enhetsregisteret/api/kommuner?size=1000').then((res) =>
        res.json(),
      ),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setCompanyName(inputCompanyName);
  };

  if (companiesPending || kommunePending) return 'Loading...';
  if (companiesError || kommuneError) return 'An error has occurred: ' + (companiesError || kommuneError).message;

  const sortedKommuner = kommuneData?._embedded?.kommuner
    .map((by) => by.navn)
    .sort((a, b) => a.localeCompare(b, 'nb-NO'));

  const filteredCompanies = companiesData?._embedded?.enheter
    .filter(enhet => {
      const matchesName = enhet.navn.toLowerCase().includes(companyName.toLowerCase());
      const matchesYear = year ? new Date(enhet.stiftelsesdato).getFullYear() === parseInt(year) : true;
      const matchesKommune = selectedKommune ? enhet.forretningsadresse?.kommune === selectedKommune : true;
      return matchesName && matchesYear && matchesKommune && new Date(enhet.stiftelsesdato) >= new Date('2000-01-01');
    })
    .map((enhet) => ({
      navn: enhet.navn,
      stiftelsesdato: enhet.stiftelsesdato,
      organisasjonsnummer: enhet.organisasjonsnummer
    }))
    .sort((a, b) => a.navn.localeCompare(b.navn, 'nb-NO'));

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
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">Select Year</option>
            {yearOptions.map((yearOption) => (
              <option key={yearOption} value={yearOption}>
                {yearOption}
              </option>
            ))}
          </select>
          <select
            id="kommune"
            value={selectedKommune}
            onChange={(e) => setSelectedKommune(e.target.value)}
          >
            <option value="">Velg kommune</option>
            {sortedKommuner.map((navn, index) => (
              <option key={index} value={navn}>
                {navn}
              </option>
            ))}
          </select>
          <button type="submit">Search</button>
        </form>
      </section>

      <section id="result">
        <ul>
          {filteredCompanies.map((enhet, index) => (
            <li key={index}>{enhet.navn} || {enhet.stiftelsesdato} || {enhet.organisasjonsnummer}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
