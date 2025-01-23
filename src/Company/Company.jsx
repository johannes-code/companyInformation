import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export function CompanyList() {
  const [inputCompanyName, setInputCompanyName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [year, setYear] = useState('');
  const [yearOptions, setYearOptions] = useState([]);

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

  const { isPending, error, data } = useQuery({
    queryKey: ['repoData', companyName, year],
    queryFn: () =>
      fetch('https://data.brreg.no/enhetsregisteret/api/enheter?size=1000').then((res) =>
        res.json(),
      ),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setCompanyName(inputCompanyName);
  };

  if (isPending) return 'Loading...';
  if (error) return 'An error has occurred: ' + error.message;

  const filteredCompanies = data?._embedded?.enheter
    .filter(enhet => {
      const matchesName = enhet.navn.toLowerCase().includes(companyName.toLowerCase());
      const matchesYear = year ? new Date(enhet.stiftelsesdato).getFullYear() === parseInt(year) : true;
      return matchesName && matchesYear && new Date(enhet.stiftelsesdato) >= new Date('2000-01-01');
    })
    .map((enhet) => ({
      navn: enhet.navn,
      stiftelsesdato: enhet.stiftelsesdato,
      organisasjonsnummer: enhet.organisasjonsnummer
    }))
    .sort((a, b) => a.navn.localeCompare(b.navn, 'nb-NO'));

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Company Name"
          value={inputCompanyName}
          onChange={(e) => setInputCompanyName(e.target.value)}
        />
        <select
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
        <button type="submit">Search</button>
      </form>
      <ul>
        {filteredCompanies.map((enhet, index) => (
          <li key={index}>{enhet.navn} || {enhet.stiftelsesdato} || {enhet.organisasjonsnummer}</li>
        ))}
      </ul>
    </div>
  );
}

export function KommList() {
  const [selectedKommune, setSelectedKommune] = useState('');

  const { isPending, error, data } = useQuery({
    queryKey: ['repoData'],
    queryFn: () =>
      fetch('https://data.brreg.no/enhetsregisteret/api/kommuner?size=1000').then((res) =>
        res.json(),
      ),
  });

  if (isPending) return 'Loading...';
  if (error) return 'An error has occurred: ' + error.message;

  const sortedKommuner = data?._embedded?.kommuner
    .map((by) => by.navn)
    .sort((a, b) => a.localeCompare(b, 'nb-NO'));

  const handleKommuneChange = (event) => {
    setSelectedKommune(event.target.value);
  };

  return (
    <div>
      <select value={selectedKommune} onChange={handleKommuneChange}>
        <option value="">Velg kommune</option>
        {sortedKommuner.map((navn, index) => (
          <option key={index} value={navn}>
            {navn}
          </option>
        ))}
      </select>

      {selectedKommune && (
        <p>Du har valgt: {selectedKommune}</p>
      )}
    </div>
  );
}
