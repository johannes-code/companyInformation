import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export function CompanyList() {
  const [companyName, setCompanyName] = useState('');
  const [year, setYear] = useState('');
  const [yearOptions, setYearOptions] = useState([]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1999 }, (_, index) => currentYear - index);
    setYearOptions(years);
  }, []);

  const { isPending, error, data } = useQuery({
    queryKey: ['repoData', companyName, year],
    queryFn: () =>
      fetch('https://data.brreg.no/enhetsregisteret/api/enheter?size=1000').then((res) =>
        res.json(),
      ),
  });

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
      <input
        type="text"
        placeholder="Company Name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
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
      <ul>
        {filteredCompanies.map((enhet, index) => (
          <li key={index}>{enhet.navn} || {enhet.stiftelsesdato} || {enhet.organisasjonsnummer}</li>
        ))}
      </ul>
    </div>
  );
}
